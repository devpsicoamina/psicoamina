export default function TermosPage({ onSwitch }) {
  return (
    <div className="min-h-screen bg-[#fffdf0] font-sans">
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <button
          onClick={() => onSwitch('landing')}
          className="text-sm font-semibold text-[#69080b] hover:text-[#7a1a1d] transition mb-8 inline-block"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl md:text-3xl font-extrabold text-[#69080b] mb-2">Termos de Uso</h1>
        <p className="text-sm text-[#8a7560] mb-8">Última atualização: abril de 2026</p>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#f5e6b8] space-y-6 text-[15px] text-[#4a3520] leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">1. Aceitação dos Termos</h2>
            <p>Ao criar uma conta e utilizar a plataforma ColméIA Infantil, você concorda com estes Termos de Uso. Se não concordar com alguma condição, não utilize o serviço.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">2. Descrição do Serviço</h2>
            <p>A ColméIA Infantil é uma plataforma SaaS que oferece assistentes de inteligência artificial especializados para psicólogas infantis. Os agentes auxiliam no planejamento de sessões, criação de conteúdo para redes sociais e estratégias de captação de pacientes.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">3. Natureza do Serviço</h2>
            <p>A ColméIA é uma <strong>ferramenta auxiliar</strong>. As sugestões geradas pela inteligência artificial não substituem julgamento clínico, supervisão profissional, formação continuada ou qualquer orientação de órgãos reguladores. A responsabilidade pelas decisões clínicas é exclusivamente da profissional que utiliza o serviço.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">4. Conta e Acesso</h2>
            <p>Você é responsável por manter a confidencialidade de suas credenciais de acesso. Cada conta é individual e intransferível. Notifique-nos imediatamente caso suspeite de uso não autorizado.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">5. Créditos e Uso</h2>
            <p>O acesso à plataforma é concedido mediante assinatura (mensal ou anual). Cada plano inclui uma quantidade de créditos mensais de uso. Os créditos não utilizados no mês não são acumulados para o período seguinte.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">6. Propriedade Intelectual</h2>
            <p>O conteúdo gerado pela IA durante o uso da plataforma pode ser utilizado livremente pela usuária para fins profissionais. A plataforma ColméIA Infantil, incluindo código, design e marca, é propriedade dos seus desenvolvedores e não pode ser reproduzida sem autorização.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">7. Dados de Pacientes</h2>
            <p>Ao enviar documentos (PDFs, relatórios, anamneses), você declara que possui autorização para compartilhar essas informações e que está em conformidade com a LGPD e o Código de Ética Profissional do Psicólogo. A ColméIA não se responsabiliza pelo conteúdo enviado pela usuária.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">8. Cancelamento</h2>
            <p>Você pode cancelar sua assinatura a qualquer momento, sem multa. O acesso permanece ativo até o final do período já pago. Não há reembolso proporcional para períodos parciais.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">9. Modificações</h2>
            <p>Reservamo-nos o direito de atualizar estes Termos. Alterações significativas serão comunicadas por e-mail ou pela própria plataforma. O uso continuado após a notificação constitui aceitação dos novos termos.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">10. Contato</h2>
            <p>Dúvidas sobre estes Termos podem ser enviadas para <a href="mailto:contato@colmeiainfantil.com.br" className="text-[#69080b] font-semibold hover:underline">contato@colmeiainfantil.com.br</a>.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
