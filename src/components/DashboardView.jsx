import { useAuth } from '../lib/AuthContext'
import { AGENTS, PLAN_LIMITS, CREDIT_LIMIT } from '../lib/agents'
import AgentIcon from './AgentIcon'

export default function DashboardView({ chats, onOpenSidebar, onNewChat }) {
  const { profile, tokenUsage } = useAuth()
  const userName = profile?.fullname?.split(' ')[0] || 'Psicóloga'
  const planType = profile?.plan_type || 'monthly'
  const limit = PLAN_LIMITS[planType] || CREDIT_LIMIT
  const used = tokenUsage?.tokens_used || 0
  const remaining = Math.max(limit - used, 0)
  const pct = Math.min((used / limit) * 100, 100)

  // Next renewal: first day of next month
  const now = new Date()
  const nextRenewal = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const renewalStr = nextRenewal.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })

  // Recent chats (last 3)
  const recentChats = chats.slice(0, 3)

  return (
    <div className="flex-1 flex items-center justify-center bg-bg-chat p-6 overflow-y-auto">
      <div className="w-full max-w-2xl animate-slide-up">
        {/* Greeting */}
        <h2 className="text-2xl md:text-3xl font-semibold text-primary-600 mb-1 leading-tight">
          Olá {userName}!
        </h2>
        <p className="text-secondary mb-8">Como podemos te ajudar hoje?</p>

        {/* Credits card */}
        <div className="bg-white rounded-2xl p-5 shadow-card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary">Seus créditos</h3>
            <span className="text-xs text-secondary">
              Renova em {renewalStr}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-primary-600">
              {remaining.toLocaleString('pt-BR')}
            </span>
            <span className="text-sm text-secondary">
              de {limit.toLocaleString('pt-BR')} restantes
            </span>
          </div>
          <div className="w-full bg-primary-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                pct > 80 ? 'bg-accent-error' : pct > 50 ? 'bg-accent-warning' : 'bg-primary-600'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {planType && (
            <p className="text-xs text-secondary mt-2">
              Plano {planType === 'yearly' ? 'anual' : 'mensal'}
            </p>
          )}
        </div>

        {/* Agent cards */}
        <h3 className="text-sm font-semibold text-text-primary mb-3">Iniciar conversa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {AGENTS.map(a => (
            <button
              key={a.id}
              onClick={() => onNewChat ? onNewChat(a.id) : onOpenSidebar()}
              className="bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 text-left group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: a.color + '15' }}
              >
                <AgentIcon icon={a.icon} size={20} style={{ color: a.color }} />
              </div>
              <h4 className="text-sm font-semibold text-text-primary mb-0.5">{a.label}</h4>
              <p className="text-xs text-secondary leading-relaxed">{a.description}</p>
            </button>
          ))}
        </div>

        {/* Recent chats */}
        {recentChats.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Conversas recentes</h3>
            <div className="space-y-2 mb-8">
              {recentChats.map(chat => {
                const agent = AGENTS.find(a => a.id === chat.agent_type)
                return (
                  <button
                    key={chat.id}
                    onClick={() => onOpenSidebar()}
                    className="w-full bg-white rounded-xl px-4 py-3 shadow-sm hover:shadow-card transition flex items-center gap-3 text-left"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (agent?.color || '#762E9F') + '15' }}
                    >
                      <AgentIcon icon={agent?.icon} size={14} style={{ color: agent?.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {chat.title || 'Novo chat'}
                      </p>
                      <p className="text-xs text-secondary">{agent?.label}</p>
                    </div>
                    <svg className="w-4 h-4 text-secondary/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Footer */}
        <p className="text-[10px] text-secondary/40 text-center">
          © 2026 PsicoAmina. Todos os Direitos Reservados.
        </p>
      </div>
    </div>
  )
}
