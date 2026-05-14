import { useEffect, useState } from 'react'
import { RefreshCw, DollarSign, Activity, AlertTriangle, CheckCircle2, Users, BarChart3 } from 'lucide-react'
import { supabase, logAuditEvent } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

// Same threshold the migration seeded; tweakable later via admin_settings table.
const DEFAULT_BUDGET_BRL = 300
const ALERT_THRESHOLD_PCT = 80
const USD_BRL = 5.20

function brl(n) {
  return (n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
}
function fmtInt(n) {
  return (n ?? 0).toLocaleString('pt-BR')
}

export default function AdminPanel() {
  const [tab, setTab] = useState('costs')
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [usersData, setUsersData] = useState(null)
  const [usersLoading, setUsersLoading] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data: summary, error: rpcError } = await supabase.rpc('admin_cost_summary', {
        p_days: days,
        p_usd_brl: USD_BRL,
      })
      if (rpcError) throw rpcError
      setData(summary)
    } catch (e) {
      setError('Falha ao carregar dados. Você é admin?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [days])

  async function loadUsers() {
    setUsersLoading(true)
    try {
      const { data: result, error: rpcError } = await supabase.rpc('admin_users_list', {
        p_limit: 200,
        p_offset: 0,
      })
      if (rpcError) throw rpcError
      setUsersData(result)
    } catch (e) {
      console.error('loadUsers failed:', e)
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'users' && !usersData) loadUsers()
  }, [tab])

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
    } catch {
      setSyncResult({ ok: false, error: 'falha ao sincronizar' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-3">
        <button
          onClick={() => setTab('costs')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            tab === 'costs' ? 'bg-primary-600 text-white' : 'text-secondary hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Custos
        </button>
        <button
          onClick={() => setTab('users')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            tab === 'users' ? 'bg-primary-600 text-white' : 'text-secondary hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" /> Usuários
        </button>
      </div>

      {tab === 'users' && <UsersList data={usersData} loading={usersLoading} onRefresh={loadUsers} />}
      {tab === 'costs' && <CostsView
        data={data} loading={loading} error={error}
        days={days} setDays={setDays} load={load}
        syncing={syncing} syncResult={syncResult} handleSync={handleSync}
      />}
    </div>
  )
}

function CostsView({ data, loading, error, days, setDays, load, syncing, syncResult, handleSync }) {
  if (loading && !data) {
    return <div className="text-sm text-secondary py-8 text-center">Carregando...</div>
  }
  if (error) {
    return <div className="text-sm text-accent-error py-8 text-center">{error}</div>
  }
  if (!data) return null

  const budgetBrl = DEFAULT_BUDGET_BRL
  const usedPct = budgetBrl > 0 ? Math.min((data.total_brl / budgetBrl) * 100, 100) : 0
  const overThreshold = usedPct >= ALERT_THRESHOLD_PCT

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-secondary mb-3">
          Visão consolidada de custos com OpenAI. Visível apenas para admins.
        </p>
        <div className="flex gap-2 mb-4">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                days === d ? 'bg-primary-600 text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'
              }`}
            >
              {d}d
            </button>
          ))}
          <button
            onClick={load}
            disabled={loading}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-secondary hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-primary-600" />
            <p className="text-xs text-secondary font-medium">Custo no período</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{brl(data.total_brl)}</p>
          <p className="text-xs text-secondary mt-1">USD ${(data.total_usd ?? 0).toFixed(4)} · cotação {USD_BRL}</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-primary-600" />
            <p className="text-xs text-secondary font-medium">Tokens consumidos</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{fmtInt(data.total_tokens)}</p>
          <p className="text-xs text-secondary mt-1">{fmtInt(data.by_day?.reduce((s, d) => s + (d.requests || 0), 0))} requisições</p>
        </div>
      </div>

      <div className={`rounded-xl border-2 p-4 ${overThreshold ? 'border-accent-error/40 bg-accent-error/5' : 'border-gray-100 bg-white'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {overThreshold
              ? <AlertTriangle className="w-4 h-4 text-accent-error" />
              : <CheckCircle2 className="w-4 h-4 text-accent-teal" />}
            <p className="text-sm font-semibold text-text-primary">Orçamento mensal</p>
          </div>
          <span className={`text-xs font-semibold ${overThreshold ? 'text-accent-error' : 'text-secondary'}`}>
            {brl(data.total_brl)} / {brl(budgetBrl)}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${overThreshold ? 'bg-accent-error' : 'bg-primary-600'}`}
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <p className="text-xs text-secondary mt-2">
          Alerta dispara aos {ALERT_THRESHOLD_PCT}% do orçamento. Hard cap deve ser
          configurado também no dashboard OpenAI.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-2">Top usuários</h3>
        <div className="bg-white rounded-xl border-2 border-gray-100 divide-y divide-gray-100">
          {(data.top_users ?? []).length === 0 && (
            <p className="text-xs text-secondary p-4 text-center">Sem uso ainda no período.</p>
          )}
          {(data.top_users ?? []).slice(0, 10).map((u) => (
            <div key={u.user_auth_id} className="flex items-center justify-between px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary truncate">
                  {u.fullname || u.email || u.user_auth_id?.slice(0, 8)}
                </p>
                <p className="text-xs text-secondary">
                  {fmtInt(u.tokens)} tokens · {fmtInt(u.requests)} reqs
                </p>
              </div>
              <p className="text-sm font-semibold text-primary-600 ml-3">{brl((u.cost_usd ?? 0) * USD_BRL)}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-2">Por dia</h3>
        <div className="bg-white rounded-xl border-2 border-gray-100 max-h-48 overflow-y-auto divide-y divide-gray-100">
          {(data.by_day ?? []).length === 0 && (
            <p className="text-xs text-secondary p-4 text-center">Sem dados.</p>
          )}
          {(data.by_day ?? []).map((d) => (
            <div key={d.day} className="flex items-center justify-between px-4 py-2 text-xs">
              <span className="text-text-primary font-mono">{d.day}</span>
              <span className="text-secondary">{fmtInt(d.tokens)} tokens · {fmtInt(d.requests)} reqs</span>
              <span className="font-semibold text-primary-600">{brl((d.cost_usd ?? 0) * USD_BRL)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Ações administrativas</h3>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-xl font-medium hover:bg-primary-700 transition disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando prompts...' : 'Sincronizar prompts agora (dos Google Docs)'}
        </button>
        {syncResult && (
          <div className={`mt-2 text-xs rounded-lg px-3 py-2 ${
            syncResult.ok ? 'bg-accent-teal/10 text-accent-teal' : 'bg-accent-error/10 text-accent-error'
          }`}>
            {syncResult.ok
              ? `✓ ${Object.entries(syncResult.results || {}).map(([k, v]) => `${k}: ${v.ok ? `${v.chars}c` : 'erro'}`).join(' · ')}`
              : `Falha: ${syncResult.error}`}
          </div>
        )}
      </div>
    </div>
  )
}

function UsersList({ data, loading, onRefresh }) {
  const [filter, setFilter] = useState('all')
  if (loading && !data) {
    return <div className="text-sm text-secondary py-8 text-center">Carregando usuários...</div>
  }
  if (!data) return null

  const rows = data.rows || []
  const total = data.total ?? rows.length

  const filtered = rows.filter((u) => {
    if (filter === 'active') return u.subscription_active === true
    if (filter === 'inactive') return u.subscription_active !== true && u.role !== 'admin'
    if (filter === 'admin') return u.role === 'admin'
    return true
  })

  const counts = {
    all: rows.length,
    active: rows.filter((u) => u.subscription_active === true).length,
    inactive: rows.filter((u) => u.subscription_active !== true && u.role !== 'admin').length,
    admin: rows.filter((u) => u.role === 'admin').length,
  }

  function fmtDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function PlanBadge({ user }) {
    if (user.role === 'admin') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary-50 text-primary-600">Admin</span>
    }
    if (user.subscription_active) {
      const label = user.plan_type === 'yearly' ? 'Anual' : 'Mensal'
      return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-accent-teal/10 text-accent-teal">{label}</span>
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-text-secondary">Sem plano</span>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-secondary">
          {total} {total === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
        </p>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-secondary hover:bg-gray-200 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { k: 'all', label: 'Todos', n: counts.all },
          { k: 'active', label: 'Ativos', n: counts.active },
          { k: 'inactive', label: 'Sem plano', n: counts.inactive },
          { k: 'admin', label: 'Admin', n: counts.admin },
        ].map(({ k, label, n }) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              filter === k ? 'bg-primary-600 text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'
            }`}
          >
            {label} · {n}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-100 divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-sm text-secondary p-6 text-center">Nenhum usuário neste filtro.</p>
        )}
        {filtered.map((u) => (
          <div key={u.user_auth_id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {u.fullname || '—'}
                </p>
                <p className="text-xs text-secondary truncate">{u.email}</p>
              </div>
              <PlanBadge user={u} />
            </div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 text-xs text-secondary">
              <div>Cadastro: <span className="text-text-primary">{fmtDate(u.created_at)}</span></div>
              <div>Último login: <span className="text-text-primary">{fmtDate(u.last_sign_in_at)}</span></div>
              {u.current_period_end && (
                <div>Renova: <span className="text-text-primary">{fmtDate(u.current_period_end)}</span></div>
              )}
              <div>Termos LGPD: <span className="text-text-primary">{u.lgpd_accepted_at ? '✓' : '—'}</span></div>
              <div>Email conf.: <span className="text-text-primary">{u.email_confirmed_at ? '✓' : '—'}</span></div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-secondary">
        WhatsApp do usuário ainda não é coletado no signup — fica como campo futuro. Quando vier, aparece aqui.
      </p>
    </div>
  )
}
