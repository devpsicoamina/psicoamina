import { Search } from 'lucide-react'

export default function AnaliseCreditoPage({ onSwitch }) {
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
          <div className="w-14 h-14 bg-[#f0e6ff] rounded-full flex items-center justify-center mx-auto mb-5">
            <Search className="w-7 h-7 text-[#8a7560]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#69080b] mb-3">
            Pagamento em análise
          </h1>
          <p className="text-[15px] text-[#8a7560] leading-relaxed mb-8">
            Seu pagamento está sendo processado. Assim que for aprovado, enviaremos um e-mail com seus dados de acesso.
          </p>
          <button
            onClick={() => onSwitch('landing')}
            className="w-full py-3.5 border-2 border-[#69080b] text-[#69080b] rounded-xl font-bold text-sm hover:bg-[#fef3c7] transition"
          >
            Voltar para o site
          </button>
        </div>
      </div>
    </div>
  )
}
