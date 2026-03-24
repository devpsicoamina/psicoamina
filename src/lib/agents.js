export const AGENTS = [
  {
    id: 'psico',
    label: 'Planejamento de sessões',
    icon: 'calendar',
    description: 'Planeje sessões terapêuticas com inteligência artificial',
    color: '#69080b',
  },
  {
    id: 'marketing',
    label: 'Criação de conteúdos',
    icon: 'instagram',
    description: 'Crie conteúdo de marketing para redes sociais',
    color: '#bf782e',
  },
  {
    id: 'customerAcquisition',
    label: 'Captação de pacientes',
    icon: 'userPlus',
    description: 'Estratégias para captar novos pacientes',
    color: '#d7a53c',
  },
]

export function getAgent(agentId) {
  return AGENTS.find(a => a.id === agentId)
}
