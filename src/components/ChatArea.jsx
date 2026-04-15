import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import * as pdfjsLib from 'pdfjs-dist'
import { Check, Copy, Menu, FileText, X, Loader2, Upload, ArrowRight } from 'lucide-react'
import { getMessages, insertMessage, callChatAI, getAgentPrompt, saveFileToChat } from '../lib/supabase'
import { getAgent, AGENTS } from '../lib/agents'
import { PDFJS_WORKER_URL } from '../lib/config'
import { useAuth } from '../lib/AuthContext'
import AgentIcon from './AgentIcon'
import Modal from './Modal'
import CreditLimitModal from './CreditLimitModal'
import PricingModal from './PricingModal'

pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ') + '\n'
  }
  return text.trim()
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// Typing effect component — reveals text progressively then renders full markdown
function TypewriterText({ text, speed = 12, onDone }) {
  const [charIndex, setCharIndex] = useState(0)
  const [done, setDone] = useState(false)
  const requestRef = useRef(null)
  const lastTimeRef = useRef(0)

  useEffect(() => {
    setCharIndex(0)
    setDone(false)
    lastTimeRef.current = 0
  }, [text])

  useEffect(() => {
    if (done) return

    function animate(timestamp) {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const elapsed = timestamp - lastTimeRef.current

      if (elapsed >= speed) {
        const charsToAdd = Math.max(1, Math.floor(elapsed / speed))
        setCharIndex(prev => {
          const next = prev + charsToAdd
          if (next >= text.length) {
            setDone(true)
            return text.length
          }
          return next
        })
        lastTimeRef.current = timestamp
      }

      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current)
  }, [text, speed, done])

  // Call onDone in a separate effect to avoid setState-during-render warning
  useEffect(() => {
    if (done) onDone?.()
  }, [done])

  if (done) {
    return (
      <div className="markdown-content text-sm">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    )
  }

  // While typing, show plain text with a blinking cursor
  const visible = text.slice(0, charIndex)
  return (
    <div className="text-sm whitespace-pre-wrap leading-relaxed">
      {visible}
      <span className="inline-block w-0.5 h-4 bg-primary-600 animate-pulse ml-0.5 align-text-bottom" />
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 absolute -bottom-6 right-0 text-xs text-secondary hover:text-primary-600 flex items-center gap-1 transition"
      title="Copiar"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copiar
        </>
      )}
    </button>
  )
}

const THINKING_MESSAGES = {
  psico: [
    'Pensando na sessão...',
    'Refletindo sobre o caso...',
    'Organizando o plano terapêutico...',
    'Estruturando a abordagem...',
    'Considerando as técnicas...',
    'Elaborando as etapas...',
  ],
  marketing: [
    'Buscando ideias...',
    'Criando o conteúdo...',
    'Pensando na estratégia...',
    'Elaborando o texto...',
    'Desenvolvendo a narrativa...',
    'Refinando a mensagem...',
  ],
  customerAcquisition: [
    'Analisando o perfil...',
    'Montando a estratégia...',
    'Pensando nas abordagens...',
    'Identificando oportunidades...',
    'Estruturando o plano...',
    'Avaliando os canais...',
  ],
  default: [
    'Pensando...',
    'Elaborando resposta...',
    'Analisando...',
    'Processando...',
    'Organizando ideias...',
  ],
}

export default function ChatArea({ chat, onOpenSidebar, onChatsChange }) {
  const { user, profile, refreshTokenUsage } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [errorModal, setErrorModal] = useState(null)
  const [showCreditLimit, setShowCreditLimit] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [thinkingTime, setThinkingTime] = useState(0)
  const [thinkingMessage, setThinkingMessage] = useState('')
  const [typingMessageId, setTypingMessageId] = useState(null)
  const [attachedFile, setAttachedFile] = useState(null) // { name, text }
  const [messagesWithFile, setMessagesWithFile] = useState({}) // { msgId: filename }
  const [uploadingFile, setUploadingFile] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const thinkingTimerRef = useRef(null)

  const agent = chat ? getAgent(chat.agent_type) : null
  const userName = profile?.fullname?.split(' ')[0] || 'Psicóloga'

  useEffect(() => {
    if (!chat) {
      setMessages([])
      setAttachedFile(null)
      return
    }
    loadMessages()
    // Load existing file attachment from chat
    if (chat.attached_file_name && chat.attached_file_text) {
      setAttachedFile({ name: chat.attached_file_name, text: chat.attached_file_text })
    } else {
      setAttachedFile(null)
    }
  }, [chat?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (loading) {
      setThinkingTime(0)
      thinkingTimerRef.current = setInterval(() => {
        setThinkingTime(prev => prev + 1)
      }, 1000)

      // Rotating thinking messages
      const agentId = chat?.agent_type || 'default'
      const msgs = THINKING_MESSAGES[agentId] || THINKING_MESSAGES.default
      const random = () => msgs[Math.floor(Math.random() * msgs.length)]
      setThinkingMessage(random())
      let last = ''
      const msgInterval = setInterval(() => {
        let next
        do { next = random() } while (next === last && msgs.length > 1)
        last = next
        setThinkingMessage(next)
      }, 2500)

      return () => {
        clearInterval(thinkingTimerRef.current)
        clearInterval(msgInterval)
      }
    } else {
      clearInterval(thinkingTimerRef.current)
      setThinkingTime(0)
    }
    return () => clearInterval(thinkingTimerRef.current)
  }, [loading, chat?.agent_type])

  async function loadMessages() {
    setLoadingMessages(true)
    try {
      const msgs = await getMessages(chat.id)
      setMessages(msgs)
    } catch (err) {
      // Fallback: lista de mensagens vazia
    } finally {
      setLoadingMessages(false)
    }
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setErrorModal({ title: 'Formato inválido', message: 'Apenas arquivos PDF são aceitos.' })
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorModal({ title: 'Arquivo muito grande', message: 'O tamanho máximo é 20MB.' })
      return
    }

    setUploadingFile(true)
    try {
      const text = await extractTextFromPDF(file)
      if (!text || text.length < 10) {
        setErrorModal({ title: 'PDF sem texto', message: 'Não foi possível extrair texto deste PDF. Ele pode ser uma imagem escaneada.' })
        return
      }
      setAttachedFile({ name: file.name, text })

      // Save to Supabase if we have a chat
      if (chat?.id) {
        await saveFileToChat(chat.id, user.id, file, text)
      }
    } catch (err) {
      // errorModal é exibido abaixo
      setErrorModal({ title: 'Erro ao ler PDF', message: 'Não foi possível processar este arquivo.' })
    } finally {
      setUploadingFile(false)
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading || !chat) return

    // Capture file context BEFORE any setState
    const currentFileContext = attachedFile?.text || chat?.attached_file_text || null
    const currentFileName = attachedFile?.name || chat?.attached_file_name || null

    // Clear input and file preview immediately
    setInput('')
    const hadFile = !!attachedFile
    if (hadFile) setAttachedFile(null)
    setLoading(true)

    const tempMsgId = 'temp-user-' + Date.now()
    const tempUserMsg = {
      id: tempMsgId,
      chat_id: chat.id,
      message: text,
      sender: 'human',
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMsg])

    // Track that this message had a file attached
    if (hadFile && currentFileName) {
      setMessagesWithFile(prev => ({ ...prev, [tempMsgId]: currentFileName }))
    }

    try {
      await insertMessage(chat.id, user.id, text, 'human')
      const prompt = await getAgentPrompt(chat.agent_type)
      const isFirstMessage = messages.length === 0

      await callChatAI({
        chatId: chat.id,
        userMessage: text,
        prompt,
        createTitle: isFirstMessage,
        fileContext: currentFileContext,
      })

      const freshMessages = await getMessages(chat.id)
      setMessages(freshMessages)

      // Find the newest agent message and animate it
      const lastAgentMsg = [...freshMessages].reverse().find(m => m.sender === 'agent')
      if (lastAgentMsg) {
        setTypingMessageId(lastAgentMsg.id)
      }

      refreshTokenUsage()

      if (isFirstMessage) {
        onChatsChange()
      }
    } catch (err) {
      // Modais de erro são exibidos abaixo conforme o tipo

      if (err.type === 'subscription_required') {
        setShowPricing(true)
      } else if (err.type === 'token_limit_reached') {
        setShowCreditLimit(true)
      } else {
        setErrorModal({
          title: 'Erro ao enviar mensagem',
          message: 'Ocorreu um erro ao processar sua mensagem. Tente novamente.',
          icon: 'error',
        })
      }

      await loadMessages()
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Empty state with personalized greeting
  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-chat p-6">
        <div className="text-center max-w-lg animate-slide-up">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary-600 mb-3 leading-tight">
            Olá {userName}, como podemos te ajudar?
          </h2>
          <p className="text-secondary mb-10">
            Escolha um de nossos agentes para começar uma conversa
          </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {AGENTS.map(a => (
              <button
                key={a.id}
                onClick={onOpenSidebar}
                className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 text-left group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: a.color + '15' }}
                >
                  <AgentIcon icon={a.icon} size={20} className="transition-colors" style={{ color: a.color }} />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{a.label}</h3>
                <p className="text-xs text-secondary leading-relaxed">{a.description}</p>
              </button>
            ))}
          </div>

                    <button
            onClick={onOpenSidebar}
            className="md:hidden bg-primary-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button"
          >
            Escolher agente
          </button>

                    <p className="text-xs text-secondary/60 mt-8">
            © 2026 ColméIA Infantil. Todos os Direitos Reservados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-chat min-w-0">
            <header className="bg-white/90 backdrop-blur-md border-b border-primary-50 px-5 py-3 flex items-center gap-3 flex-shrink-0">
                <button onClick={onOpenSidebar} className="md:hidden text-secondary hover:text-primary-600 transition">
          <Menu className="w-6 h-6" />
        </button>

        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: (agent?.color || '#69080b') + '15' }}
        >
          <AgentIcon icon={agent?.icon} size={16} style={{ color: agent?.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-primary-600">{agent?.label}</span>
        </div>

      </header>

            <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 xl:px-[15%] py-6 space-y-6">
        {loadingMessages && messages.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-sm text-secondary">Carregando mensagens...</p>
            </div>
          </div>
        )}

        {!loadingMessages && messages.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: (agent?.color || '#69080b') + '15' }}
            >
              <AgentIcon icon={agent?.icon} size={24} style={{ color: agent?.color }} />
            </div>
            <p className="text-secondary font-medium">Agente selecionado!</p>
            <p className="text-sm text-secondary/70 mt-1">Digite uma mensagem para iniciar a conversa.</p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`message-appear flex ${msg.sender === 'human' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`relative group max-w-[85%] md:max-w-[500px] ${msg.sender !== 'human' ? 'pb-6' : ''}`}>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  msg.sender === 'human'
                    ? 'bg-white text-text-primary rounded-br-md shadow-sm'
                    : 'bg-white border border-primary-100 text-text-primary rounded-bl-md shadow-sm'
                }`}
              >
                {msg.sender === 'human' ? (
                  <>
                    {messagesWithFile[msg.id] && (
                      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100">
                        <FileText className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        <span className="text-xs text-primary-600 font-medium truncate">{messagesWithFile[msg.id]}</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </>
                ) : msg.id === typingMessageId ? (
                  <TypewriterText
                    text={msg.message}
                    speed={12}
                    onDone={() => setTypingMessageId(null)}
                  />
                ) : (
                  <div className="markdown-content text-sm">
                    <ReactMarkdown>{msg.message}</ReactMarkdown>
                  </div>
                )}
                <p className={`text-[10px] mt-1.5 ${
                  msg.sender === 'human' ? 'text-secondary/50 text-right' : 'text-secondary/50'
                }`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>

              {msg.sender !== 'human' && (
                <CopyButton text={msg.message} />
              )}
            </div>
          </div>
        ))}

                {loading && (
          <div className="flex justify-start message-appear">
            <div className="bg-white border border-primary-100 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="thinking-dot w-2 h-2 bg-primary-400 rounded-full inline-block"></span>
                  <span className="thinking-dot w-2 h-2 bg-primary-400 rounded-full inline-block"></span>
                  <span className="thinking-dot w-2 h-2 bg-primary-400 rounded-full inline-block"></span>
                </div>
                <span className="text-xs text-secondary transition-all duration-500">
                  {thinkingMessage}
                  {thinkingTime >= 8 && ` ${thinkingTime}s`}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

            <div className="px-4 md:px-8 lg:px-16 xl:px-[15%] pb-4 pt-2 flex-shrink-0">
        <div className="bg-white rounded-3xl shadow-card px-5 py-3 max-w-3xl mx-auto">
                    {attachedFile && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-xl mb-2">
              <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <span className="text-sm text-primary-600 font-medium truncate flex-1">{attachedFile.name}</span>
              <span className="text-[10px] text-secondary flex-shrink-0">
                {(attachedFile.text.length / 1000).toFixed(0)}k chars
              </span>
              <button
                onClick={() => setAttachedFile(null)}
                className="text-secondary hover:text-accent-error transition flex-shrink-0"
                title="Remover arquivo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={attachedFile ? "Pergunte algo sobre o documento..." : "Faça uma pergunta..."}
            rows={1}
            className="w-full resize-none border-none px-0 py-1 text-sm outline-none text-text-primary placeholder:text-secondary/50 bg-transparent max-h-32 leading-relaxed"
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
                            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
                            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile || loading}
                className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition disabled:opacity-50"
                title="Anexar PDF"
              >
                {uploadingFile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
            >
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-secondary/40 text-center mt-2">
          © 2026 ColméIA Infantil. Todos os Direitos Reservados.
        </p>
      </div>

            <Modal
        open={!!errorModal}
        onClose={() => setErrorModal(null)}
        title={errorModal?.title}
      >
        <p className="text-text-secondary mb-5">{errorModal?.message}</p>
        <button
          onClick={() => setErrorModal(null)}
          className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button"
        >
          Entendi
        </button>
      </Modal>

            <CreditLimitModal
        open={showCreditLimit}
        onClose={() => setShowCreditLimit(false)}
      />

            <PricingModal
        open={showPricing}
        onClose={() => setShowPricing(false)}
      />
    </div>
  )
}
