import { useEffect, useState } from 'react'
import {
  Users, MessageSquare, Sparkles, RefreshCw, Menu,
  DollarSign, Activity, AlertTriangle, CheckCircle2, Bug, Lightbulb, Heart, MessageCircle,
} from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase, logAuditEvent } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

const DEFAULT_BUDGET_BRL = 300
const ALERT_THRESHOLD_PCT = 80
const USD_BRL = 5.20

function brl(n) {
  return (n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
}
function fmtInt(n) {
  return (n ?? 0).toLocaleString('pt-BR')
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtRelative(iso) {
  if (!iso) return '—'
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / 86400000)
  if (days < 1) {
    const h = Math.floor(diffMs / 3600000)
    if (h < 1) return 'agora há pouco'
    return `${h}h atrás`
  }
  if (days < 30) return `${days}d atrás`
  const months = Math.floor(days / 30)
  return `${months}mo atrás`
}

export default function AdminPage({ initialTab = 'users', onOpenSidebar }) {
  const { isAdmin } = useAuth()
  const [tab, setTab] = useState(initialTab)

  useEffect(() => { setTab(initialTab) }, [initialTab])

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-chat p-8">
        <p className="text-sm text-secondary">Acesso restrito ao administrador.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-chat min-w-0 overflow-hidden">
      {/* Header (mobile mostra hamburger) */}
      <header className="bg-white/90 backdrop-blur-md border-b border-primary-50 px-4 sm:px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onOpenSidebar}
          className="md:hidden text-secondary hover:text-primary-600 transition"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-primary-600">Plataforma</h1>
        <span className="text-xs text-secondary">Painel administrativo</span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {tab === 'users' && <UsersList />}
          {tab === 'feedbacks' && <FeedbacksList />}
          {tab === 'costs' && <CostsView />}
        </div>
      </div>
    </div>
  )
}

// =====================
// UsersList (rico, estilo do print)
// =====================
function UsersList() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  async function load() {
    setLoading(true)
    try {
      const { data: r, error } = await supabase.rpc('admin_users_rich_list', { p_limit: 200 })
      if (error) throw error
      setData(r)
    } catch (e) {
      console.error('admin_users_rich_list:', e)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const rows = data?.rows ?? []
  const counts = data?.counts ?? { all: 0, active: 0, inactive: 0, admin: 0 }

  const filtered = rows.filter((u) => {
    if (filter === 'active') return u.subscription_active === true && u.role !== 'admin'
    if (filter === 'inactive') return !u.subscription_active && u.role !== 'admin'
    if (filter === 'admin') return u.role === 'admin'
    return true
  })

  function PlanBadge({ user }) {
    if (user.role === 'admin') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary-50 text-primary-600 uppercase tracking-wide">Admin</span>
    }
    if (user.subscription_active) {
      const isYearly = user.plan_type === 'yearly'
      return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide ${
        isYearly ? 'bg-accent-yellow/20 text-primary-600' : 'bg-accent-teal/10 text-accent-teal'
      }`}>{isYearly ? 'Anual' : 'Mensal'}</span>
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-text-secondary uppercase tracking-wide">Sem plano</span>
  }

  function EngagementBadge({ count, suffix, kind = 'login' }) {
    if (!count || count === 0) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-accent-error/10 text-accent-error">0 {suffix}</span>
    }
    const bg = count >= 10 ? 'bg-accent-teal/15 text-accent-teal' :
               count >= 3 ? 'bg-accent-yellow/30 text-primary-600' :
               'bg-accent-yellow/15 text-primary-600'
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${bg}`}>{count} {suffix}</span>
  }

  function WhatsApp({ phone, fullname }) {
    if (!phone) {
      return <span className="inline-flex items-center gap-1.5 text-xs text-secondary">Sem telefone</span>
    }
    const digits = phone.replace(/\D/g, '')
    const intl = digits.startsWith('55') ? digits : `55${digits}`
    const text = `Oi ${fullname?.split(' ')[0] || ''}, aqui é da ColméIA Infantil`
    return (
      <a
        href={`https://wa.me/${intl}?text=${encodeURIComponent(text)}`}
        target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-accent-teal/10 text-accent-teal hover:bg-accent-teal/20 transition"
      >
        <MessageCircle className="w-3.5 h-3.5" /> {phone}
      </a>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-text-primary">Todos usuários</h2>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-primary-100 text-secondary hover:border-primary-300 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { k: 'all', label: 'Todos', n: counts.all },
          { k: 'active', label: 'Ativos', n: counts.active },
          { k: 'inactive', label: 'Sem plano', n: counts.inactive },
          { k: 'admin', label: 'Admin', n: counts.admin },
        ].map(({ k, label, n }) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
              filter === k
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-text-primary border-primary-100 hover:border-primary-300'
            }`}
          >
            {label} <span className="opacity-70">({n})</span>
          </button>
        ))}
      </div>

      {loading && !data ? (
        <p className="text-sm text-secondary text-center py-8">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-secondary text-center py-8">Nenhum usuário neste filtro.</p>
      ) : (
        <div className="bg-white rounded-xl border border-primary-100 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-bg-alternate">
                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-secondary">
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">Plano & entrada</th>
                  <th className="px-4 py-3">Último login</th>
                  <th className="px-4 py-3">Engajamento</th>
                  <th className="px-4 py-3">Contato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {filtered.map((u) => (
                  <tr key={u.user_auth_id} className="hover:bg-bg-alternate/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-text-primary">
                          {u.fullname || '—'}
                        </span>
                        <PlanBadge user={u} />
                      </div>
                      <p className="text-xs text-secondary truncate max-w-[280px]">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-text-primary">
                        {u.subscription_active ? (u.plan_type === 'yearly' ? 'R$ 191,00' : 'R$ 19,90') : 'R$ 0,00'}
                      </p>
                      <p className="text-xs text-secondary">entrou {fmtDate(u.auth_created)}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-text-primary">{fmtDate(u.last_sign_in_at)}</p>
                      <p className="text-xs text-secondary">{fmtRelative(u.last_sign_in_at)}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1.5 flex-wrap">
                        <EngagementBadge count={u.login_count} suffix="login" />
                        <EngagementBadge count={u.msg_count} suffix="msgs" />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <WhatsApp phone={u.phone} fullname={u.fullname} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// =====================
// FeedbacksList
// =====================
function FeedbacksList() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  async function load(currentFilter = filter) {
    setLoading(true)
    try {
      const { data: r, error } = await supabase.rpc('admin_feedbacks_list', { p_filter: currentFilter, p_limit: 200 })
      if (error) throw error
      setData(r)
    } catch (e) {
      console.error('admin_feedbacks_list:', e)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load(filter) }, [filter])

  const counts = data?.counts ?? { total: 0, new: 0, bug: 0, sugestao: 0, geral: 0, elogio: 0 }
  const rows = data?.rows ?? []

  function TypeBadge({ type }) {
    const map = {
      geral: { icon: MessageCircle, color: '#249689', bg: 'bg-accent-teal/10', text: 'text-accent-teal', label: 'GERAL' },
      sugestao: { icon: Lightbulb, color: '#d7a53c', bg: 'bg-accent-yellow/20', text: 'text-primary-600', label: 'SUGESTÃO' },
      bug: { icon: Bug, color: '#FF5963', bg: 'bg-accent-error/10', text: 'text-accent-error', label: 'BUG' },
      elogio: { icon: Heart, color: '#69080b', bg: 'bg-primary-50', text: 'text-primary-600', label: 'ELOGIO' },
    }
    const m = map[type] ?? map.geral
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${m.bg} ${m.text}`}>
        {m.label}
      </span>
    )
  }

  function IconForType({ type }) {
    const map = { geral: MessageCircle, sugestao: Lightbulb, bug: Bug, elogio: Heart }
    const I = map[type] ?? MessageCircle
    return <I className="w-5 h-5 text-primary-600" />
  }

  async function markAsRead(id) {
    try {
      await supabase.rpc('admin_mark_feedback_status', { p_feedback_id: id, p_status: 'read' })
      load()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-text-primary">Feedbacks</h2>
        <button
          onClick={() => load(filter)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-primary-100 text-secondary hover:border-primary-300 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { k: 'all', label: 'Todos', n: counts.total },
          { k: 'new', label: 'Não lidos', n: counts.new },
          { k: 'bug', label: 'Bugs', n: counts.bug },
          { k: 'sugestao', label: 'Sugestões', n: counts.sugestao },
          { k: 'geral', label: 'Geral', n: counts.geral },
          { k: 'elogio', label: 'Elogios', n: counts.elogio },
        ].map(({ k, label, n }) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
              filter === k
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-text-primary border-primary-100 hover:border-primary-300'
            }`}
          >
            {label} <span className="opacity-70">({n})</span>
          </button>
        ))}
      </div>

      {loading && !data ? (
        <p className="text-sm text-secondary text-center py-8">Carregando...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-secondary text-center py-8">Nenhum feedback neste filtro.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((f) => (
            <div
              key={f.id}
              className={`bg-white rounded-xl border ${f.status === 'new' ? 'border-primary-200 shadow-card' : 'border-primary-100'} p-4 sm:p-5 transition`}
              onClick={() => f.status === 'new' && markAsRead(f.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-bg-alternate flex items-center justify-center flex-shrink-0">
                  <IconForType type={f.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <TypeBadge type={f.type} />
                    <span className="text-xs text-secondary">{fmtRelative(f.created_at)}</span>
                    {f.status === 'new' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-primary-600 text-white">
                        NOVO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{f.message}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-secondary">
                    <span className="font-medium text-text-primary">{f.fullname || '—'}</span>
                    {f.email && (
                      <a href={`mailto:${f.email}`} className="inline-flex items-center gap-1 hover:text-primary-600 transition">
                        <MessageCircle className="w-3 h-3" /> {f.email}
                      </a>
                    )}
                    <span className="opacity-60">de</span>
                    <code className="px-1.5 py-0.5 rounded bg-gray-100 text-[11px] font-mono">{f.source}</code>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// =====================
// CostsView (Uso da IA)
// =====================
function CostsView() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [days, setDays] = useState(30)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data: r, error } = await supabase.rpc('admin_cost_summary', { p_days: days, p_usd_brl: USD_BRL })
      if (error) throw error
      setData(r)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [days])

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('no_session')
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-sync-prompts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON,
          'Content-Type': 'application/json',
        },
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.error || `http_${res.status}`)
      setSyncResult(body)
      logAuditEvent('admin.prompts_sync_clicked')
    } catch (e) {
      setSyncResult({ ok: false, error: 'falha ao sincronizar' })
    } finally {
      setSyncing(false)
    }
  }

  if (loading && !data) return <p className="text-sm text-secondary text-center py-8">Carregando...</p>
  if (!data) return null

  const budget = DEFAULT_BUDGET_BRL
  const usedPct = budget > 0 ? Math.min((data.total_brl / budget) * 100, 100) : 0
  const over = usedPct >= ALERT_THRESHOLD_PCT

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-text-primary">Uso da IA</h2>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                days === d ? 'bg-primary-600 text-white' : 'bg-white border border-primary-100 text-secondary hover:border-primary-300'
              }`}
            >{d}d</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-primary-100 p-4">
          <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-primary-600" /><p className="text-xs text-secondary font-medium">Custo no período</p></div>
          <p className="text-2xl font-bold text-text-primary">{brl(data.total_brl)}</p>
          <p className="text-xs text-secondary mt-1">USD ${(data.total_usd ?? 0).toFixed(4)} · cotação {USD_BRL}</p>
        </div>
        <div className="bg-white rounded-xl border border-primary-100 p-4">
          <div className="flex items-center gap-2 mb-1"><Activity className="w-4 h-4 text-primary-600" /><p className="text-xs text-secondary font-medium">Tokens consumidos</p></div>
          <p className="text-2xl font-bold text-text-primary">{fmtInt(data.total_tokens)}</p>
          <p className="text-xs text-secondary mt-1">{fmtInt(data.by_day?.reduce((s, d) => s + (d.requests || 0), 0))} requisições</p>
        </div>
      </div>

      <div className={`rounded-xl border p-4 ${over ? 'border-accent-error/40 bg-accent-error/5' : 'border-primary-100 bg-white'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {over ? <AlertTriangle className="w-4 h-4 text-accent-error" /> : <CheckCircle2 className="w-4 h-4 text-accent-teal" />}
            <p className="text-sm font-semibold text-text-primary">Orçamento mensal</p>
          </div>
          <span className={`text-xs font-semibold ${over ? 'text-accent-error' : 'text-secondary'}`}>{brl(data.total_brl)} / {brl(budget)}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2"><div className={`h-2 rounded-full transition-all ${over ? 'bg-accent-error' : 'bg-primary-600'}`} style={{ width: `${usedPct}%` }} /></div>
        <p className="text-xs text-secondary mt-2">Alerta dispara aos {ALERT_THRESHOLD_PCT}% do orçamento.</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-2">Top usuários</h3>
        <div className="bg-white rounded-xl border border-primary-100 divide-y divide-primary-50">
          {(data.top_users ?? []).length === 0 && <p className="text-xs text-secondary p-4 text-center">Sem uso ainda no período.</p>}
          {(data.top_users ?? []).slice(0, 10).map((u) => (
            <div key={u.user_auth_id} className="flex items-center justify-between px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary truncate">{u.fullname || u.email || u.user_auth_id?.slice(0, 8)}</p>
                <p className="text-xs text-secondary">{fmtInt(u.tokens)} tokens · {fmtInt(u.requests)} reqs</p>
              </div>
              <p className="text-sm font-semibold text-primary-600 ml-3">{brl((u.cost_usd ?? 0) * USD_BRL)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-primary-100">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Ações</h3>
        <button
          onClick={handleSync} disabled={syncing}
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-primary-100 hover:border-primary-300 text-text-primary py-2.5 rounded-xl font-medium transition disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando prompts...' : 'Sincronizar prompts agora'}
        </button>
        {syncResult && (
          <div className={`mt-2 text-xs rounded-lg px-3 py-2 ${syncResult.ok ? 'bg-accent-teal/10 text-accent-teal' : 'bg-accent-error/10 text-accent-error'}`}>
            {syncResult.ok
              ? `✓ ${Object.entries(syncResult.results || {}).map(([k, v]) => `${k}: ${v.ok ? `${v.chars}c` : 'erro'}`).join(' · ')}`
              : `Falha: ${syncResult.error}`}
          </div>
        )}
      </div>
    </div>
  )
}
