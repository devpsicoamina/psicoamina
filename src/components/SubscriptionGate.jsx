import { useState } from 'react'
import { Lock, LogOut } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { signOut, logAuditEvent } from '../lib/supabase'
import PricingModal from './PricingModal'

export default function SubscriptionGate({ children }) {
  const { isSubscribed, user, loading } = useAuth()
  const [showPricing, setShowPricing] = useState(false)

  // Still loading or subscribed — render children normally
  if (loading || isSubscribed) return children

  async function handleSignOut() {
    logAuditEvent('auth.signed_out')
    try { await signOut() } catch {}
    window.location.reload()
  }

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
          {user?.email && (
            <p className="text-sm text-text-secondary mb-2">
              Logada como <span className="font-semibold text-text-primary">{user.email}</span>
            </p>
          )}
          <p className="text-base text-text-secondary mb-6">
            Para usar os agentes de IA da ColméIA, escolha um plano de assinatura.
          </p>
          <button
            onClick={() => setShowPricing(true)}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button mb-3"
          >
            Ver planos
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-primary-600 py-2 transition"
          >
            <LogOut className="w-4 h-4" />
            Sair desta conta
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
