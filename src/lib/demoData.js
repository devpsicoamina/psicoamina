export const DEMO_USER = {
  id: 'demo-user-id',
  email: 'paula@colmeiainfantil.com.br',
}

export const DEMO_PROFILE = {
  id: 'demo-profile-id',
  user_auth_id: 'demo-user-id',
  fullname: 'Dra. Paula Fernandes',
  profile_pic_url: null,
  subscription_active: true,
  plan_type: 'monthly',
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
}

export const DEMO_TOKEN_USAGE = {
  tokens_used: 23400,
  progress_bar_value: 0.29,
}

export const DEMO_CHATS = [
  {
    id: 'demo-chat-1',
    user_auth_id: 'demo-user-id',
    agent_type: 'psico',
    title: 'Planejamento — Pedro H., 7 anos',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    attached_file_name: null,
    attached_file_text: null,
  },
  {
    id: 'demo-chat-2',
    user_auth_id: 'demo-user-id',
    agent_type: 'marketing',
    title: 'Conteúdo para Instagram — maio',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    attached_file_name: null,
    attached_file_text: null,
  },
  {
    id: 'demo-chat-3',
    user_auth_id: 'demo-user-id',
    agent_type: 'customerAcquisition',
    title: 'Estratégia de captação Q2',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    attached_file_name: null,
    attached_file_text: null,
  },
]

export const DEMO_MESSAGES = {
  'demo-chat-1': [
    {
      id: 'msg-1',
      chat_id: 'demo-chat-1',
      sender: 'human',
      message: 'Preciso planejar uma sessão de 50 minutos para um paciente de 7 anos com ansiedade de separação.',
      created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-2',
      chat_id: 'demo-chat-1',
      sender: 'agent',
      message: `**Planejamento de Sessão — Ansiedade de Separação (7 anos)**\n\n**Objetivo da sessão:** Fortalecer a regulação emocional e reduzir a ansiedade antecipatória.\n\n**Estrutura (50 minutos):**\n\n**1. Acolhimento e rapport (5 min)**\nInicie com uma atividade de escolha livre para criar segurança. Pergunte como foi a semana sem pressão.\n\n**2. Identificação emocional (10 min)**\nUse o "Termômetro das Emoções" — peça que a criança desenhe ou aponte como está se sentindo hoje. Explore o que aconteceu quando sentiu ansiedade.\n\n**3. Atividade principal (20 min)**\nJogo simbólico com bonecos representando separação e reencontro. Deixe a criança conduzir a narrativa, intervindo sutilmente para propor resoluções adaptativas.\n\n**4. Técnica de regulação (10 min)**\nRespiração do urso: inspire contando 4 tempos, segure 2, expire 6. Pratique junto e ensine para levar para casa.\n\n**5. Fechamento (5 min)**\nCombine uma "missão da semana" — praticar a respiração antes de dormir. Reforce o vínculo e prepare para a despedida da sessão.`,
      created_at: new Date(Date.now() - 88 * 60 * 1000).toISOString(),
    },
  ],
  'demo-chat-2': [
    {
      id: 'msg-3',
      chat_id: 'demo-chat-2',
      sender: 'human',
      message: 'Crie 3 ideias de posts para o Instagram sobre ansiedade infantil.',
      created_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-4',
      chat_id: 'demo-chat-2',
      sender: 'agent',
      message: `**3 ideias de posts — Ansiedade Infantil**\n\n**Post 1 — Carrossel educativo**\n*"5 sinais de que seu filho pode estar ansioso (e o que fazer)"*\nAborde sintomas físicos como dor de barriga e dificuldade para dormir. CTA: salvar e compartilhar com outros pais.\n\n**Post 2 — Reels curto (30s)**\n*"A técnica da respiração do urso que toda criança deveria aprender"*\nDemontre a técnica de forma visual e lúdica. Alta chance de compartilhamento.\n\n**Post 3 — Depoimento + educação**\n*"Quando a escola vira fonte de angústia..."*\nAborde ansiedade de separação de forma empática para pais. Termine com convite para DM.`,
      created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    },
  ],
  'demo-chat-3': [],
}

export const DEMO_RESPONSES = [
  `Ótima pergunta! Com base no contexto clínico apresentado, sugiro iniciar com uma abordagem centrada na criança, priorizando o vínculo terapêutico antes de qualquer intervenção direta.\n\n**Pontos principais:**\n\n- Observe os padrões de comportamento nas primeiras sessões\n- Use jogos e atividades lúdicas como porta de entrada\n- Envolva os responsáveis no processo desde o início\n- Estabeleça metas claras e mensuráveis com a família`,
  `Com prazer! Aqui está uma estrutura que você pode adaptar:\n\n**Planejamento sugerido:**\n\n1. **Avaliação inicial** — 2 sessões de observação livre\n2. **Fase de intervenção** — técnicas baseadas em TCC adaptada para crianças\n3. **Orientação familiar** — sessões quinzenais com responsáveis\n4. **Reavaliação** — após 8 sessões\n\nQuer que eu detalhe alguma dessas etapas?`,
  `Excelente ponto! A literatura aponta que intervenções precoces têm resultados significativamente melhores nessa faixa etária.\n\n**Recursos que recomendo:**\n\n- Técnicas de regulação emocional adaptadas\n- Jogos terapêuticos estruturados\n- Psicoeducação para pais\n- Articulação com a escola quando necessário\n\nPosso elaborar um protocolo completo se quiser.`,
]
