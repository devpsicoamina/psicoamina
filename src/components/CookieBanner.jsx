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
      className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:max-w-md z-50 bg-white border-2 border-[#f5e6b8] shadow-xl rounded-2xl p-5 animate-fade-in"
    >
      <p className="text-sm text-[#4a3520] leading-relaxed mb-3">
        Usamos cookies essenciais para manter sua sessão ativa e fazer a plataforma funcionar.
        Não usamos cookies de rastreamento ou publicidade. Detalhes na{' '}
        <button
          onClick={onOpenPrivacy}
          className="text-[#69080b] font-semibold hover:underline"
        >
          Política de Privacidade
        </button>
        .
      </p>
      <button
        onClick={accept}
        className="w-full bg-[#69080b] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#7a1a1d] transition"
      >
        Entendi
      </button>
    </div>
  )
}
