import { useEffect, useState } from 'react'

const STORAGE_KEY = 'cookieConsent.v1'

export default function CookieBanner({ onOpenPrivacy }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      // localStorage indisponível (modo privado em alguns navegadores) — não mostra banner
    }
  }, [])

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, at: new Date().toISOString() })) } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed bottom-3 left-3 right-3 md:bottom-6 md:left-auto md:right-6 md:max-w-md z-50 bg-white border border-[#f5e6b8] shadow-xl rounded-2xl px-4 py-3 md:p-5 animate-fade-in flex items-center gap-3 md:block"
    >
      <p className="text-xs md:text-sm text-[#4a3520] leading-snug md:leading-relaxed md:mb-3 flex-1">
        <span className="md:hidden">
          Usamos cookies essenciais.{' '}
          <button onClick={onOpenPrivacy} className="text-[#69080b] font-semibold underline">
            Saiba mais
          </button>
        </span>
        <span className="hidden md:inline">
          Usamos cookies essenciais para manter sua sessão ativa e fazer a plataforma funcionar.
          Não usamos cookies de rastreamento ou publicidade. Detalhes na{' '}
          <button
            onClick={onOpenPrivacy}
            className="text-[#69080b] font-semibold hover:underline"
          >
            Política de Privacidade
          </button>
          .
        </span>
      </p>
      <button
        onClick={accept}
        className="bg-[#69080b] text-white px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold hover:bg-[#7a1a1d] transition shrink-0 md:w-full"
      >
        Entendi
      </button>
    </div>
  )
}
