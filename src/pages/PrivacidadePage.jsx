export default function PrivacidadePage({ onSwitch }) {
  return (
    <div className="min-h-screen bg-[#fffdf0] font-sans">
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <button
          onClick={() => onSwitch('landing')}
          className="text-sm font-semibold text-[#69080b] hover:text-[#7a1a1d] transition mb-8 inline-block"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl md:text-3xl font-extrabold text-[#69080b] mb-2">Política de Privacidade</h1>
        <p className="text-sm text-[#8a7560] mb-8">Última atualização: abril de 2026</p>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#f5e6b8] space-y-6 text-[15px] text-[#4a3520] leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">1. Controlador dos Dados</h2>
            <p>A ColméIA Infantil é a controladora dos dados pessoais coletados através da plataforma. Para questões relacionadas à privacidade, entre em contato pelo e-mail <a href="mailto:contato@colmeiainfantil.com.br" className="text-[#69080b] font-semibold hover:underline">contato@colmeiainfantil.com.br</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">2. Dados Coletados</h2>
            <p className="mb-2">Coletamos os seguintes dados:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Dados de cadastro:</strong> nome completo e endereço de e-mail</li>
              <li><strong>Dados de uso:</strong> conversas com os agentes de IA, histórico de chats e consumo de créditos</li>
              <li><strong>Documentos enviados:</strong> PDFs e arquivos que você envia voluntariamente para análise pelos agentes</li>
              <li><strong>Dados técnicos:</strong> informações de acesso como IP, navegador e dispositivo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">3. Finalidade do Tratamento</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fornecer e manter o funcionamento da plataforma</li>
              <li>Processar suas conversas com os agentes de IA</li>
              <li>Gerenciar sua assinatura e créditos de uso</li>
              <li>Enviar comunicações relacionadas ao serviço</li>
              <li>Melhorar a qualidade da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">4. Uso de Inteligência Artificial</h2>
            <p>As mensagens enviadas aos agentes são processadas pela API da OpenAI para gerar respostas. A OpenAI não utiliza dados enviados via API para treinar seus modelos. As conversas são armazenadas no banco de dados da plataforma (Supabase) e associadas à sua conta.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">5. Dados de Pacientes</h2>
            <p>Se você enviar documentos contendo dados de pacientes (relatórios, anamneses, fichas), esses dados são tratados com o mesmo nível de segurança dos demais dados da plataforma. Recomendamos que você anonimize informações sensíveis antes do envio. A responsabilidade pelo compartilhamento de dados de pacientes é da profissional titular da conta.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">6. Armazenamento e Segurança</h2>
            <p>Os dados são armazenados no Supabase (infraestrutura em nuvem com criptografia em repouso e em trânsito). O acesso ao banco de dados é protegido por Row Level Security (RLS), garantindo que cada usuária acesse apenas seus próprios dados.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">7. Compartilhamento com Terceiros</h2>
            <p className="mb-2">Seus dados podem ser compartilhados com:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase:</strong> armazenamento e autenticação</li>
              <li><strong>OpenAI:</strong> processamento das conversas com IA</li>
              <li><strong>Hotmart:</strong> processamento de pagamentos e gestão de assinaturas</li>
              <li><strong>Vercel:</strong> hospedagem da aplicação</li>
            </ul>
            <p className="mt-2">Não vendemos nem compartilhamos seus dados para fins de marketing de terceiros.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">8. Cookies</h2>
            <p>Utilizamos cookies essenciais para manter sua sessão ativa e garantir o funcionamento da plataforma. Não utilizamos cookies de rastreamento ou publicidade.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">9. Seus Direitos (LGPD)</h2>
            <p className="mb-2">Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar o consentimento para o tratamento</li>
              <li>Solicitar a portabilidade dos dados</li>
            </ul>
            <p className="mt-2">Para exercer esses direitos, envie um e-mail para <a href="mailto:contato@colmeiainfantil.com.br" className="text-[#69080b] font-semibold hover:underline">contato@colmeiainfantil.com.br</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">10. Retenção de Dados</h2>
            <p>Seus dados são mantidos enquanto sua conta estiver ativa. Após o cancelamento, os dados são retidos por até 90 dias para possível reativação e, em seguida, excluídos permanentemente.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#69080b] mb-2">11. Alterações</h2>
            <p>Esta política pode ser atualizada periodicamente. Alterações significativas serão comunicadas por e-mail. A versão mais recente estará sempre disponível nesta página.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
