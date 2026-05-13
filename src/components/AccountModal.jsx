import { useState } from 'react'
import { X, KeyRound, LogOut, MessageCircle, Download, Trash2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase, updateUserProfile, signOut, resetPassword, logAuditEvent } from '../lib/supabase'
import { PLAN_LIMITS } from '../lib/config'
import PricingModal from './PricingModal'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

export default function AccountModal({ open, onClose }) {
  const { user, profile, isSubscribed } = useAuth()
  const [tab, setTab] = useState('info')
  const [name, setName] = useState(profile?.fullname || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteError, setDeleteError] = useState('')

  if (!open) return null

  const planType = profile?.plan_type || 'monthly'
  const planLabel = planType === 'yearly' ? 'anual' : 'mensal'
  const credits = PLAN_LIMITS[planType] || PLAN_LIMITS.monthly

  let renewalStr = ''
  if (profile?.current_period_end) {
    renewalStr = new Date(profile.current_period_end).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  async function handleSaveName() {
    if (!name.trim() || !user) return
    setSaving(true)
    try {
      await updateUserProfile(user.id, { fullname: name.trim() })
      logAuditEvent('profile.name_updated')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // Silencioso: nome não foi salvo, UI volta ao estado anterior
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    logAuditEvent('auth.signed_out')
    await signOut()
    onClose()
  }

  async function handleExport() {
    if (!SUPABASE_URL || !SUPABASE_ANON) return
    setExporting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch(`${SUPABASE_URL}/functions/v1/account-export`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON,
        },
      })
      if (!res.ok) throw new Error('export_failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `colmeia-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      // silencioso
    } finally {
      setExporting(false)
    }
  }

  async function handleDelete() {
    setDeleteError('')
    if (deleteConfirmation.trim() !== 'EXCLUIR MINHA CONTA') {
      setDeleteError('Digite exatamente "EXCLUIR MINHA CONTA" para confirmar.')
      return
    }
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch(`${SUPABASE_URL}/functions/v1/account-delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmation: deleteConfirmation.trim() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'delete_failed')
      }
      // Sucesso: força sign out e fecha modal — sessão já está inválida no server
      try { await supabase.auth.signOut() } catch {}
      window.location.reload()
    } catch (e) {
      setDeleteError('Falha ao excluir conta. Tente novamente em alguns instantes.')
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10 animate-slide-up overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-primary-50">
            <h2 className="text-lg font-bold text-primary-600">Minha conta</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:bg-gray-100 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

                    <div className="flex px-6 pt-3 gap-1 flex-wrap">
            <button
              onClick={() => setTab('info')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === 'info' ? 'bg-primary-600 text-white' : 'text-secondary hover:bg-gray-100'
              }`}
            >
              Meus dados
            </button>
            <button
              onClick={() => setTab('security')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === 'security' ? 'bg-primary-600 text-white' : 'text-secondary hover:bg-gray-100'
              }`}
            >
              Segurança
            </button>
            <button
              onClick={() => setTab('privacy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === 'privacy' ? 'bg-primary-600 text-white' : 'text-secondary hover:bg-gray-100'
              }`}
            >
              Privacidade
            </button>
          </div>

                    <div className="p-6">
            {tab === 'info' && (
              <div className="space-y-4 animate-fade-in">
                                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-button">
                    <span className="text-white text-xl font-bold">
                      {(profile?.fullname || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{profile?.fullname || 'Usuário'}</p>
                    <p className="text-sm text-secondary">{user?.email}</p>
                  </div>
                </div>

                                <div className={`rounded-xl p-4 border-2 ${
                  isSubscribed
                    ? 'border-accent-teal/30 bg-accent-teal/5'
                    : 'border-accent-error/20 bg-accent-error/5'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      isSubscribed ? 'bg-accent-teal' : 'bg-accent-error'
                    }`} />
                    <span className="text-sm font-semibold text-text-primary">
                      {isSubscribed ? 'Assinatura ativa' : 'Sem assinatura ativa'}
                    </span>
                  </div>
                  {isSubscribed ? (
                    <>
                      <p className="text-sm text-text-secondary">
                        Plano {planLabel}
                        {renewalStr && ` · Renova em ${renewalStr}`}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {credits.toLocaleString('pt-BR')} créditos/mês
                      </p>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowPricing(true)}
                      className="mt-2 text-sm font-semibold text-primary-600 hover:underline"
                    >
                      Ver planos
                    </button>
                  )}
                </div>

                                <div>
                  <label className="block text-sm font-medium text-primary-600 mb-1.5">Nome completo</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl focus:ring-0 focus:border-primary-600 outline-none transition text-text-primary"
                  />
                </div>

                                <div>
                  <label className="block text-sm font-medium text-primary-600 mb-1.5">Email</label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-secondary cursor-not-allowed"
                  />
                </div>

                <button
                  onClick={handleSaveName}
                  disabled={saving || !name.trim()}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button disabled:opacity-50"
                >
                  {saved ? '✓ Salvo!' : saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            )}
            {tab === 'security' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-sm text-secondary mb-4">
                  Gerencie a segurança da sua conta.
                </p>

                <button
                  onClick={() => {
                    if (!user?.email) return
                    if (!confirmReset) { setConfirmReset(true); return }
                    resetPassword(user.email)
                    logAuditEvent('auth.password_reset_requested')
                    setResetSent(true)
                    setConfirmReset(false)
                    setTimeout(() => setResetSent(false), 3000)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-gray-100 hover:border-primary-200 hover:bg-bg-alternate transition text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <KeyRound className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {resetSent ? '✓ Email enviado!' : confirmReset ? 'Confirmar envio do link' : 'Alterar senha'}
                    </p>
                    <p className="text-xs text-secondary">
                      {confirmReset
                        ? 'Clique novamente para enviar o link de redefinição'
                        : 'Enviar link de redefinição por email'}
                    </p>
                  </div>
                </button>

                <a
                  href="https://wa.me/5500000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-gray-100 hover:border-primary-200 hover:bg-bg-alternate transition text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Suporte</p>
                    <p className="text-xs text-secondary">Fale com a gente pelo WhatsApp</p>
                  </div>
                </a>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-accent-error/20 hover:bg-accent-error/5 transition text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent-error/10 flex items-center justify-center flex-shrink-0">
                      <LogOut className="w-5 h-5 text-accent-error" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-accent-error">Sair da conta</p>
                      <p className="text-xs text-secondary">Encerrar sua sessão</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
            {tab === 'privacy' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-sm text-secondary mb-4">
                  Seus direitos previstos pela LGPD (Lei 13.709/2018).
                </p>

                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-gray-100 hover:border-primary-200 hover:bg-bg-alternate transition text-left disabled:opacity-60"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Download className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {exporting ? 'Gerando arquivo...' : 'Exportar meus dados'}
                    </p>
                    <p className="text-xs text-secondary">Baixar tudo o que temos sobre você em JSON</p>
                  </div>
                </button>

                {!deleteOpen ? (
                  <button
                    onClick={() => setDeleteOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-accent-error/20 hover:bg-accent-error/5 transition text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent-error/10 flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-5 h-5 text-accent-error" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-accent-error">Excluir minha conta</p>
                      <p className="text-xs text-secondary">Remove tudo permanentemente — não há volta</p>
                    </div>
                  </button>
                ) : (
                  <div className="rounded-xl border-2 border-accent-error/30 bg-accent-error/5 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-accent-error flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-text-primary">
                        <p className="font-semibold">Confirmar exclusão da conta</p>
                        <p className="text-xs text-secondary mt-1">
                          Isso apaga chats, mensagens, PDFs, perfil e sessão. Não tem como recuperar.
                          Se tiver assinatura ativa, cancele no Hotmart antes — a cobrança não pára automaticamente.
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-primary mb-1">
                        Digite <code className="font-mono bg-white px-1.5 py-0.5 rounded text-accent-error">EXCLUIR MINHA CONTA</code> para confirmar:
                      </label>
                      <input
                        value={deleteConfirmation}
                        onChange={e => { setDeleteConfirmation(e.target.value); setDeleteError('') }}
                        className="w-full px-3 py-2 border-2 border-accent-error/30 rounded-lg text-sm focus:outline-none focus:border-accent-error"
                        placeholder="EXCLUIR MINHA CONTA"
                        autoComplete="off"
                      />
                      {deleteError && <p className="text-xs text-accent-error mt-1">{deleteError}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setDeleteOpen(false); setDeleteConfirmation(''); setDeleteError('') }}
                        className="flex-1 border-2 border-gray-200 text-text-primary py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 bg-accent-error text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
                      >
                        {deleting ? 'Excluindo...' : 'Excluir agora'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2 text-xs text-secondary leading-relaxed">
                  <p>Conforme nossa <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-primary-600 font-semibold hover:underline">Política de Privacidade</a>, retemos chats por 12 meses após inatividade, PDFs por 30 dias e backups por 6 meses.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

            <PricingModal
        open={showPricing}
        onClose={() => setShowPricing(false)}
      />
    </>
  )
}
