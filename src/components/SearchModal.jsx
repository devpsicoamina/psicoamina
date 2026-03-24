import { useState, useEffect, useRef } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { getAgent } from '../lib/agents'
import AgentIcon from './AgentIcon'

export default function SearchModal({ open, onClose, chats, onSelectChat }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const filtered = chats.filter(c =>
    (c.title || '').toLowerCase().includes(query.toLowerCase())
  )

  function handleSelect(chat) {
    onSelectChat(chat)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg z-10 animate-slide-up overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-primary-50">
          <Search className="w-5 h-5 text-secondary flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar nos seus chats..."
            className="flex-1 outline-none text-text-primary placeholder:text-secondary/50 text-sm bg-transparent"
          />
          <kbd className="hidden sm:inline-block text-xs text-secondary/50 bg-gray-100 px-2 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[40vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary text-sm">
                {query ? 'Nenhum chat encontrado.' : 'Digite para buscar...'}
              </p>
            </div>
          ) : (
            filtered.map(chat => {
              const agent = getAgent(chat.agent_type)
              return (
                <button
                  key={chat.id}
                  onClick={() => handleSelect(chat)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-alternate transition text-left"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: (agent?.color || '#69080b') + '15' }}
                  >
                    <AgentIcon icon={agent?.icon} size={14} style={{ color: agent?.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {chat.title || 'Novo chat'}
                    </p>
                    <p className="text-xs text-secondary truncate">{agent?.label}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-secondary/30 flex-shrink-0" />
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
