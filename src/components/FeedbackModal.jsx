import { useState, useEffect } from 'react'
import { MessageCircle, Bug, Lightbulb, Heart, X, Sparkles } from 'lucide-react'
import { supabase, logAuditEvent } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

const TYPES = [
  { id: 'geral', label: 'Geral', icon: MessageCircle, color: '#249689' },
  { id: 'sugestao', label: 'Sugestão', icon: Lightbulb, color: '#d7a53c' },
  { id: 'bug', label: 'Bug', icon: Bug, color: '#FF5963' },
  { id: 'elogio', label: 'Elogio', icon: Heart, color: '#69080b' },
]

const TRIGGER_HEADLINES = {
  '10msgs': 'Como tá sendo sua experiência até aqui?',
  '3logins': 'Bem-vinda de volta — o que tá achando?',
  '10logins': 'Você tá usando bastante. Que tal contar pra gente?',
  manual: 'Compartilhe seu feedback',
}

const TRIGGER_SUBHEADS = {
  '10msgs': 'Você já conversou com nossos agentes algumas vezes. Tem algo que poderia ser melhor?',
  '3logins': 'Em poucas palavras, o que você gostaria de ver melhorado ou que tá funcionando bem?',
  '10logins': 'Suas observações vão direto pra pessoa que desenvolve a plataforma. Manda ver.',
  manual: 'Conta o que você está achando, sugerindo, ou se encontrou algum bug.',
}

export default function FeedbackModal({ open, onClose, source = 'manual' }) {
  const [type, setType] = useState('geral')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setType('geral')
      setMessage('')
      setSubmitting(false)
      setSubmitted(false)
      setError('')
    }
  }, [open])

  async function handleSubmit() {
    setError('')
    const msg = message.trim()
    if (msg.length < 3) {
      setError('Escreva pelo menos algumas palavras.')
      return
    }
    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('no_session')
      const res = await fetch(`${SUPABASE_URL}/functions/v1/feedback-submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, message: msg, source }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `http_${res.status}`)
      }
      logAuditEvent('feedback.submitted', { metadata: { type, source } })
      setSubmitted(true)
      setTimeout(() => {
        onClose()
      }, 2200)
    } catch (e) {
      setError('Não foi possível enviar agora. Tenta novamente em alguns segundos.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDismiss() {
    // Pra triggers automáticos, marcar como dismissed no banco
    if (source !== 'manual') {
      try {
        await supabase.rpc('dismiss_feedback_trigger', { p_trigger: source.replace('modal-', '') })
      } catch {}
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-primary-50 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-primary-600 leading-tight">
              {TRIGGER_HEADLINES[source] ?? TRIGGER_HEADLINES.manual}
            </h2>
            <p className="text-sm text-secondary mt-1">
              {TRIGGER_SUBHEADS[source] ?? TRIGGER_SUBHEADS.manual}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-text-primary p-1 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-accent-teal/15 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-accent-teal" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-1">Recebido, obrigado!</h3>
            <p className="text-sm text-secondary">
              Seu feedback foi enviado. A gente lê tudo que chega.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-secondary mb-2">
                Tipo
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TYPES.map((t) => {
                  const Icon = t.icon
                  const active = type === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition ${
                        active
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-100 hover:border-primary-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" style={{ color: active ? '#69080b' : t.color }} />
                      <span className={`text-xs font-medium ${active ? 'text-primary-600' : 'text-text-primary'}`}>
                        {t.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-secondary mb-2">
                Mensagem
              </label>
              <textarea
                value={message}
                onChange={(e) => { setMessage(e.target.value); setError('') }}
                rows={5}
                maxLength={5000}
                placeholder={
                  type === 'bug'
                    ? 'Conta o que aconteceu, em qual tela e o que você esperava que acontecesse.'
                    : type === 'sugestao'
                    ? 'O que você gostaria que existisse ou funcionasse diferente?'
                    : type === 'elogio'
                    ? 'O que tá funcionando bem? :)'
                    : 'Escreva o que quiser compartilhar.'
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-text-primary placeholder:text-secondary/60 focus:outline-none focus:border-primary-600 transition resize-none"
              />
              <p className="text-xs text-secondary mt-1.5 text-right">
                {message.length}/5000
              </p>
            </div>

            {error && (
              <div className="bg-accent-error/10 text-accent-error text-sm rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDismiss}
                className="flex-1 border-2 border-gray-200 text-text-primary py-3 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Agora não
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || message.trim().length < 3}
                className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
