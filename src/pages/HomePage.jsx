import { useState, useEffect, useCallback } from 'react'
import { getChats, createChat } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { isDemoMode, getPaymentStatus } from '../lib/demo'
import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'
import DashboardView from '../components/DashboardView'
import SearchModal from '../components/SearchModal'
import AccountModal from '../components/AccountModal'
import SubscriptionGate from '../components/SubscriptionGate'
import PaymentSuccessModal from '../components/PaymentSuccessModal'
import OnboardingTutorial from '../components/OnboardingTutorial'
import LGPDConsentModal, { LGPD_CONSENTS_VERSION } from '../components/LGPDConsentModal'
import FeedbackModal from '../components/FeedbackModal'
import AdminPage from './AdminPage'

export default function HomePage() {
  const { user, profile, refreshProfile, feedbackTrigger, setFeedbackTrigger } = useAuth()
  const [adminTab, setAdminTab] = useState(null) // null = não tá no admin; 'users'|'feedbacks'|'costs'
  const [feedbackSource, setFeedbackSource] = useState(null) // se truthy, FeedbackModal aberto
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // No desktop (≥md), default aberta. No mobile, fechada. Sobrescreve com preferência salva.
    try {
      const saved = localStorage.getItem('sidebarOpen')
      if (saved === 'true') return true
      if (saved === 'false') return false
    } catch {}
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  })

  useEffect(() => {
    try { localStorage.setItem('sidebarOpen', String(sidebarOpen)) } catch {}
  }, [sidebarOpen])
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(
    !localStorage.getItem('onboarding_completed')
  )
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(
    getPaymentStatus() === 'success'
  )

  const loadChats = useCallback(async () => {
    if (!user) return
    try {
      const data = await getChats(user.id)
      setChats(data)

      if (selectedChat) {
        const updated = data.find(c => c.id === selectedChat.id)
        if (updated) setSelectedChat(updated)
      }
    } catch {
      // Fallback: lista de chats vazia
    }
  }, [user, selectedChat?.id])

  useEffect(() => {
    loadChats()
  }, [user])

  useEffect(() => {
    function handleKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Trigger automático de feedback (chat-ai dispara via window event quando msg_count===10)
  useEffect(() => {
    function onTrigger(e) {
      setFeedbackSource(`modal-${e.detail}`)
    }
    window.addEventListener('feedback-trigger', onTrigger)
    return () => window.removeEventListener('feedback-trigger', onTrigger)
  }, [])

  // Trigger de login (3 ou 10 logins) — vem do AuthContext
  useEffect(() => {
    if (feedbackTrigger) {
      setFeedbackSource(`modal-${feedbackTrigger}`)
      setFeedbackTrigger(null)
    }
  }, [feedbackTrigger])

  function handleSearchSelect(chat) {
    setSelectedChat(chat)
    setSearchOpen(false)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  async function handleNewChat(agentType) {
    if (!user) return
    try {
      const chat = await createChat(user.id, agentType)
      if (!chat) {
        console.error('createChat returned empty')
        return
      }
      // Seleciona PRIMEIRO (transição imediata pra ChatArea), depois recarrega a lista em background.
      setSelectedChat(chat)
      if (window.innerWidth < 768) setSidebarOpen(false)
      loadChats().catch((e) => console.error('loadChats failed:', e))
    } catch (e) {
      console.error('handleNewChat failed:', e)
    }
  }

  if (showOnboarding) {
    return <OnboardingTutorial onComplete={() => setShowOnboarding(false)} />
  }

  return (
    <SubscriptionGate>
      {isDemoMode() && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-xs text-center py-1.5 font-medium">
          Modo demonstração — dados fictícios, sem conexão com backend
        </div>
      )}
      <div className={`h-[100dvh] flex overflow-hidden bg-bg-main ${isDemoMode() ? 'pt-7' : ''}`}>
        <Sidebar
          chats={chats}
          selectedChatId={selectedChat?.id}
          onSelectChat={(chat) => { setAdminTab(null); setSelectedChat(chat) }}
          onChatsChange={loadChats}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenAccount={() => setAccountOpen(true)}
          onGoHome={() => {
            setAdminTab(null)
            setSelectedChat(null)
            if (window.innerWidth < 768) setSidebarOpen(false)
          }}
          onOpenAdmin={(tab) => {
            setAdminTab(tab)
            setSelectedChat(null)
            if (window.innerWidth < 768) setSidebarOpen(false)
          }}
          currentAdminTab={adminTab}
        />

        {adminTab ? (
          <AdminPage
            initialTab={adminTab}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        ) : selectedChat ? (
          <ChatArea
            chat={selectedChat}
            onOpenSidebar={() => setSidebarOpen(true)}
            onChatsChange={loadChats}
          />
        ) : (
          <DashboardView
            chats={chats}
            onOpenSidebar={() => setSidebarOpen(true)}
            onNewChat={handleNewChat}
            onSelectChat={(chat) => {
              setSelectedChat(chat)
              if (window.innerWidth < 768) setSidebarOpen(false)
            }}
          />
        )}

        <SearchModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          chats={chats}
          onSelectChat={handleSearchSelect}
        />

        <AccountModal
          open={accountOpen}
          onClose={() => setAccountOpen(false)}
          onOpenFeedback={() => {
            setAccountOpen(false)
            setFeedbackSource('manual')
          }}
        />

        <PaymentSuccessModal
          open={showPaymentSuccess}
          onClose={() => setShowPaymentSuccess(false)}
        />

        <LGPDConsentModal
          open={!!user && !!profile && profile.lgpd_consents_version !== LGPD_CONSENTS_VERSION}
          userId={user?.id}
          onAccepted={refreshProfile}
        />

        <FeedbackModal
          open={!!feedbackSource}
          source={feedbackSource}
          onClose={() => setFeedbackSource(null)}
        />

      </div>
    </SubscriptionGate>
  )
}
