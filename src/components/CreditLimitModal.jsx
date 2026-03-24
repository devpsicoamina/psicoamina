import { AlertTriangle } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { PLAN_LIMITS, CREDIT_LIMIT } from '../lib/agents'

export default function CreditLimitModal({ open, onClose }) {
  const { profile } = useAuth()

  if (!open) return null

  const planType = profile?.plan_type || 'monthly'
  const limit = PLAN_LIMITS[planType] || CREDIT_LIMIT

  // Next renewal date
  const now = new Date()
  const nextRenewal = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const renewalStr = nextRenewal.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10 animate-slide-up text-center">
        <div className="w-14 h-14 bg-accent-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-accent-warning" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-2">Créditos esgotados</h2>
        <p className="text-text-secondary text-sm mb-2">
          Você utilizou todos os seus {limit.toLocaleString('pt-BR')} créditos deste mês.
        </p>
        <p className="text-text-secondary text-sm mb-6">
          Seus créditos serão renovados automaticamente em <strong className="text-primary-600">{renewalStr}</strong>.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button"
        >
          Entendi
        </button>
      </div>
    </div>
  )
}
