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

const HexPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="hex" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
        <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="#69080b" strokeWidth="0.8" />
        <path d="M28 0L56 16L56 50L28 66L0 50L0 16Z" fill="none" stroke="#69080b" strokeWidth="0.8" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex)" />
  </svg>
)

const BeeTrail = () => (
  <div className="flex justify-center py-6 md:py-10 overflow-hidden">
    <svg width="280" height="48" viewBox="0 0 280 48" fill="none" className="text-[#d7a53c]">
      <path
        d="M0 36 C60 36, 60 12, 140 12 S220 36, 280 36"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 6"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <ellipse cx="268" cy="36" rx="7" ry="5.5" fill="#face0a" stroke="#69080b" strokeWidth="1" />
      <ellipse cx="264" cy="36" rx="3" ry="4" fill="#69080b" opacity="0.7" />
      <ellipse cx="272" cy="31" rx="4" ry="2.5" fill="#a7d4e6" opacity="0.6" transform="rotate(-20 272 31)" />
      <ellipse cx="268" cy="30" rx="3.5" ry="2" fill="#a7d4e6" opacity="0.6" transform="rotate(10 268 30)" />
    </svg>
  </div>
)

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.106 1.52 5.837L.057 23.7l5.992-1.572A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.978 0-3.81-.583-5.352-1.584l-.384-.228-3.556.933.95-3.467-.25-.398A9.82 9.82 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z"/></svg>
)

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
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 md:px-10 py-5">
        <div className="flex items-center gap-3">
          <img
            src="/wordmark.png"
            alt="ColméIA Infantil"
            style={{ height: 44 }}
            className="object-contain"
            draggable={false}
          />
        </div>
        <button
          onClick={() => onSwitch('login')}
          className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
        >
          Entrar
        </button>
      </nav>

      {/* ─── HERO ─── */}
      <section className="bg-[#fff8e1]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 pt-14 pb-20 md:pt-20 md:pb-28 flex flex-col md:flex-row md:items-center md:gap-12">
          <div className="flex-1">
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
          {/* Bee mascot */}
          <div className="hidden md:flex items-center justify-center flex-shrink-0">
            <img
              src="/favicon.png"
              alt="Abelha ColméIA"
              className="w-40 lg:w-52 drop-shadow-lg"
              draggable={false}
            />
          </div>
        </div>
      </section>

      <BeeTrail />

      {/* ─── AGENTES ─── */}
      <section className="max-w-5xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-8 text-center">O que a ColméIA faz por você</p>

        <div className="flex flex-col md:flex-row gap-4 md:gap-5 md:items-end md:justify-center">
          {/* Card 1 */}
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

          {/* Card 2 — destaque central */}
          <div className="md:w-[36%] bg-[#fff8e1] rounded-2xl p-7 shadow-card border border-[#f0d97a]">
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

          {/* Card 3 */}
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

      <BeeTrail />

      {/* ─── COMO FUNCIONA ─── */}
      <section className="bg-[#ffefac] relative overflow-hidden">
        <HexPattern />
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20 md:py-28 relative">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-600/60 mb-10 text-center">Como funciona</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12 max-w-3xl mx-auto">
            {[
              { n: '01', title: 'Cadastre-se', desc: 'Crie sua conta em menos de um minuto' },
              { n: '02', title: 'Escolha o agente', desc: 'Sessões, conteúdo ou captação — você decide' },
              { n: '03', title: 'Converse', desc: 'Receba orientações práticas e personalizadas' },
            ].map(step => (
              <div key={step.n} className="text-center md:text-left">
                <span className="text-3xl font-extrabold text-primary-600/20">{step.n}</span>
                <h3 className="text-base font-bold text-text-primary mt-2 mb-1">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PREÇOS ─── */}
      <section className="max-w-5xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3 text-center">Planos</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-primary-600 mb-10 leading-tight text-center">
          Simples e sem surpresas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
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
      <section className="bg-[#fff8e1] relative overflow-hidden">
        <HexPattern />
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20 md:py-28 relative">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3 text-center">Dúvidas frequentes</p>
          <h2 className="text-2xl font-extrabold text-primary-600 mb-10 text-center">Antes de começar</h2>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl px-6 md:px-8 shadow-card border border-[#f5e6b8]">
              {FAQ_ITEMS.map((item, i) => (
                <FaqItem key={i} item={item} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-text-secondary mb-4">Ainda tem dúvidas?</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/5500000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </a>
                <a
                  href="mailto:contato@colmeiainfantil.com.br"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-secondary/30 text-text-secondary rounded-xl text-sm font-semibold hover:bg-white transition"
                >
                  contato@colmeiainfantil.com.br
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="bg-[#face0a] relative overflow-hidden">
        <img
          src="/favicon.png"
          alt=""
          className="absolute right-8 md:right-20 bottom-4 md:bottom-8 w-24 md:w-36 opacity-[0.12] pointer-events-none select-none"
          draggable={false}
        />
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20 md:py-24 text-center relative">
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
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-primary-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
            <button onClick={() => onSwitch('termos')} className="hover:text-primary-600 transition">Termos de uso</button>
            <button onClick={() => onSwitch('privacidade')} className="hover:text-primary-600 transition">Política de privacidade</button>
            <button onClick={() => onSwitch('suporte')} className="hover:text-primary-600 transition">Suporte</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
