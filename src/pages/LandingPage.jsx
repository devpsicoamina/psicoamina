import { useState, useEffect, Fragment } from 'react'
import { ChevronDown, Check, X, Menu, X as XIcon, MessageCircle, Sparkles } from 'lucide-react'
import { PRICING, CHECKOUT_URLS } from '../lib/config'
import AgentIcon from '../components/AgentIcon'

const FAQ_ITEMS = [
  {
    q: 'Preciso saber usar IA?',
    a: 'Não! É como conversar no WhatsApp. Você digita sua dúvida e o agente responde com sugestões práticas.',
  },
  {
    q: 'Minhas conversas são privadas?',
    a: 'Sim. Cada conta é individual e suas conversas não são compartilhadas com ninguém.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim, sem multa e sem burocracia. Você cancela direto pela plataforma.',
  },
  {
    q: 'Os agentes substituem supervisão clínica?',
    a: 'Não. A ColméIA é uma ferramenta de apoio ao planejamento. Não substitui supervisão, formação continuada ou julgamento clínico.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'Pelo Hotmart, com cartão de crédito ou PIX. Você recebe acesso imediato após a confirmação.',
  },
  {
    q: 'Posso enviar documentos?',
    a: 'Sim! Você pode enviar PDFs de relatórios, anamneses e outros documentos. O agente analisa e dá sugestões baseadas no conteúdo.',
  },
]

const COMPARISON = [
  { aspect: 'Planejamento', with: 'Sugestões personalizadas por IA em segundos', without: 'Horas pesquisando atividades manualmente' },
  { aspect: 'Conteúdo', with: 'Posts prontos pras redes com poucos cliques', without: 'Bloqueio criativo e procrastinação' },
  { aspect: 'Captação', with: 'Estratégias direcionadas pro seu perfil', without: 'Tentativa e erro sem direcionamento' },
  { aspect: 'Documentos', with: 'Envie PDFs e receba análises em minutos', without: 'Releitura manual de relatórios extensos' },
  { aspect: 'Disponibilidade', with: 'Disponível 24h, quando você precisar', without: 'Limitado ao horário comercial' },
]

const HexPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="hex" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
        <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="#69080b" strokeWidth="0.8" />
        <path d="M28 0L56 16L56 50L28 66L0 50L0 16Z" fill="none" stroke="#69080b" strokeWidth="0.8" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex)" />
  </svg>
)

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-[#f5e6b8] last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="text-[15px] font-semibold text-[#4a3520] leading-snug">{item.q}</span>
        <ChevronDown
          className={`w-5 h-5 text-[#8a7560] flex-shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <p className="text-sm text-[#8a7560] leading-relaxed pb-5 pr-8">
          {item.a}
        </p>
      )}
    </div>
  )
}

function HexStep({ n }) {
  return (
    <div className="inline-flex items-center justify-center mb-5">
      <svg width="40" height="44" viewBox="0 0 40 44" className="drop-shadow-sm">
        <path d="M20 0L40 11L40 33L20 44L0 33L0 11Z" fill="#69080b" />
        <text x="20" y="27" textAnchor="middle" fill="white" fontSize="15" fontWeight="700" fontFamily="Nunito, sans-serif">{n}</text>
      </svg>
    </div>
  )
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function LandingPage({ onSwitch }) {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#fffdf0] font-sans overflow-x-hidden">

      <header className={`fixed top-0 left-0 right-0 z-50 bg-[#fffdf0] transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 py-4">
          <img
            src="/wordmark.png"
            alt="ColméIA Infantil"
            style={{ height: 40 }}
            className="object-contain"
            draggable={false}
          />

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('funcionalidades')} className="text-sm font-medium text-[#4a3520] hover:text-[#69080b] transition">Funcionalidades</button>
            <button onClick={() => scrollTo('precos')} className="text-sm font-medium text-[#4a3520] hover:text-[#69080b] transition">Preços</button>
            <button onClick={() => scrollTo('duvidas')} className="text-sm font-medium text-[#4a3520] hover:text-[#69080b] transition">Dúvidas</button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => scrollTo('precos')}
              className="px-5 py-2.5 bg-[#69080b] text-white rounded-xl font-bold text-sm hover:bg-[#7a1a1d] transition"
            >
              Começar agora
            </button>
            <button
              onClick={() => onSwitch('login')}
              className="px-5 py-2.5 text-[#69080b] font-semibold text-sm hover:bg-[#fef3c7] rounded-xl transition"
            >
              Entrar
            </button>
          </div>

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 text-[#69080b]"
          >
            {mobileMenu ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-[#fffdf0] border-t border-[#f5e6b8] px-5 pb-5">
            <button onClick={() => { scrollTo('funcionalidades'); setMobileMenu(false) }} className="block w-full text-left py-3 text-sm font-medium text-[#4a3520]">Funcionalidades</button>
            <button onClick={() => { scrollTo('precos'); setMobileMenu(false) }} className="block w-full text-left py-3 text-sm font-medium text-[#4a3520]">Preços</button>
            <button onClick={() => { scrollTo('duvidas'); setMobileMenu(false) }} className="block w-full text-left py-3 text-sm font-medium text-[#4a3520]">Dúvidas</button>
            <div className="flex gap-3 pt-3 border-t border-[#f5e6b8]">
              <button
                onClick={() => { scrollTo('precos'); setMobileMenu(false) }}
                className="flex-1 py-2.5 bg-[#69080b] text-white rounded-xl font-bold text-sm"
              >
                Começar agora
              </button>
              <button
                onClick={() => { onSwitch('login'); setMobileMenu(false) }}
                className="flex-1 py-2.5 border-2 border-[#69080b] text-[#69080b] rounded-xl font-bold text-sm"
              >
                Entrar
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="h-[72px]" />

      <section className="bg-[#fef3c7]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 pt-12 pb-16 md:pt-20 md:pb-28 flex flex-col md:flex-row md:items-center md:gap-16">
          <div className="flex-1 md:max-w-[55%]">
            <h1 className="text-3xl md:text-[2.75rem] font-extrabold text-[#4a3520] leading-[1.15] mb-5 tracking-tight">
              Transforme seu atendimento infantil com{' '}
              <span className="text-[#69080b]">inteligência artificial</span>
            </h1>
            <p className="text-lg md:text-xl text-[#8a7560] leading-relaxed max-w-xl mb-8">
              Planeje sessões, crie conteúdo e capte pacientes. Uma assistente feita por quem entende sua rotina.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => scrollTo('precos')}
                className="px-8 py-4 bg-[#69080b] text-white rounded-xl font-bold text-base hover:bg-[#7a1a1d] transition shadow-lg shadow-[#69080b]/20"
              >
                Começar agora
              </button>
              <button
                onClick={() => onSwitch('login')}
                className="px-8 py-4 border-2 border-[#69080b] text-[#69080b] rounded-xl font-bold text-base hover:bg-[#fff0c2] transition"
              >
                Já tenho conta
              </button>
            </div>
          </div>

          <div className="mt-10 md:mt-0 flex-shrink-0 md:max-w-[40%] w-full">
            <div className="bg-white rounded-2xl shadow-xl border border-[#f5e6b8] p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#8a7560] mb-1">Seus agentes</p>
              {[
                { icon: 'calendar', label: 'Planejamento de sessões', color: '#69080b', bg: '#69080b10' },
                { icon: 'instagram', label: 'Criação de conteúdos', color: '#bf782e', bg: '#bf782e10' },
                { icon: 'userPlus', label: 'Captação de pacientes', color: '#d7a53c', bg: '#d7a53c10' },
              ].map(a => (
                <div key={a.icon} className="flex items-center gap-3 p-3 rounded-xl border border-[#f5e6b8] hover:border-[#d7a53c] transition cursor-default">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: a.bg }}>
                    <AgentIcon icon={a.icon} size={18} style={{ color: a.color }} />
                  </div>
                  <span className="text-sm font-semibold text-[#4a3520]">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="bg-[#fffdf0] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8a7560] mb-3 text-center">O que a ColméIA faz por você</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#69080b] mb-14 text-center leading-tight">
            Três agentes especializados para sua rotina clínica
          </h2>

          <div className="bg-[#fef3c7] rounded-2xl p-6 md:p-10 mb-6 border border-[#f5e6b8]">
            <div className="flex flex-col md:flex-row md:items-start md:gap-10">
              <div className="flex-shrink-0 mb-4 md:mb-0">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#69080b15' }}>
                  <AgentIcon icon="calendar" size={28} style={{ color: '#69080b' }} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#4a3520] mb-2">Planejamento de sessões</h3>
                <p className="text-[15px] text-[#8a7560] leading-relaxed mb-4">
                  Receba sugestões personalizadas de atividades, técnicas e abordagens para cada paciente
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Sugestões por faixa etária e quadro clínico', 'Ideias de atividades lúdicas', 'Roteiros de sessão completos', 'Análise de relatórios e anamneses via PDF'].map(b => (
                    <div key={b} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#69080b] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[#4a3520]">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#f5e6b8]">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#bf782e15' }}>
                <AgentIcon icon="instagram" size={24} style={{ color: '#bf782e' }} />
              </div>
              <h3 className="text-lg font-bold text-[#4a3520] mb-2">Criação de conteúdos</h3>
              <p className="text-sm text-[#8a7560] leading-relaxed mb-4">
                Gere posts, textos e materiais educativos para suas redes sociais
              </p>
              <div className="space-y-2">
                {['Posts prontos para Instagram', 'Textos educativos para responsáveis', 'Séries temáticas de 4+ posts', 'Materiais de divulgação profissional'].map(b => (
                  <div key={b} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#bf782e] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#4a3520]">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#f5e6b8]">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#d7a53c15' }}>
                <AgentIcon icon="userPlus" size={24} style={{ color: '#d7a53c' }} />
              </div>
              <h3 className="text-lg font-bold text-[#4a3520] mb-2">Captação de pacientes</h3>
              <p className="text-sm text-[#8a7560] leading-relaxed mb-4">
                Estratégias para atrair e fidelizar famílias no seu consultório
              </p>
              <div className="space-y-2">
                {['Estratégias de marketing acessíveis', 'Scripts de abordagem para famílias', 'Posicionamento profissional', 'Técnicas de fidelização'].map(b => (
                  <div key={b} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#d7a53c] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#4a3520]">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fef3c7] relative overflow-hidden py-16 md:py-24">
        <HexPattern />
        <div className="max-w-7xl mx-auto px-5 md:px-10 relative">
          <p className="text-xs font-bold uppercase tracking-widest text-[#69080b]/50 mb-3 text-center">Como funciona</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#69080b] mb-14 text-center leading-tight">
            Comece em menos de um minuto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12 max-w-4xl mx-auto">
            {[
              { n: '01', title: 'Cadastre-se', desc: 'Crie sua conta em poucos segundos' },
              { n: '02', title: 'Escolha o agente', desc: 'Sessões, conteúdo ou captação — você decide' },
              { n: '03', title: 'Converse', desc: 'Receba orientações práticas e personalizadas' },
            ].map(step => (
              <div key={step.n} className="text-center md:text-left">
                <span className="text-4xl font-extrabold text-[#d7a53c]/30">{step.n}</span>
                <h3 className="text-lg font-bold text-[#4a3520] mt-2 mb-1">{step.title}</h3>
                <p className="text-sm text-[#8a7560] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fffdf0] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8a7560] mb-3 text-center">Por que ColméIA</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#69080b] mb-14 text-center leading-tight">
            Com ColméIA vs Sem ColméIA
          </h2>

          <div className="hidden md:block max-w-3xl mx-auto">
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-0 rounded-2xl overflow-hidden border border-[#f5e6b8]">
              <div className="bg-[#f5e6b8] p-4 font-bold text-sm text-[#4a3520]">Aspecto</div>
              <div className="bg-[#fef3c7] p-4 font-bold text-sm text-[#69080b] text-center">Com ColméIA ✓</div>
              <div className="bg-[#f0f0f0] p-4 font-bold text-sm text-[#8a7560] text-center">Sem ColméIA</div>
              {COMPARISON.map((row, i) => (
                <Fragment key={i}>
                  <div className={`p-4 text-sm font-semibold text-[#4a3520] ${i % 2 === 0 ? 'bg-white' : 'bg-[#fffdf0]'}`}>{row.aspect}</div>
                  <div className={`p-4 text-sm text-[#4a3520] ${i % 2 === 0 ? 'bg-[#fffbf0]' : 'bg-[#fef9e8]'}`}>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#69080b] mt-0.5 flex-shrink-0" />
                      <span>{row.with}</span>
                    </div>
                  </div>
                  <div className={`p-4 text-sm text-[#8a7560] ${i % 2 === 0 ? 'bg-[#f8f8f8]' : 'bg-[#f2f2f2]'}`}>
                    <div className="flex items-start gap-2">
                      <X className="w-4 h-4 text-[#c0b0a0] mt-0.5 flex-shrink-0" />
                      <span>{row.without}</span>
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>

          <div className="md:hidden space-y-4">
            {COMPARISON.map((row, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-[#f5e6b8]">
                <div className="bg-[#f5e6b8] px-4 py-2">
                  <span className="text-sm font-bold text-[#4a3520]">{row.aspect}</span>
                </div>
                <div className="bg-[#fffbf0] px-4 py-3 flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#69080b] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[#4a3520]">{row.with}</span>
                </div>
                <div className="bg-[#f8f8f8] px-4 py-3 flex items-start gap-2">
                  <X className="w-4 h-4 text-[#c0b0a0] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[#8a7560]">{row.without}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fef3c7] py-16 md:py-24 overflow-hidden relative">
        <HexPattern />
        <div className="max-w-7xl mx-auto px-5 md:px-10 relative">
          <div className="relative inline-block w-full text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#69080b]/50 mb-3 flex items-center justify-center gap-3">
              <span className="w-8 h-[1.5px] bg-[#d7a53c] rounded" />
              Conheça a plataforma
              <span className="w-8 h-[1.5px] bg-[#d7a53c] rounded" />
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#69080b] mb-4 leading-tight">
              Simples de usar.<br className="hidden sm:block" /> Poderosa pra transformar.
            </h2>
            <p className="text-sm text-[#8a7560] max-w-md mx-auto leading-relaxed">
              Três agentes de IA especializados em psicologia infantil, prontos pra te ajudar no consultório e fora dele.
            </p>
            <img
              src="/icone.png"
              alt=""
              className="absolute -right-2 -top-4 md:right-8 md:-top-6 w-12 md:w-16 opacity-25 animate-[float_4s_ease-in-out_infinite] pointer-events-none select-none"
              draggable={false}
            />
          </div>

          <div className="flex flex-col gap-16 md:gap-20">

            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-[#d7a53c]/20 rounded-full blur-[60px] scale-75 pointer-events-none" />
                <img
                  src="/mockups/onboarding-macbook.png"
                  alt="Tela de onboarding da ColméIA Infantil"
                  className="relative w-full h-auto drop-shadow-xl transition-transform duration-500 group-hover:-translate-y-1.5"
                  draggable={false}
                />
              </div>
              <div className="text-center md:text-left">
                <HexStep n="1" />
                <h3 className="text-xl md:text-2xl font-extrabold text-[#69080b] mb-3 leading-tight">Começar é fácil</h3>
                <p className="text-[15px] text-[#8a7560] leading-relaxed max-w-sm mx-auto md:mx-0 mb-5">
                  Em poucos passos você configura sua conta e recebe dicas de como aproveitar o máximo da plataforma.
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5e6b8]/60 rounded-full text-xs font-semibold text-[#69080b]">
                  <Check className="w-4 h-4" />
                  Tutorial guiado em poucos passos
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12">
              <div className="text-center md:text-left md:order-1">
                <HexStep n="2" />
                <h3 className="text-xl md:text-2xl font-extrabold text-[#69080b] mb-3 leading-tight">Tudo num só lugar</h3>
                <p className="text-[15px] text-[#8a7560] leading-relaxed max-w-sm mx-auto md:mx-0 mb-5">
                  Planeje sessões, crie conteúdo para redes sociais e receba estratégias de captação — tudo dentro da mesma plataforma.
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5e6b8]/60 rounded-full text-xs font-semibold text-[#69080b]">
                  <Sparkles className="w-4 h-4" />
                  3 agentes especializados
                </span>
              </div>
              <div className="relative group md:order-2">
                <div className="absolute inset-0 bg-[#d7a53c]/20 rounded-full blur-[60px] scale-75 pointer-events-none" />
                <svg className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.08] pointer-events-none" viewBox="0 0 120 120" fill="none">
                  <path d="M30 10L50 0L70 10L70 30L50 40L30 30Z" stroke="#69080b" strokeWidth="1" />
                  <path d="M70 10L90 0L110 10L110 30L90 40L70 30Z" stroke="#69080b" strokeWidth="1" />
                  <path d="M50 40L70 30L90 40L90 60L70 70L50 60Z" stroke="#69080b" strokeWidth="1" />
                  <path d="M10 30L30 20L50 30L50 50L30 60L10 50Z" stroke="#69080b" strokeWidth="1" />
                  <path d="M30 60L50 50L70 60L70 80L50 90L30 80Z" stroke="#69080b" strokeWidth="1" />
                  <path d="M70 60L90 50L110 60L110 80L90 90L70 80Z" stroke="#69080b" strokeWidth="1" />
                </svg>
                <img
                  src="/mockups/dashboard-dell.png"
                  alt="Dashboard da ColméIA com 3 agentes de IA"
                  className="relative w-full h-auto drop-shadow-xl transition-transform duration-500 group-hover:-translate-y-1.5"
                  draggable={false}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-8 md:gap-16">
              <div className="text-center md:text-left">
                <HexStep n="3" />
                <h3 className="text-xl md:text-2xl font-extrabold text-[#69080b] mb-3 leading-tight">No consultório ou onde você estiver</h3>
                <p className="text-[15px] text-[#8a7560] leading-relaxed max-w-sm mx-auto md:mx-0 mb-5">
                  Planeje seus atendimentos de qualquer lugar. Anexe fichas, peça sugestões e a IA estrutura a abordagem pra você.
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5e6b8]/60 rounded-full text-xs font-semibold text-[#69080b]">
                  <MessageCircle className="w-4 h-4" />
                  100% responsivo
                </span>
              </div>
              <div className="relative group mx-auto md:mx-0">
                <div className="absolute inset-0 bg-[#d7a53c]/20 rounded-full blur-[60px] scale-90 pointer-events-none" />
                <img
                  src="/mockups/chat-iphone.png"
                  alt="ColméIA Infantil no celular"
                  className="relative w-56 md:w-64 h-auto drop-shadow-xl transition-transform duration-500 group-hover:-translate-y-1.5"
                  draggable={false}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="precos" className="bg-[#fffdf0] py-16 md:py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8a7560] mb-3 text-center">Planos</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#69080b] mb-12 leading-tight text-center">
            Simples e sem surpresas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-7 border-2 border-[#f5e6b8]">
              <p className="text-sm font-semibold text-[#8a7560] mb-4">Mensal</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-extrabold text-[#4a3520]">{PRICING.monthly.label}</span>
                <span className="text-sm text-[#8a7560]">/mês</span>
              </div>
              <ul className="text-sm text-[#4a3520] space-y-3 mb-8">
                {['Acesso aos 3 agentes', 'Conversas ilimitadas', 'Envio de PDFs', 'Cancele quando quiser'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#d7a53c] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={CHECKOUT_URLS.monthly}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3.5 rounded-xl border-2 border-[#69080b] text-[#69080b] font-bold text-sm hover:bg-[#fef3c7] transition"
              >
                Assinar mensal
              </a>
            </div>

            <div className="bg-[#69080b] rounded-2xl p-7 relative">
              <span className="absolute -top-3 right-6 bg-[#face0a] text-[#69080b] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                Economia de {PRICING.yearly.savings}
              </span>
              <p className="text-sm font-semibold text-[#f5c0c0] mb-4">Anual</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-extrabold text-white">{PRICING.yearly.label}</span>
                <span className="text-sm text-[#f5c0c0]">/ano</span>
              </div>
              <p className="text-sm text-[#f5c0c0] mb-6">12x R$ 19,75</p>
              <ul className="text-sm text-[#fce4e4] space-y-3 mb-8">
                {['Tudo do plano mensal', `Equivale a ${PRICING.yearly.monthlyEquivalent}`, '2 meses grátis'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#face0a] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={CHECKOUT_URLS.yearly}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3.5 rounded-xl bg-[#face0a] text-[#69080b] font-bold text-sm hover:brightness-105 transition"
              >
                Assinar anual
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="duvidas" className="bg-[#fef3c7] relative overflow-hidden py-16 md:py-24">
        <HexPattern />
        <div className="max-w-7xl mx-auto px-5 md:px-10 relative">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8a7560] mb-3 text-center">Dúvidas frequentes</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#69080b] mb-12 text-center">Antes de começar</h2>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl px-6 md:px-8 shadow-sm border border-[#f5e6b8]">
              {FAQ_ITEMS.map((item, i) => (
                <FaqItem
                  key={i}
                  item={item}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-[#8a7560] mb-4">Ainda tem dúvidas?</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/5500000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#69080b] text-white rounded-xl text-sm font-semibold hover:bg-[#7a1a1d] transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <a
                  href="mailto:contato@colmeiainfantil.com.br"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-[#8a7560]/30 text-[#8a7560] rounded-xl text-sm font-semibold hover:bg-white transition"
                >
                  contato@colmeiainfantil.com.br
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#face0a] relative overflow-hidden">
        <img
          src="/favicon.png"
          alt=""
          className="absolute right-6 bottom-6 md:right-16 md:bottom-10 w-24 md:w-36 opacity-[0.15] pointer-events-none select-none"
          draggable={false}
        />
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24 text-center relative">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#69080b] mb-4 leading-tight">
            Pronta para transformar{' '}
            <br className="hidden sm:block" />
            seus atendimentos?
          </h2>
          <p className="text-[#69080b]/70 mb-8 max-w-md mx-auto">
            Comece hoje e veja a diferença na sua rotina clínica.
          </p>
          <button
            onClick={() => scrollTo('precos')}
            className="px-10 py-4 bg-[#69080b] text-white rounded-xl font-bold text-base hover:bg-[#7a1a1d] transition shadow-lg shadow-[#69080b]/20"
          >
            Começar agora
          </button>
        </div>
      </section>

      <footer className="bg-[#69080b]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-white">colméIA infantil</span>
            <span className="text-xs text-[#f5c0c0]">© 2026 ColméIA Infantil</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#f5c0c0]">
            <button onClick={() => onSwitch('termos')} className="hover:text-white transition">Termos de uso</button>
            <button onClick={() => onSwitch('privacidade')} className="hover:text-white transition">Política de privacidade</button>
            <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
