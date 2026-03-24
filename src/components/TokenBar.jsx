import { PLAN_LIMITS, CREDIT_LIMIT } from '../lib/config'
import { useAuth } from '../lib/AuthContext'

export default function TokenBar({ tokensUsed = 0 }) {
  const { profile } = useAuth()
  const planType = profile?.plan_type || 'monthly'
  const limit = PLAN_LIMITS[planType] || CREDIT_LIMIT
  const pct = Math.min((tokensUsed / limit) * 100, 100)
  const remaining = Math.max(limit - tokensUsed, 0)
  const formatted = remaining.toLocaleString('pt-BR')
  const limitFormatted = limit.toLocaleString('pt-BR')

  const barColor = pct > 80
    ? 'bg-accent-error'
    : pct > 50
      ? 'bg-accent-warning'
      : 'bg-primary-600'

  return (
    <div className="px-4 py-3">
      <p className="text-xs font-medium text-primary-600 mb-1.5">Seus créditos</p>
      <div className="w-full bg-primary-100 rounded-full h-2.5 mb-1.5">
        <div
          className={`${barColor} h-2.5 rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-secondary font-medium text-right">
        {formatted} restantes de {limitFormatted}
      </p>
    </div>
  )
}
