import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PRICING, CHECKOUT_URLS } from '../lib/config'
import AgentIcon from '../components/AgentIcon'

const FAQ_ITEMS = [
  {
    q: 'Preciso saber usar IA?',
    a: 'Não! É como conversar no WhatsApp. Você digita sua dúvida e o agente responde.',
  },
  {
    q: 'Minhas conversas são privadas?',
    a: 'Sim. Cada conta é individual e suas conversas não são compartilhadas.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim, sem multa e sem burocracia.',
  },
  {
    q: 'Os agentes substituem supervisão clínica?',
    a: 'Não. A ColméIA é uma ferramenta de apoio ao planejamento. Não substitui supervisão, formação continuada ou julgamento clínico.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'Pelo Hotmart, com cartão ou PIX. Você recebe acesso imediato após a confirmação.',
  },
]

function FaqItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#f5e6b8] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="text-[15px] font-semibold text-text-primary leading-snug">{item.q}</span>
        <ChevronDown
          className={`w-5 h-5 text-secondary flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="text-sm text-text-secondary leading-relaxed pb-5 pr-8">
          {item.a}
        </p>
      )}
    </div>
  )
}

export default function LandingPage({ onSwitch }) {
  return (
    <div className="min-h-screen bg-bg-main font-sans">

      {/* ─── NAV ─── */}
      <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-5">
        <img
          src="/wordmark.png"
          alt="ColméIA Infantil"
          style={{ height: 44 }}
          className="object-contain"
          draggable={false}
        />
        <button
          onClick={() => onSwitch('login')}
          className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
        >
          Entrar
        </button>
      </nav>

      {/* ─── HERO ─── */}
      <section className="bg-[#fff8e1] px-6 md:px-12 lg:px-20 pt-14 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-[2.75rem] font-extrabold text-primary-600 leading-[1.15] mb-5 tracking-tight">
            Sua assistente de IA<br className="hidden md:block" /> para psicologia infantil
          </h1>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-xl mb-10">
            Planeje sessões, crie conteúdo e capte pacientes com inteligência artificial. Feita por quem entende sua rotina.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onSwitch('signup')}
              className="px-8 py-3.5 bg-primary-600 text-white rounded-xl font-bold text-[15px] hover:bg-primary-700 transition shadow-button"
            >
              Começar agora
            </button>
            <button
              onClick={() => onSwitch('login')}
              className="px-8 py-3.5 border-2 border-primary-600 text-primary-600 rounded-xl font-bold text-[15px] hover:bg-[#fff0c2] transition"
            >
              Já tenho conta
            </button>
          </div>
        </div>
      </section>

      {/* ─── AGENTES ─── */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-8">O que a ColméIA faz por você</p>

        <div className="flex flex-col md:flex-row gap-4 md:gap-5 max-w-4xl md:items-end">
          {/* Card 1 — altura normal */}
          <div className="md:w-[30%] bg-[#fffbf0] rounded-2xl p-6 shadow-card border border-[#f5e6b8]">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: '#69080b15' }}
            >
              <AgentIcon icon="calendar" size={22} style={{ color: '#69080b' }} />
            </div>
            <h3 className="text-[15px] font-bold text-text-primary mb-1.5">Planejamento de sessões</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Receba sugestões personalizadas de atividades, técnicas e abordagens para cada paciente
            </p>
          </div>

          {/* Card 2 — destaque central, maior */}
          <div className="md:w-[40%] bg-[#fff8e1] rounded-2xl p-7 shadow-card border border-[#f0d97a]">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ backgroundColor: '#bf782e15' }}
            >
              <AgentIcon icon="instagram" size={24} style={{ color: '#bf782e' }} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Criação de conteúdos</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Gere posts, textos e materiais educativos para suas redes sociais
            </p>
          </div>

          {/* Card 3 — altura normal */}
          <div className="md:w-[30%] bg-[#fffbf0] rounded-2xl p-6 shadow-card border border-[#f5e6b8]">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: '#d7a53c15' }}
            >
              <AgentIcon icon="userPlus" size={22} style={{ color: '#d7a53c' }} />
            </div>
            <h3 className="text-[15px] font-bold text-text-primary mb-1.5">Captação de pacientes</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Estratégias para atrair e fidelizar famílias no seu consultório
            </p>
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section className="bg-[#ffefac] px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <p className="text-xs font-bold uppercase tracking-widest text-primary-600/60 mb-10">Como funciona</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12 max-w-3xl">
          {[
            { n: '01', title: 'Cadastre-se', desc: 'Crie sua conta em menos de um minuto' },
            { n: '02', title: 'Escolha o agente', desc: 'Sessões, conteúdo ou captação — você decide' },
            { n: '03', title: 'Converse', desc: 'Receba orientações práticas e personalizadas' },
          ].map(step => (
            <div key={step.n}>
              <span className="text-3xl font-extrabold text-primary-600/20">{step.n}</span>
              <h3 className="text-base font-bold text-text-primary mt-2 mb-1">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PREÇOS ─── */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">Planos</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-primary-600 mb-10 leading-tight">
          Simples e sem surpresas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
          {/* Mensal */}
          <div className="bg-white rounded-2xl p-7 shadow-card border border-primary-50">
            <p className="text-sm font-semibold text-secondary mb-4">Mensal</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-extrabold text-text-primary">{PRICING.monthly.label}</span>
              <span className="text-sm text-secondary">/mês</span>
            </div>
            <ul className="text-sm text-text-secondary space-y-2.5 mb-8">
              <li>Acesso aos 3 agentes</li>
              <li>Conversas ilimitadas</li>
              <li>Cancele quando quiser</li>
            </ul>
            <a
              href={CHECKOUT_URLS.monthly}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-xl border-2 border-primary-600 text-primary-600 font-bold text-sm hover:bg-primary-50 transition"
            >
              Assinar mensal
            </a>
          </div>

          {/* Anual — destaque */}
          <div className="bg-primary-600 rounded-2xl p-7 shadow-card relative">
            <span className="absolute -top-3 right-6 bg-accent-yellow text-primary-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Economia de {PRICING.yearly.savings}
            </span>
            <p className="text-sm font-semibold text-primary-200 mb-4">Anual</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-extrabold text-white">{PRICING.yearly.label}</span>
              <span className="text-sm text-primary-200">/ano</span>
            </div>
            <p className="text-sm text-primary-200 mb-6">12x R$ 19,75</p>
            <ul className="text-sm text-primary-100 space-y-2.5 mb-8">
              <li>Tudo do plano mensal</li>
              <li>Equivale a {PRICING.yearly.monthlyEquivalent}</li>
              <li>2 meses grátis</li>
            </ul>
            <a
              href={CHECKOUT_URLS.yearly}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-xl bg-accent-yellow text-primary-600 font-bold text-sm hover:brightness-105 transition"
            >
              Assinar anual
            </a>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-[#fff8e1] px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">Dúvidas frequentes</p>
          <h2 className="text-2xl font-extrabold text-primary-600 mb-10">Antes de começar</h2>

          <div className="bg-white rounded-2xl px-6 md:px-8 shadow-card border border-[#f5e6b8]">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} item={item} />
            ))}
          </div>

          <div className="mt-10">
            <p className="text-sm text-text-secondary mb-3">Ainda tem dúvidas?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/5500000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:brightness-95 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.106 1.52 5.837L.057 23.7l5.992-1.572A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.978 0-3.81-.583-5.352-1.584l-.384-.228-3.556.933.95-3.467-.25-.398A9.82 9.82 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z"/></svg>
                WhatsApp
              </a>
              <a
                href="mailto:contato@colmeiainfantil.com.br"
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-secondary/30 text-text-secondary rounded-xl text-sm font-semibold hover:bg-white transition"
              >
                contato@colmeiainfantil.com.br
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="bg-[#face0a] px-6 md:px-12 lg:px-20 py-20 md:py-24 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-primary-600 mb-4 leading-tight">
          Pronta para transformar<br className="hidden sm:block" /> seus atendimentos?
        </h2>
        <p className="text-primary-600/70 mb-8 max-w-md mx-auto">
          Comece hoje e veja a diferença na sua rotina clínica.
        </p>
        <button
          onClick={() => onSwitch('signup')}
          className="px-10 py-3.5 bg-primary-600 text-white rounded-xl font-bold text-[15px] hover:bg-primary-700 transition shadow-button"
        >
          Criar minha conta
        </button>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-primary-100 px-6 md:px-12 lg:px-20 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src="/wordmark.png"
              alt="ColméIA Infantil"
              className="h-8 object-contain"
              draggable={false}
            />
            <span className="text-xs text-secondary">© 2026 ColméIA Infantil</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-secondary">
            <a href="#" className="hover:text-primary-600 transition">Termos de uso</a>
            <a href="#" className="hover:text-primary-600 transition">Política de privacidade</a>
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition"
            >
              Suporte
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
