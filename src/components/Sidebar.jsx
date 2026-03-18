import { useState } from 'react'
import { AGENTS } from '../lib/agents'
import { createChat, updateChatTitle, deleteChat, signOut } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import TokenBar from './TokenBar'
import Logo from './Logo'
import AgentIcon from './AgentIcon'
import Modal from './Modal'

export default function Sidebar({
  chats,
  selectedChatId,
  onSelectChat,
  onChatsChange,
  isOpen,
  onClose,
  onOpenSearch,
  onOpenAccount,
}) {
  const { user, profile, tokenUsage } = useAuth()
  const [expandedAgent, setExpandedAgent] = useState(null)
  const [editingChatId, setEditingChatId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [deletingChat, setDeletingChat] = useState(null)
  const [creatingChat, setCreatingChat] = useState(null)

  async function handleNewChat(agentType) {
    if (creatingChat) return
    setCreatingChat(agentType)
    try {
      const chat = await createChat(user.id, agentType)
      await onChatsChange()
      onSelectChat(chat)
      setExpandedAgent(agentType)
      if (window.innerWidth < 768) onClose()
    } catch (err) {
      console.error('Error creating chat:', err)
      alert('Erro ao criar chat. Verifique sua conexão.')
    } finally {
      setCreatingChat(null)
    }
  }

  async function handleRename(chatId) {
    if (!editTitle.trim()) { setEditingChatId(null); return }
    try {
      await updateChatTitle(chatId, editTitle.trim())
      setEditingChatId(null)
      onChatsChange()
    } catch (err) {
      console.error('Error renaming:', err)
    }
  }

  async function handleDelete(chatId) {
    try {
      await deleteChat(chatId)
      if (selectedChatId === chatId) onSelectChat(null)
      onChatsChange()
      setDeletingChat(null)
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  function getChatsByAgent(agentType) {
    return chats.filter(c => c.agent_type === agentType)
  }

  const initials = (profile?.fullname || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden animate-fade-in" onClick={onClose} />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-[280px] bg-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        shadow-lg md:shadow-none
      `}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between">
          <Logo size="sidebar" />

          <div className="flex items-center gap-1">
            {/* Search button */}
            <button
              onClick={onOpenSearch}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-600 hover:bg-primary-50 transition"
              title="Buscar chats"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {/* Close on mobile */}
            <button onClick={onClose} className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Token bar */}
        <TokenBar tokensUsed={tokenUsage?.tokens_used || 0} />

        {/* Divider */}
        <div className="mx-4 border-t border-primary-100" />

        {/* Agents & chats */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {AGENTS.map((agent, idx) => {
            const agentChats = getChatsByAgent(agent.id)
            const isExpanded = expandedAgent === agent.id

            return (
              <div key={agent.id}>
                {idx > 0 && <div className="mx-2 my-2 border-t border-primary-50" />}

                {/* Agent header */}
                <div className="flex items-center gap-2 px-2 py-2">
                  <button
                    onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 group"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: agent.color + '15' }}>
                      <AgentIcon icon={agent.icon} size={16} style={{ color: agent.color }} className="flex-shrink-0" />
                    </div>
                    <span className="text-sm font-medium text-primary-600 truncate">
                      {agent.label}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-secondary flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* New chat button */}
                  <button
                    onClick={() => handleNewChat(agent.id)}
                    disabled={!!creatingChat}
                    className="w-7 h-7 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center flex-shrink-0 transition shadow-sm disabled:opacity-50"
                    title="Novo chat"
                  >
                    {creatingChat === agent.id ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Chat list */}
                {isExpanded && (
                  <div className="ml-3 space-y-0.5 mt-1 animate-fade-in">
                    {agentChats.length === 0 ? (
                      <p className="text-xs text-secondary px-3 py-2.5 italic">
                        Nenhum chat ainda. Crie um para começar!
                      </p>
                    ) : (
                      agentChats.map(chat => (
                        <div
                          key={chat.id}
                          className={`sidebar-item group flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer text-sm
                            ${selectedChatId === chat.id
                              ? 'bg-bg-alternate text-primary-600 font-medium'
                              : 'text-text-secondary hover:bg-bg-alternate/50'
                            }`}
                          onClick={() => {
                            onSelectChat(chat)
                            if (window.innerWidth < 768) onClose()
                          }}
                        >
                          {editingChatId === chat.id ? (
                            <input
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              onBlur={() => handleRename(chat.id)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleRename(chat.id)
                                if (e.key === 'Escape') setEditingChatId(null)
                              }}
                              className="flex-1 bg-white border-2 border-primary-300 rounded-lg px-2 py-0.5 text-sm outline-none text-text-primary"
                              autoFocus
                              onClick={e => e.stopPropagation()}
                            />
                          ) : (
                            <span className="flex-1 truncate">{chat.title || 'Novo chat'}</span>
                          )}

                          {/* Action buttons */}
                          <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 flex-shrink-0 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingChatId(chat.id)
                                setEditTitle(chat.title || '')
                              }}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-secondary hover:text-primary-600 hover:bg-primary-50 transition"
                              title="Renomear"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingChat(chat) }}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-secondary hover:text-accent-error hover:bg-accent-error/10 transition"
                              title="Deletar"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-primary-50">
          <button
            onClick={onOpenAccount}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-alternate transition group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-primary-600 truncate">
                {profile?.fullname || 'Usuário'}
              </p>
              <p className="text-xs text-secondary truncate">
                {user?.email}
              </p>
            </div>
            <svg className="w-4 h-4 text-secondary group-hover:text-primary-600 transition flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deletingChat}
        onClose={() => setDeletingChat(null)}
        title="Deletar chat"
      >
        <p className="text-text-secondary mb-5">
          Tem certeza que deseja deletar <strong>"{deletingChat?.title || 'Novo chat'}"</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeletingChat(null)}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-text-secondary font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => handleDelete(deletingChat.id)}
            className="flex-1 py-2.5 rounded-xl bg-accent-error text-white font-medium hover:bg-accent-error/90 transition"
          >
            Deletar
          </button>
        </div>
      </Modal>
    </>
  )
}
