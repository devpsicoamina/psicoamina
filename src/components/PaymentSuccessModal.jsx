import { Check } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getPaymentPlan, clearPaymentParams } from '../lib/demo'
import { PLAN_LIMITS } from '../lib/config'

export default function PaymentSuccessModal({ open, onClose }) {
  const { profile, refreshProfile } = useAuth()

  if (!open) return null

  const plan = getPaymentPlan() || profile?.plan_type || 'monthly'
  const credits = PLAN_LIMITS[plan] || PLAN_LIMITS.monthly
  const planLabel = plan === 'yearly' ? 'Anual' : 'Mensal'
  const userName = profile?.fullname?.split(' ')[0] || 'Psicóloga'

  function handleClose() {
    clearPaymentParams()
    refreshProfile()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10 animate-slide-up p-8 text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-accent-teal/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check className="w-10 h-10 text-accent-teal" strokeWidth={2.5} />
        </div>

        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Assinatura ativada!
        </h2>
        <p className="text-text-secondary mb-6">
          Bem-vinda ao PsicoAmina, {userName}! Seus créditos já estão disponíveis.
        </p>

        {/* Plan details card */}
        <div className="bg-primary-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-primary-600">Plano {planLabel}</span>
            <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full font-medium">Ativo</span>
          </div>
          <p className="text-sm text-text-secondary">
            {credits.toLocaleString('pt-BR')} créditos/mês disponíveis
          </p>
        </div>

        <button
          onClick={handleClose}
          className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button"
        >
          Começar a usar
        </button>
      </div>
    </div>
  )
}
