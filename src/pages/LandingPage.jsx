import { useState, useEffect } from 'react'
import {
  ArrowRight, Check, X as XIcon, Sparkles, Brain, FileText, Megaphone,
  Users, Calendar, BookOpen, Lock, ShieldCheck, MessageCircle,
  Layers, Clock, Zap, Heart, ChevronDown, Menu, X
} from 'lucide-react'
import { PRICING, CHECKOUT_URLS } from '../lib/config'
import CookieBanner from '../components/CookieBanner'

const BRAND_GRADIENT = 'linear-gradient(135deg, #69080b 0%, #d7a53c 100%)'
const BRAND_GRADIENT_SOFT = 'linear-gradient(180deg, rgba(105,8,11,0.06) 0%, rgba(250,206,10,0.04) 50%, rgba(105,8,11,0.03) 100%)'

export default function LandingPage({ onSwitch }) {
  return (
    <div className="bg-white text-text-primary font-sans">
      <Header onSwitch={onSwitch} />
      <Hero onSwitch={onSwitch} />
      <PainSolution />
      <FeaturesShowcase />
      <Comparison />
      <FeaturesGrid />
      <Pricing onSwitch={onSwitch} />
      <Faq />
      <FinalCta onSwitch={onSwitch} />
      <Footer onSwitch={onSwitch} />
      <CookieBanner onOpenPrivacy={() => onSwitch('privacidade')} />
    </div>
  )
}

function Header({ onSwitch }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-40 backdrop-blur transition-all ${scrolled ? 'bg-white/90 border-b border-primary-50 shadow-sm' : 'bg-white/70'}`}>
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 shrink-0">
          <img src="/logo-dark.png" alt="ColméIA Infantil" className="h-12 sm:h-14 w-auto" />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-base text-text-secondary">
          <a href="#agentes" className="hover:text-primary-600 transition-colors">Agentes</a>
          <a href="#recursos" className="hover:text-primary-600 transition-colors">Recursos</a>
          <a href="#comparativo" className="hover:text-primary-600 transition-colors">Comparativo</a>
          <a href="#precos" className="hover:text-primary-600 transition-colors">Preços</a>
          <a href="#faq" className="hover:text-primary-600 transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onSwitch('login')}
            className="hidden sm:inline-flex text-sm font-medium text-text-primary hover:text-primary-600 px-3 py-2 rounded-lg transition"
          >
            Entrar
          </button>
          <a
            href="#precos"
            style={{ background: BRAND_GRADIENT }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all hover:shadow-md whitespace-nowrap"
          >
            Começar agora
            <ArrowRight className="h-4 w-4" />
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-text-secondary p-2"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-primary-50 bg-white/95 backdrop-blur px-6 py-4 flex flex-col gap-4 text-base">
          <a href="#agentes" onClick={() => setMobileOpen(false)} className="text-text-primary hover:text-primary-600">Agentes</a>
          <a href="#recursos" onClick={() => setMobileOpen(false)} className="text-text-primary hover:text-primary-600">Recursos</a>
          <a href="#comparativo" onClick={() => setMobileOpen(false)} className="text-text-primary hover:text-primary-600">Comparativo</a>
          <a href="#precos" onClick={() => setMobileOpen(false)} className="text-text-primary hover:text-primary-600">Preços</a>
          <a href="#faq" onClick={() => setMobileOpen(false)} className="text-text-primary hover:text-primary-600">FAQ</a>
          <button onClick={() => onSwitch('login')} className="text-left text-text-primary hover:text-primary-600">Entrar</button>
        </nav>
      )}
    </header>
  )
}

function Hero({ onSwitch }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-bg-main to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary-100/50 blur-3xl" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-accent-yellow/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 relative">
        <div className="text-center max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-primary-200 px-3 py-1.5 text-sm font-medium mb-6"
            style={{ background: 'rgba(105,8,11,0.06)', color: '#69080b' }}
          >
            <Sparkles className="h-4 w-4" />
            IA especializada para psicólogas infantis
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary tracking-tight leading-[1.1]">
            Mais tempo com a criança.{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: BRAND_GRADIENT }}>
              Menos tempo planejando.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Três agentes de IA pensados pra rotina da psicóloga infantil: planejam sessões a partir
            de fichas em PDF, escrevem conteúdo pras suas redes e ajudam a atrair pacientes.
            Sem prompts complicados — é só conversar.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#precos"
              style={{ background: BRAND_GRADIENT }}
              className="inline-flex items-center gap-2 text-white font-semibold text-base px-6 py-3.5 rounded-xl transition-all shadow-button hover:shadow-card-hover"
            >
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#agentes"
              className="inline-flex items-center gap-2 border-2 border-primary-200 text-text-primary hover:bg-primary-50 font-semibold px-6 py-3.5 rounded-xl transition"
            >
              Ver como funciona
            </a>
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            Cancelamento em 2 cliques. Sem fidelidade.
          </p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <ScreenshotFrame
            src="/screenshots/dashboard.png"
            alt="Tela principal da ColméIA mostrando os 3 agentes especializados e conversas recentes"
            fallback={<HeroMockup />}
          />
        </div>
      </div>
    </section>
  )
}

function HeroMockup() {
  // Fallback caso o screenshot real não exista ainda — mostra um mock estilizado
  // com a abelha mascote ao centro e os 3 agentes orbitando.
  return (
    <div className="aspect-[16/9] bg-gradient-to-br from-primary-50 via-white to-accent-yellow/10 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
      <img
        src="/abelha.png"
        alt=""
        aria-hidden="true"
        className="absolute right-6 sm:right-10 bottom-2 w-32 sm:w-44 lg:w-56 opacity-95 drop-shadow-lg select-none pointer-events-none"
        draggable={false}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl relative z-10">
        {[
          { icon: Brain, label: 'Planejamento', desc: 'Sessões a partir da ficha clínica' },
          { icon: Megaphone, label: 'Conteúdo', desc: 'Posts pras suas redes sociais' },
          { icon: Heart, label: 'Captação', desc: 'Estratégias pra atrair famílias' },
        ].map((a, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 shadow-card border border-primary-50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: BRAND_GRADIENT }}>
              <a.icon className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-bold text-text-primary text-sm mb-1">{a.label}</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PainSolution() {
  const items = [
    {
      pain: 'Você passa o sábado inteiro planejando as sessões da semana — e nem sempre o plano funciona.',
      solution: 'Anexe a ficha clínica em PDF e o agente "Planejamento de sessões" estrutura técnicas, materiais e etapas baseadas no caso.',
      icon: <Brain className="h-5 w-5" />,
      featureLabel: 'Planejamento de sessões',
    },
    {
      pain: '"Preciso postar mais", mas nunca sabe o quê. O perfil fica parado, paciente novo não chega.',
      solution: 'O agente "Criação de conteúdo" sugere posts, legendas e ideias de carrossel já com tom de psicóloga infantil — é só ajustar e publicar.',
      icon: <Megaphone className="h-5 w-5" />,
      featureLabel: 'Criação de conteúdo',
    },
    {
      pain: 'Já tentou anúncio, indicação, panfleto — e o consultório continua com agenda aberta.',
      solution: '"Captação de pacientes" analisa seu perfil e cria estratégia: canais, mensagens-âncora, copy pros stories e bio. Passo a passo.',
      icon: <Heart className="h-5 w-5" />,
      featureLabel: 'Captação de pacientes',
    },
  ]

  return (
    <section
      id="agentes"
      className="relative overflow-hidden py-20 sm:py-24"
      style={{ background: BRAND_GRADIENT_SOFT }}
    >
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full blur-3xl" style={{ background: 'rgba(105,8,11,0.12)' }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: 'rgba(250,206,10,0.14)' }} />
      </div>

      <div className="mx-auto max-w-6xl px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Você já viveu isso?
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Três dores que toda psicóloga infantil sente — e o agente da ColméIA que resolve cada uma.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {items.map((item, i) => (
            <div key={i} className="rounded-2xl border border-primary-100 bg-white overflow-hidden shadow-card">
              <div className="p-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent-error/10 border border-accent-error/20 px-2.5 py-1 text-xs font-semibold text-accent-error uppercase tracking-wide mb-3">
                  <XIcon className="h-3 w-3" />
                  A dor
                </div>
                <p className="text-base font-semibold text-text-primary leading-snug">{item.pain}</p>

                <div className="my-5 flex items-center gap-2">
                  <div className="flex-1 h-px bg-primary-100" />
                  <ArrowRight className="h-3.5 w-3.5 text-primary-300" />
                  <div className="flex-1 h-px bg-primary-100" />
                </div>

                <div
                  className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide mb-3 text-white"
                  style={{ background: BRAND_GRADIENT }}
                >
                  <Check className="h-3 w-3" />
                  Como resolvemos
                </div>
                <p className="text-base text-text-primary leading-relaxed">{item.solution}</p>
              </div>
              <div className="px-6 pb-6">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-600">
                  {item.icon}
                  {item.featureLabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesShowcase() {
  const blocks = [
    {
      tag: 'Conversa natural',
      title: 'Como se você estivesse no WhatsApp',
      desc: 'Esqueça prompts complexos. Cada agente é especialista no seu tema — você só digita o que precisa e ele entende o contexto.',
      bullets: [
        'Três agentes especializados, cada um com expertise própria',
        'Histórico organizado por conversa',
        'Tom e linguagem ajustados pra psicóloga infantil',
        'Sem aprender comando nenhum — é só escrever',
      ],
      icon: <MessageCircle className="h-5 w-5" />,
      image: '/screenshots/chat-planejamento.png',
      imageAlt: 'Chat da ColméIA respondendo sobre planejamento de sessão',
    },
    {
      tag: 'Documentos da paciente',
      title: 'Anexe a ficha clínica e tenha um plano em segundos',
      desc: 'Faça upload do PDF (anamnese, evolução, ficha de triagem) e o agente usa o conteúdo como contexto pra sugerir abordagens, técnicas e materiais.',
      bullets: [
        'Aceita PDFs de até 20MB',
        'Extração local de texto — o arquivo não sai do seu navegador antes',
        'Você decide se quer enviar conteúdo de cada documento',
        'Recomendamos anonimizar dados sensíveis antes do envio',
      ],
      icon: <FileText className="h-5 w-5" />,
      image: '/screenshots/pdf-anexado.png',
      imageAlt: 'PDF anexado no campo de mensagem do chat',
      reverse: true,
    },
    {
      tag: 'Privacidade e segurança',
      title: 'Suas conversas são suas',
      desc: 'Cada conta é totalmente isolada. Suas conversas não são compartilhadas, não treinamos modelo público com elas, e você pode exportar ou apagar tudo a qualquer momento.',
      bullets: [
        'Banco PostgreSQL com Row Level Security',
        'OpenAI não usa dados da API pra treinar modelos',
        'Export completo dos seus dados em JSON',
        'Exclusão definitiva da conta com um clique',
      ],
      icon: <ShieldCheck className="h-5 w-5" />,
      image: '/screenshots/privacidade.png',
      imageAlt: 'Aba Privacidade da conta com botões de exportar e excluir dados',
    },
    {
      tag: 'Quando você precisar',
      title: 'Disponível 24h, sem agendar consulta',
      desc: 'Sessão de domingo à noite? Ideia de post no fim do dia? Insight no caminho do consultório? O agente está pronto — não tem horário comercial nem espera.',
      bullets: [
        'Acesso ilimitado pelo navegador',
        'Funciona no celular, tablet e computador',
        'Cada conversa fica salva pra você retomar quando quiser',
        'Sem agendamento, sem fila',
      ],
      icon: <Clock className="h-5 w-5" />,
      image: '/screenshots/pensando.png',
      imageAlt: 'Chat mostrando o agente pensando na estratégia de conteúdos',
      reverse: true,
    },
  ]

  return (
    <section id="recursos" className="py-20 sm:py-28 bg-bg-alternate border-y border-primary-50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Tudo que faltava{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: BRAND_GRADIENT }}>
              num só lugar
            </span>
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Pensado pra resolver problemas que ChatGPT genérico ou Google não resolvem.
          </p>
        </div>

        <div className="space-y-16">
          {blocks.map((b, i) => (
            <div
              key={i}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${b.reverse ? 'lg:[&>div:first-child]:order-2' : ''}`}
            >
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3 text-primary-600">
                  {b.icon}
                  {b.tag}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-3">
                  {b.title}
                </h3>
                <p className="text-base text-text-secondary leading-relaxed mb-5">{b.desc}</p>
                <ul className="space-y-2.5">
                  {b.bullets.map((bul, bi) => (
                    <li key={bi} className="flex items-start gap-2.5 text-base text-text-primary">
                      <Check className="h-5 w-5 mt-0.5 shrink-0 text-primary-600" />
                      <span>{bul}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <ScreenshotFrame
                  src={b.image}
                  alt={b.imageAlt}
                  fallback={<FeatureMockup tag={b.tag} icon={b.icon} />}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureMockup({ tag, icon }) {
  return (
    <div className="aspect-[4/3] bg-gradient-to-br from-primary-50 via-white to-accent-yellow/10 flex items-center justify-center p-12">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-button" style={{ background: BRAND_GRADIENT }}>
          <div className="text-white scale-150">{icon}</div>
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">{tag}</p>
      </div>
    </div>
  )
}

function Comparison() {
  const rows = [
    {
      topic: 'Contexto da sua especialidade',
      with: 'Os 3 agentes são especialistas em psicologia infantil. Sabem da rotina, da ética, dos pacientes pequenos.',
      without: 'IA genérica chuta. Você precisa explicar do zero toda vez — quem é, o que faz, como fala.',
    },
    {
      topic: 'Anexar ficha clínica',
      with: 'Upload de PDF direto. O agente lê e usa como base pra responder.',
      without: 'Copia e cola pedaços. Limite de caracteres. Perde formatação. Toda hora.',
    },
    {
      topic: 'Sugerir post pra Instagram',
      with: 'Tom certo pra mãe de criança em terapia. Sem psicologuês acadêmico, sem fórmulas batidas.',
      without: 'Resposta genérica de "consultor digital". Você reescreve tudo pra ficar humano.',
    },
    {
      topic: 'Plano de captação de paciente',
      with: 'Estratégia personalizada pra psicóloga infantil — canais que funcionam, mensagens que conectam com pais.',
      without: 'Conselhos vagos pra "qualquer profissional liberal". Não considera quem é seu público.',
    },
    {
      topic: 'Privacidade dos seus dados',
      with: 'RLS no banco, conta isolada, exportação em JSON, exclusão definitiva em 1 clique.',
      without: 'Conversas em conta pessoal, sem controle granular. Risco de vazar em prompt compartilhado.',
    },
    {
      topic: 'Custo previsível',
      with: 'Mensalidade fixa. R$ 19,90/mês. Sem cobrança por uso.',
      without: 'Plano da OpenAI por usuário (R$ 100+/mês). Ou conta zero free com limite frustrante.',
    },
  ]

  return (
    <section id="comparativo" className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Com ColméIA{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: BRAND_GRADIENT }}>
              vs.
            </span>{' '}
            ChatGPT genérico
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            O que muda quando você usa uma IA pensada pro seu trabalho.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1.5fr]">
            <div className="hidden md:block bg-primary-50 px-5 py-4 border-b border-primary-100" />
            <div
              className="px-5 py-4 border-b border-primary-100 text-center text-sm font-bold text-white"
              style={{ background: BRAND_GRADIENT }}
            >
              Com ColméIA
            </div>
            <div className="hidden md:block px-5 py-4 border-b border-primary-100 bg-gray-50 text-center text-sm font-bold text-text-secondary">
              Com IA genérica
            </div>

            {rows.map((row, i) => (
              <div key={i} className="contents">
                <div className="px-5 py-4 bg-primary-50/40 border-b border-primary-100 text-base font-semibold text-text-primary md:flex md:items-center">
                  {row.topic}
                </div>
                <div className="px-5 py-4 border-b border-primary-100 text-base text-text-primary md:border-l md:border-primary-100" style={{ background: 'rgba(105,8,11,0.02)' }}>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 mt-0.5 shrink-0 text-primary-600" />
                    <span>{row.with}</span>
                  </div>
                </div>
                <div className="px-5 py-4 border-b border-primary-100 text-base text-text-secondary md:border-l md:border-gray-200">
                  <div className="flex items-start gap-2">
                    <XIcon className="h-5 w-5 mt-0.5 shrink-0 text-gray-400" />
                    <span>{row.without}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesGrid() {
  const features = [
    { icon: <Brain className="h-5 w-5" />, label: 'Agente de planejamento' },
    { icon: <Megaphone className="h-5 w-5" />, label: 'Agente de conteúdo' },
    { icon: <Heart className="h-5 w-5" />, label: 'Agente de captação' },
    { icon: <FileText className="h-5 w-5" />, label: 'Análise de PDFs (fichas)' },
    { icon: <MessageCircle className="h-5 w-5" />, label: 'Conversas ilimitadas' },
    { icon: <Layers className="h-5 w-5" />, label: 'Histórico organizado' },
    { icon: <Clock className="h-5 w-5" />, label: 'Disponível 24h' },
    { icon: <Calendar className="h-5 w-5" />, label: 'Sem agenda, sem fila' },
    { icon: <ShieldCheck className="h-5 w-5" />, label: 'Dados isolados (RLS)' },
    { icon: <Lock className="h-5 w-5" />, label: 'Conta protegida' },
    { icon: <Zap className="h-5 w-5" />, label: 'Resposta em segundos' },
    { icon: <Users className="h-5 w-5" />, label: 'Suporte humano via WhatsApp' },
  ]

  return (
    <section className="py-16 sm:py-20 bg-bg-alternate border-y border-primary-50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            E ainda tem mais
          </h2>
          <p className="mt-3 text-base text-text-secondary">
            Funcionalidades pensadas pra rotina real do consultório infantil.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-4 hover:border-primary-300 hover:shadow-sm transition-all">
              <div
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
                style={{ background: BRAND_GRADIENT }}
              >
                {f.icon}
              </div>
              <span className="text-sm font-medium text-text-primary">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing({ onSwitch }) {
  const monthlyPrice = PRICING.monthly.price
  const yearlyPrice = PRICING.yearly.price
  const yearlyEquivalent = (yearlyPrice / 12).toFixed(2).replace('.', ',')
  const savingPct = Math.round((1 - (yearlyPrice / (monthlyPrice * 12))) * 100)

  return (
    <section id="precos" className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Escolha como quer pagar
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Acesso completo aos 3 agentes nos dois planos. Diferença é só na duração e no preço.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Plano Mensal */}
          <div className="rounded-2xl border-2 border-primary-100 bg-white p-6 sm:p-8 shadow-card">
            <h3 className="text-xl font-bold text-text-primary mb-2">Mensal</h3>
            <p className="text-sm text-text-secondary mb-6">Sem compromisso. Cancela quando quiser.</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-extrabold text-text-primary">{PRICING.monthly.label}</span>
              <span className="text-base text-text-secondary">/mês</span>
            </div>
            <a
              href={CHECKOUT_URLS.monthly}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white border-2 border-primary-600 text-primary-600 font-bold py-3.5 rounded-xl text-base hover:bg-primary-50 transition text-center"
            >
              Assinar mensal
            </a>
            <ul className="mt-6 space-y-2.5">
              {[
                'Acesso aos 3 agentes especializados',
                'Anexar PDFs de fichas clínicas',
                'Histórico de conversas',
                'Suporte por WhatsApp',
              ].map((it, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-text-primary">
                  <Check className="h-5 w-5 mt-0.5 shrink-0 text-primary-600" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Plano Anual */}
          <div
            className="relative rounded-2xl bg-white p-6 sm:p-8 shadow-card-hover overflow-hidden"
            style={{ borderWidth: 2, borderStyle: 'solid', borderColor: '#69080b' }}
          >
            <div
              className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white uppercase tracking-wide rounded-bl-xl"
              style={{ background: BRAND_GRADIENT }}
            >
              Economize {savingPct}%
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Anual</h3>
            <p className="text-sm text-text-secondary mb-6">Melhor custo-benefício. Equivale a R$ {yearlyEquivalent}/mês.</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-extrabold text-text-primary">{PRICING.yearly.label}</span>
              <span className="text-base text-text-secondary">/ano</span>
            </div>
            <p className="text-sm text-text-secondary mb-6">Pago à vista — 12 meses de acesso.</p>
            <a
              href={CHECKOUT_URLS.yearly}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: BRAND_GRADIENT }}
              className="block w-full text-white font-bold py-3.5 rounded-xl text-base shadow-button hover:shadow-card-hover transition text-center"
            >
              Assinar anual
            </a>
            <ul className="mt-6 space-y-2.5">
              {[
                'Tudo do mensal',
                'Economia equivalente a 2 meses grátis',
                'Assinatura anual',
                'Suporte prioritário por WhatsApp',
              ].map((it, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-text-primary">
                  <Check className="h-5 w-5 mt-0.5 shrink-0 text-primary-600" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Já tem conta?{' '}
          <button onClick={() => onSwitch('login')} className="text-primary-600 font-semibold hover:underline">
            Entrar
          </button>
        </p>
      </div>
    </section>
  )
}

function Faq() {
  const items = [
    {
      q: 'Preciso saber usar IA?',
      a: 'Não. É como conversar pelo WhatsApp — você digita a dúvida e o agente responde. Não tem comando especial nem prompt complicado pra decorar.',
    },
    {
      q: 'Funciona pra qual abordagem terapêutica?',
      a: 'Os agentes foram pensados pra serem úteis em diferentes abordagens da psicologia infantil (TCC, ludoterapia, análise do comportamento, etc). Você guia a conversa com o referencial que usa no consultório.',
    },
    {
      q: 'Posso enviar fichas de pacientes?',
      a: 'Pode, em PDF de até 20MB. Recomendamos fortemente anonimizar dados sensíveis antes (nome, data de nascimento, CPF, endereço) — você é a titular responsável pelos dados que compartilha.',
    },
    {
      q: 'Como funciona o pagamento?',
      a: 'Pelo Hotmart, com cartão de crédito ou PIX. Acesso imediato após confirmação. Cancelamento direto pela plataforma, sem multa.',
    },
    {
      q: 'Meus dados ficam seguros?',
      a: 'Sim. Cada conta tem isolamento total no banco (Row Level Security), suas conversas não são compartilhadas com ninguém, e a OpenAI (que processa as respostas) não usa dados via API pra treinar modelos. Você pode exportar tudo em JSON ou apagar a conta inteira a qualquer momento.',
    },
    {
      q: 'Os agentes substituem supervisão clínica?',
      a: 'Não. A ColméIA é uma ferramenta de apoio ao planejamento e produção de conteúdo. Não substitui supervisão, formação continuada, julgamento clínico nem responsabilidade profissional.',
    },
    {
      q: 'Quanto tempo demora pra começar?',
      a: 'Cerca de 2 minutos — você assina pelo Hotmart, cria sua conta com o mesmo e-mail, e já está conversando com os agentes.',
    },
    {
      q: 'Funciona no celular?',
      a: 'Sim. A plataforma é responsiva e funciona no navegador do celular, tablet e computador. Não tem aplicativo separado — você acessa direto pelo site.',
    },
  ]

  return (
    <section id="faq" className="py-20 sm:py-28 bg-bg-alternate border-y border-primary-50">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Perguntas frequentes
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Se faltou alguma, é só chamar a gente no WhatsApp.
          </p>
        </div>
        <FaqAccordion items={items} />
      </div>
    </section>
  )
}

function FaqAccordion({ items }) {
  const [openIdx, setOpenIdx] = useState(-1)
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const open = openIdx === i
        return (
          <div key={i} className="rounded-xl border border-primary-100 bg-white overflow-hidden shadow-card">
            <button
              onClick={() => setOpenIdx(open ? -1 : i)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-primary-50/40 transition"
            >
              <span className="text-base font-semibold text-text-primary">{item.q}</span>
              <ChevronDown className={`h-5 w-5 text-primary-600 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="px-5 pb-4 -mt-1 text-base text-text-secondary leading-relaxed animate-fade-in">
                {item.a}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function FinalCta({ onSwitch }) {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div
          className="relative overflow-hidden rounded-3xl p-8 sm:p-14 text-center"
          style={{ background: BRAND_GRADIENT }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Bora ganhar tempo na rotina?
            </h2>
            <p className="mt-4 text-lg text-white/90 max-w-xl mx-auto">
              Os 3 agentes esperam você. Em 2 minutos a sua conta está pronta.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#precos"
                className="inline-flex items-center gap-2 bg-white font-bold text-base px-7 py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md text-primary-600"
              >
                Ver planos
                <ArrowRight className="h-4 w-4" />
              </a>
              <button
                onClick={() => onSwitch('login')}
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 font-semibold px-7 py-3.5 rounded-xl transition"
              >
                Já tenho conta
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4" /> Pagamento seguro Hotmart</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4" /> Cancela quando quiser</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Dados protegidos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer({ onSwitch }) {
  return (
    <footer className="border-t border-primary-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo-dark.png" alt="ColméIA Infantil" className="h-14 sm:h-16 w-auto" />
            <span className="text-sm text-text-secondary">IA especializada pra psicólogas infantis.</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-secondary">
            <a href="#agentes" className="hover:text-primary-600 transition">Agentes</a>
            <a href="#recursos" className="hover:text-primary-600 transition">Recursos</a>
            <a href="#precos" className="hover:text-primary-600 transition">Preços</a>
            <a href="#faq" className="hover:text-primary-600 transition">FAQ</a>
            <button onClick={() => onSwitch('login')} className="hover:text-primary-600 transition">Entrar</button>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-primary-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
          <div className="flex items-center gap-4 flex-wrap">
            <p>© {new Date().getFullYear()} ColméIA Infantil.</p>
            <button onClick={() => onSwitch('termos')} className="hover:text-primary-600 transition">Termos de uso</button>
            <button onClick={() => onSwitch('privacidade')} className="hover:text-primary-600 transition">Privacidade</button>
            <button onClick={() => onSwitch('suporte')} className="hover:text-primary-600 transition">Suporte</button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function ScreenshotFrame({ src, alt, fallback, className = '' }) {
  const [errored, setErrored] = useState(false)
  if (!src || errored) {
    return (
      <div className={`relative w-full overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-xl shadow-primary-600/5 ${className}`}>
        {fallback}
      </div>
    )
  }
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-xl shadow-primary-600/5 ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-auto block"
        loading="lazy"
        onError={() => setErrored(true)}
      />
    </div>
  )
}
