export const AGENTS = [
  {
    id: 'psico',
    label: 'Planejamento de sessões',
    icon: 'calendar',
    description: 'Planeje sessões terapêuticas com inteligência artificial',
    color: '#762E9F',
  },
  {
    id: 'marketing',
    label: 'Criação de conteúdos',
    icon: 'instagram',
    description: 'Crie conteúdo de marketing para redes sociais',
    color: '#E1306C',
  },
  {
    id: 'customerAcquisition',
    label: 'Captação de pacientes',
    icon: 'userPlus',
    description: 'Estratégias para captar novos pacientes',
    color: '#249689',
  },
]

export function getAgent(agentId) {
  return AGENTS.find(a => a.id === agentId)
}
