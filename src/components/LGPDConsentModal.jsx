import { useState } from 'react'
import { ShieldCheck, AlertTriangle } from 'lucide-react'
import { supabase, logAuditEvent } from '../lib/supabase'

export const LGPD_CONSENTS_VERSION = '2026-05-14'

const ITEMS = [
  {
    key: 'storage',
    text: 'Entendo que minhas conversas com os agentes são armazenadas em servidor para meu próprio uso futuro.',
  },
  {
    key: 'openai',
    text: 'Entendo que mensagens e textos extraídos de PDFs são enviados à OpenAI (EUA) para gerar respostas. A OpenAI declara não usar dados via API para treinar modelos.',
  },
  {
    key: 'anonymization',
    text: 'Sou responsável por anonimizar nomes, CPFs, datas de nascimento e qualquer dado identificável de pacientes antes de enviar PDFs ou descrever casos clínicos.',
  },
  {
    key: 'minors',
    text: 'Sei que dados de menores são categoria sensível pela LGPD e me comprometo a tratar com cuidado adicional, jamais expondo identificadores que permitam reconhecer a criança.',
  },
  {
    key: 'rights',
    text: 'Entendo que posso solicitar exclusão dos meus dados, exportação em JSON ou correção a qualquer momento pela área "Privacidade" da minha conta.',
  },
]

export default function LGPDConsentModal({ open, userId, onAccepted }) {
  const [checked, setChecked] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const allChecked = ITEMS.every((i) => checked[i.key])

  async function handleAccept() {
    if (!allChecked) {
      setError('Marque todos os itens para continuar.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          lgpd_consents_version: LGPD_CONSENTS_VERSION,
          lgpd_consents_accepted_at: new Date().toISOString(),
        })
        .eq('user_auth_id', userId)
      if (updateError) throw updateError
      logAuditEvent('lgpd.consents_accepted', { metadata: { version: LGPD_CONSENTS_VERSION } })
      onAccepted?.()
    } catch (e) {
      setError('Não foi possível salvar. Tente novamente em alguns instantes.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[92vh] overflow-y-auto animate-slide-up">
        <div className="px-6 py-5 border-b border-primary-50 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary-600">Confirme antes de continuar</h2>
            <p className="text-sm text-secondary mt-1">
              Como você lida com dados sensíveis (crianças em atendimento), precisamos do seu aceite
              explícito para alguns pontos da LGPD.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-3 text-sm text-text-primary">
          {ITEMS.map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-primary-200 cursor-pointer transition"
            >
              <input
                type="checkbox"
                checked={!!checked[item.key]}
                onChange={(e) => setChecked((c) => ({ ...c, [item.key]: e.target.checked }))}
                className="mt-0.5 h-4 w-4 accent-primary-600 flex-shrink-0"
              />
              <span className="leading-relaxed">{item.text}</span>
            </label>
          ))}

          <div className="flex items-start gap-2 text-xs text-secondary pt-2">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p>
              Versão {LGPD_CONSENTS_VERSION}. Se nossa política mudar materialmente, você verá esta
              tela novamente para reaceite. Detalhes em{' '}
              <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-primary-600 font-semibold hover:underline">
                Política de Privacidade
              </a>
              .
            </p>
          </div>

          {error && (
            <div className="bg-accent-error/10 text-accent-error text-sm rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={handleAccept}
            disabled={!allChecked || submitting}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Salvando...' : 'Confirmo e quero usar a plataforma'}
          </button>
        </div>
      </div>
    </div>
  )
}
