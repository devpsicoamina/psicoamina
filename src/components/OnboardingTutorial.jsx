import { useState } from 'react'
import { Calendar, FileText, Layers, Lightbulb, ArrowLeft, ArrowRight, Repeat } from 'lucide-react'
import AgentIcon from './AgentIcon'

const TOTAL_STEPS = 4

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i <= current
                ? 'bg-primary-600 text-white shadow-button'
                : 'bg-primary-100 text-secondary'
            }`}
          >
            {i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`w-8 md:w-14 h-0.5 transition-all duration-300 ${
                i < current ? 'bg-primary-600' : 'bg-primary-100'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function Step1() {
  return (
    <div className="flex flex-col items-center text-center px-2">
      <div className="flex items-end gap-3 mb-8">
        <img src="/logo-dark.png" alt="ColméIA" className="h-20 md:h-24 object-contain" draggable={false} />
        <img src="/favicon.png" alt="" className="w-12 md:w-14 -mb-1 drop-shadow-md" draggable={false} />
      </div>
      <h2 className="text-2xl md:text-3xl font-extrabold text-primary-600 mb-4 leading-tight">
        Bem-vinda à ColméIA!
      </h2>
      <p className="text-text-secondary leading-relaxed max-w-sm text-[15px]">
        Sua assistente de IA pra psicologia infantil. Em poucos passos você vai entender como tirar o máximo da plataforma.
      </p>
    </div>
  )
}

function Step2() {
  const agents = [
    {
      agentIcon: 'calendar',
      label: 'Planejamento de sessões',
      desc: 'Sugestões de atividades, técnicas e abordagens pra cada paciente',
      color: '#69080b',
      bg: '#69080b12',
    },
    {
      agentIcon: 'instagram',
      label: 'Criação de conteúdos',
      desc: 'Posts, textos e materiais educativos pras suas redes',
      color: '#bf782e',
      bg: '#bf782e12',
    },
    {
      agentIcon: 'userPlus',
      label: 'Captação de pacientes',
      desc: 'Estratégias pra atrair famílias pro consultório',
      color: '#d7a53c',
      bg: '#d7a53c12',
    },
  ]

  return (
    <div className="px-2">
      <h2 className="text-xl md:text-2xl font-extrabold text-primary-600 mb-2 text-center">Seus 3 agentes</h2>
      <p className="text-sm text-secondary mb-6 text-center">Cada um é especialista em uma área da sua rotina</p>

      <div className="bg-white rounded-2xl shadow-card border border-primary-50 overflow-hidden max-w-sm mx-auto">
        <div className="bg-[#fff8e1] px-4 py-3 border-b border-[#f5e6b8]">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">Agentes</span>
        </div>
        {agents.map((a, i) => (
          <div
            key={i}
            className={`flex items-start gap-3.5 px-4 py-4 ${i < agents.length - 1 ? 'border-b border-primary-50' : ''}`}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: a.bg }}
            >
              <AgentIcon icon={a.agentIcon} size={18} style={{ color: a.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-primary leading-snug">{a.label}</p>
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Step3() {
  return (
    <div className="px-2">
      <h2 className="text-xl md:text-2xl font-extrabold text-primary-600 mb-2 text-center">Como funciona uma conversa</h2>
      <p className="text-sm text-secondary mb-6 text-center">É como mandar uma mensagem no WhatsApp</p>

      <div className="bg-white rounded-2xl shadow-card border border-primary-50 max-w-sm mx-auto overflow-hidden">
        <div className="bg-[#fff8e1] px-4 py-3 border-b border-[#f5e6b8] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#69080b12' }}>
            <Calendar size={14} style={{ color: '#69080b' }} />
          </div>
          <span className="text-xs font-bold text-primary-600">Planejamento de sessões</span>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex justify-end">
            <div className="bg-[#face0a]/30 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]">
              <p className="text-sm text-text-primary leading-relaxed">
                Preciso de atividades de regulação emocional para uma criança de 6 anos com TDAH
              </p>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="bg-[#f5f0e0] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%]">
              <p className="text-sm text-text-primary leading-relaxed">
                Aqui vão 3 sugestões adaptadas para o perfil:
              </p>
              <p className="text-sm text-text-primary leading-relaxed mt-1.5">
                <strong>1. Respiração do balão</strong> — peça pra criança imaginar que está enchendo um balão...
              </p>
              <p className="text-xs text-secondary mt-1 italic">continua...</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2.5 mt-5 max-w-sm mx-auto bg-[#fff8e1] rounded-xl px-4 py-3">
        <Lightbulb size={16} className="text-[#d7a53c] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-text-primary">Dica:</strong> Quanto mais específica a pergunta, melhor a resposta
        </p>
      </div>
    </div>
  )
}

function Step4({ onComplete }) {
  const tips = [
    {
      icon: Layers,
      text: 'Combine agentes: planeje a sessão e transforme o tema em post',
    },
    {
      icon: FileText,
      text: 'Envie PDFs de relatórios e peça análises',
    },
    {
      icon: Repeat,
      text: 'Crie séries temáticas — peça 4 posts sobre o mesmo tema',
    },
  ]

  return (
    <div className="px-2 text-center">
      <h2 className="text-xl md:text-2xl font-extrabold text-primary-600 mb-2">Bora começar?</h2>
      <p className="text-sm text-secondary mb-8">Algumas ideias pra você aproveitar ao máximo</p>

      <div className="space-y-3 max-w-sm mx-auto mb-10 text-left">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-3.5 bg-white rounded-xl px-4 py-3.5 shadow-sm border border-primary-50">
            <div className="w-9 h-9 rounded-lg bg-[#fff8e1] flex items-center justify-center flex-shrink-0">
              <tip.icon size={16} className="text-[#bf782e]" />
            </div>
            <p className="text-sm text-text-primary leading-relaxed pt-1.5">{tip.text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onComplete}
        className="px-10 py-3.5 bg-primary-600 text-white rounded-xl font-bold text-[15px] hover:bg-primary-700 transition shadow-button"
      >
        Começar a usar
      </button>

      <img
        src="/favicon.png"
        alt=""
        className="w-10 opacity-[0.15] mx-auto mt-8 pointer-events-none select-none"
        draggable={false}
      />
    </div>
  )
}

export default function OnboardingTutorial({ onComplete }) {
  const [step, setStep] = useState(0)

  function handleComplete() {
    localStorage.setItem('onboarding_completed', 'true')
    onComplete()
  }

  const steps = [
    <Step1 key={0} />,
    <Step2 key={1} />,
    <Step3 key={2} />,
    <Step4 key={3} onComplete={handleComplete} />,
  ]

  return (
    <div className="fixed inset-0 z-[60] bg-[#fffdf0] flex flex-col font-sans">
      <div className="flex-1 overflow-y-auto flex flex-col justify-center px-6 py-10">
        <div className="max-w-lg mx-auto w-full">
          <StepIndicator current={step} total={TOTAL_STEPS} />
          <div key={step} className="animate-fade-in">
            {steps[step]}
          </div>
        </div>
      </div>

      <div className="border-t border-primary-100 bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary-600 transition disabled:opacity-0 disabled:pointer-events-none"
          >
            <ArrowLeft size={16} />
            Anterior
          </button>

          <span className="text-xs text-secondary">{step + 1} de {TOTAL_STEPS}</span>

          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition"
            >
              Próximo
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition"
            >
              Finalizar
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
