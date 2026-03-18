import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { PLAN_LIMITS } from '../lib/agents'

export default function PricingModal({ open, onClose }) {
  const { profile } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const plans = [
    {
      id: 'monthly',
      name: 'Mensal',
      price: 'R$ 49,90',
      period: '/mês',
      credits: PLAN_LIMITS.monthly.toLocaleString('pt-BR'),
      features: [
        '3 agentes de IA especializados',
        `${PLAN_LIMITS.monthly.toLocaleString('pt-BR')} créditos/mês`,
        'Histórico completo de conversas',
        'Suporte por email',
      ],
      badge: null,
    },
    {
      id: 'yearly',
      name: 'Anual',
      price: 'R$ 39,90',
      period: '/mês',
      totalPrice: 'R$ 478,80/ano',
      credits: PLAN_LIMITS.yearly.toLocaleString('pt-BR'),
      features: [
        'Tudo do plano mensal',
        `${PLAN_LIMITS.yearly.toLocaleString('pt-BR')} créditos/mês`,
        'Economia de 20%',
        'Suporte prioritário',
      ],
      badge: 'Mais popular',
    },
  ]

  async function handleSubscribe() {
    setLoading(true)
    try {
      // TODO: Integrate payment gateway (InfinitePay, Stripe, etc.)
      // const { checkout_url } = await createCheckoutSession(selectedPlan)
      // window.location.href = checkout_url
      alert(`Integração de pagamento em desenvolvimento.\n\nPlano selecionado: ${selectedPlan}\n\nPara ativar manualmente durante testes:\nSupabase → Table Editor → users → subscription_active = true, plan_type = "${selectedPlan}"`)
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Erro ao iniciar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl z-10 animate-slide-up overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <h2 className="text-2xl font-bold text-primary-600">Escolha seu plano</h2>
          <p className="text-secondary mt-2 text-sm">
            Desbloqueie o poder da IA para sua prática clínica
          </p>
        </div>

        {/* Plans */}
        <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
                selectedPlan === plan.id
                  ? 'border-primary-600 bg-primary-50/50 shadow-card'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary-600">{plan.price}</span>
                <span className="text-secondary text-sm">{plan.period}</span>
              </div>
              {plan.totalPrice && (
                <p className="text-xs text-secondary mt-1">{plan.totalPrice}</p>
              )}

              <ul className="mt-4 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <svg className="w-4 h-4 text-accent-teal flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Radio indicator */}
              <div className={`absolute top-5 right-5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === plan.id ? 'border-primary-600' : 'border-gray-300'
              }`}>
                {selectedPlan === plan.id && (
                  <div className="w-3 h-3 rounded-full bg-primary-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Action */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button disabled:opacity-50"
          >
            {loading ? 'Processando...' : `Assinar plano ${selectedPlan === 'monthly' ? 'mensal' : 'anual'}`}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full text-secondary text-sm hover:text-text-primary transition py-2"
            >
              Voltar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
