export default function SuportePage({ onSwitch }) {
  return (
    <div className="min-h-screen bg-bg-main font-sans">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary-600 mb-6">Suporte</h1>
        <div className="bg-white rounded-2xl p-8 shadow-card border border-primary-50 space-y-4">
          <p className="text-text-secondary leading-relaxed">
            Para suporte, entre em contato:
          </p>
          <div className="space-y-3">
            <a
              href="https://wa.me/5541999192683"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.106 1.52 5.837L.057 23.7l5.992-1.572A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.978 0-3.81-.583-5.352-1.584l-.384-.228-3.556.933.95-3.467-.25-.398A9.82 9.82 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z"/></svg>
              WhatsApp
            </a>
            <p className="text-sm text-text-secondary">
              Email: <a href="mailto:contato@colmeiainfantil.com.br" className="text-primary-600 font-semibold hover:underline">contato@colmeiainfantil.com.br</a>
            </p>
          </div>
        </div>
        <button
          onClick={() => onSwitch('landing')}
          className="mt-8 text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
        >
          ← Voltar
        </button>
      </div>
    </div>
  )
}
