import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import PricingModal from './PricingModal'

export default function SubscriptionGate({ children }) {
  const { isSubscribed, profile, loading } = useAuth()
  const [showPricing, setShowPricing] = useState(false)

  // Still loading or subscribed — render children normally
  if (loading || isSubscribed) return children

  // Not subscribed — show overlay on top of children
  return (
    <>
      {children}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center animate-slide-up">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Assinatura necessária</h2>
          <p className="text-text-secondary mb-6">
            Para usar os agentes de IA da PsicoAmina, escolha um plano de assinatura. Você pode visualizar seus chats anteriores, mas precisa de uma assinatura ativa para enviar novas mensagens.
          </p>
          <button
            onClick={() => setShowPricing(true)}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button"
          >
            Ver planos
          </button>
        </div>
      </div>

      <PricingModal
        open={showPricing}
        onClose={() => setShowPricing(false)}
      />
    </>
  )
}
