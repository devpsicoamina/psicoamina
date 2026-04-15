import { CheckCircle } from 'lucide-react'

export default function CompraAprovadaPage({ onSwitch }) {
  return (
    <div className="min-h-screen bg-[#fef3c7] font-sans flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <img
          src="/icone.png"
          alt="ColméIA Infantil"
          className="w-20 mx-auto mb-6"
          draggable={false}
        />
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#f5e6b8]">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-7 h-7 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#69080b] mb-3">
            Bem-vinda à ColméIA! 🐝
          </h1>
          <p className="text-[15px] text-[#8a7560] leading-relaxed mb-8">
            Seu pagamento foi confirmado. Você já pode acessar a plataforma e começar a transformar seus atendimentos.
          </p>
          <button
            onClick={() => onSwitch('login')}
            className="w-full py-3.5 bg-[#69080b] text-white rounded-xl font-bold text-sm hover:bg-[#7a1a1d] transition"
          >
            Acessar a plataforma
          </button>
        </div>
        <button
          onClick={() => onSwitch('landing')}
          className="mt-6 text-sm font-semibold text-[#69080b] hover:text-[#7a1a1d] transition"
        >
          ← Voltar para o site
        </button>
      </div>
    </div>
  )
}
