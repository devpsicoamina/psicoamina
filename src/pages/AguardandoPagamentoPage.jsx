import { Clock } from 'lucide-react'

export default function AguardandoPagamentoPage({ onSwitch }) {
  return (
    <div className="min-h-screen bg-[#fef3c7] font-sans flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <img
          src="/abelha.png"
          alt="ColméIA Infantil"
          className="w-20 mx-auto mb-6"
          draggable={false}
        />
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#f5e6b8]">
          <div className="w-14 h-14 bg-[#fff8e1] rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-7 h-7 text-[#d7a53c]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#69080b] mb-3">
            Estamos aguardando a confirmação do seu pagamento
          </h1>
          <p className="text-[15px] text-[#8a7560] leading-relaxed mb-8">
            Assim que o pagamento for identificado, você receberá um e-mail com as instruções de acesso. Pagamentos via boleto podem levar até 3 dias úteis.
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
