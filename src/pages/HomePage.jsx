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

export default function HomePage() {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  function handleSearchSelect(chat) {
    setSelectedChat(chat)
    setSearchOpen(false)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  async function handleNewChat(agentType) {
    if (!user) return
    try {
      const chat = await createChat(user.id, agentType)
      await loadChats()
      setSelectedChat(chat)
      if (window.innerWidth < 768) setSidebarOpen(false)
    } catch {
      // Silencioso: chat não foi criado, UI não muda
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
          onSelectChat={(chat) => setSelectedChat(chat)}
          onChatsChange={loadChats}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenAccount={() => setAccountOpen(true)}
        />

        {selectedChat ? (
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
        />

        <PaymentSuccessModal
          open={showPaymentSuccess}
          onClose={() => setShowPaymentSuccess(false)}
        />
      </div>
    </SubscriptionGate>
  )
}
