export default function TermosPage({ onSwitch }) {
  return (
    <div className="min-h-screen bg-bg-main font-sans">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary-600 mb-6">Termos de Uso</h1>
        <div className="bg-white rounded-2xl p-8 shadow-card border border-primary-50">
          <p className="text-text-secondary leading-relaxed">
            Conteúdo em elaboração. Será publicado em breve.
          </p>
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
