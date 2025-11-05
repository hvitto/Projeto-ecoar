// Skills (Habilidades) data from Ecoar RPG

export interface SkillSpecialization {
  id: string
  name: string
}

export interface Skill {
  id: string
  name: string
  category: 'combate' | 'primarias' | 'artisticas' | 'cientificas' | 'motoras' | 'sociais' | 'gerais'
  attribute: 'forca' | 'finesse' | 'carisma' | 'inteligencia' | 'percepcao' | 'vitalidade' | 'vontade'
  specializations: SkillSpecialization[]
  description?: string
}

export const skills: Skill[] = [
  // Habilidades de Combate
  {
    id: 'armas-especiais',
    name: 'Armas Especiais',
    category: 'combate',
    attribute: 'forca',
    specializations: [
      { id: 'artilharia', name: 'Artilharia' },
      { id: 'cerco', name: 'Cerco' },
      { id: 'explosivos', name: 'Explosivos' },
    ],
  },
  {
    id: 'corpo-a-corpo',
    name: 'Corpo-a-corpo',
    category: 'combate',
    attribute: 'forca',
    specializations: [
      { id: 'briga', name: 'Briga' },
      { id: 'contusao', name: 'Contusão' },
      { id: 'duelo', name: 'Duelo' },
      { id: 'haste', name: 'Haste' },
      { id: 'laminas', name: 'Lâminas' },
    ],
  },
  {
    id: 'magica',
    name: 'Mágica',
    category: 'combate',
    attribute: 'inteligencia',
    specializations: [
      { id: 'arcana', name: 'Arcana' },
      { id: 'lethalis', name: 'Lethalis' },
      { id: 'natura', name: 'Natura' },
      { id: 'vox', name: 'Vox' },
    ],
  },
  {
    id: 'pontaria',
    name: 'Pontaria',
    category: 'combate',
    attribute: 'percepcao',
    specializations: [
      { id: 'arqueira', name: 'Arqueira' },
      { id: 'arremesso', name: 'Arremesso' },
      { id: 'precisao', name: 'Precisão' },
    ],
  },
  
  // Habilidades Primárias
  {
    id: 'atencao',
    name: 'Atenção',
    category: 'primarias',
    attribute: 'percepcao',
    specializations: [
      { id: 'arredores', name: 'Arredores' },
      { id: 'detalhes', name: 'Detalhes' },
      { id: 'rastreamento', name: 'Rastreamento' },
    ],
  },
  {
    id: 'compostura',
    name: 'Compostura',
    category: 'primarias',
    attribute: 'vontade',
    specializations: [
      { id: 'coragem', name: 'Coragem' },
      { id: 'disciplina', name: 'Disciplina' },
      { id: 'foco', name: 'Foco' },
    ],
  },
  {
    id: 'raciocinio',
    name: 'Raciocínio',
    category: 'primarias',
    attribute: 'inteligencia',
    specializations: [
      { id: 'iniciativa', name: 'Iniciativa' },
      { id: 'estrategia', name: 'Estratégia' },
      { id: 'analise', name: 'Análise' },
    ],
  },
  {
    id: 'reflexos',
    name: 'Reflexos',
    category: 'primarias',
    attribute: 'percepcao',
    specializations: [
      { id: 'esquiva', name: 'Esquiva' },
      { id: 'reacao', name: 'Reação' },
      { id: 'agilidade', name: 'Agilidade' },
    ],
  },
  
  // Habilidades Artísticas
  {
    id: 'artes-cenicas',
    name: 'Artes Cênicas',
    category: 'artisticas',
    attribute: 'carisma',
    specializations: [
      { id: 'teatro', name: 'Teatro' },
      { id: 'danca', name: 'Dança' },
      { id: 'performance', name: 'Performance' },
    ],
  },
  {
    id: 'artes-musicais',
    name: 'Artes Musicais',
    category: 'artisticas',
    attribute: 'carisma',
    specializations: [
      { id: 'canto', name: 'Canto' },
      { id: 'instrumento', name: 'Instrumento' },
      { id: 'composicao', name: 'Composição' },
    ],
  },
  {
    id: 'artes-literarias',
    name: 'Artes Literárias',
    category: 'artisticas',
    attribute: 'carisma',
    specializations: [
      { id: 'escrita', name: 'Escrita' },
      { id: 'poesia', name: 'Poesia' },
      { id: 'oratoria', name: 'Oratória' },
    ],
  },
  {
    id: 'artes-visuais',
    name: 'Artes Visuais',
    category: 'artisticas',
    attribute: 'carisma',
    specializations: [
      { id: 'pintura', name: 'Pintura' },
      { id: 'escultura', name: 'Escultura' },
      { id: 'design', name: 'Design' },
    ],
  },
  
  // Habilidades Científicas
  {
    id: 'pericias',
    name: 'Perícias',
    category: 'cientificas',
    attribute: 'inteligencia',
    specializations: [
      { id: 'investigacao', name: 'Investigação' },
      { id: 'identificacao', name: 'Identificação' },
      { id: 'avaliacao', name: 'Avaliação' },
    ],
  },
  {
    id: 'estudos',
    name: 'Estudos',
    category: 'cientificas',
    attribute: 'inteligencia',
    specializations: [
      { id: 'historia', name: 'História' },
      { id: 'ciencias', name: 'Ciências' },
      { id: 'linguas', name: 'Línguas' },
    ],
  },
  {
    id: 'quimica',
    name: 'Química',
    category: 'cientificas',
    attribute: 'inteligencia',
    specializations: [
      { id: 'alquimia', name: 'Alquimia' },
      { id: 'analise', name: 'Análise' },
      { id: 'sintese', name: 'Síntese' },
    ],
  },
  {
    id: 'medicina',
    name: 'Medicina',
    category: 'cientificas',
    attribute: 'inteligencia',
    specializations: [
      { id: 'diagnostico', name: 'Diagnóstico' },
      { id: 'cirurgia', name: 'Cirurgia' },
      { id: 'tratamento', name: 'Tratamento' },
    ],
  },
  
  // Habilidades Motoras
  {
    id: 'acrobacia',
    name: 'Acrobacia',
    category: 'motoras',
    attribute: 'finesse',
    specializations: [
      { id: 'equilibrio', name: 'Equilíbrio' },
      { id: 'saltos', name: 'Saltos' },
      { id: 'manobras', name: 'Manobras' },
    ],
  },
  {
    id: 'atletismo',
    name: 'Atletismo',
    category: 'motoras',
    attribute: 'forca',
    specializations: [
      { id: 'corrida', name: 'Corrida' },
      { id: 'natacao', name: 'Natação' },
      { id: 'escalada', name: 'Escalada' },
    ],
  },
  {
    id: 'furtividade',
    name: 'Furtividade',
    category: 'motoras',
    attribute: 'finesse',
    specializations: [
      { id: 'esconder-se', name: 'Esconder-se' },
      { id: 'silencia', name: 'Silêncio' },
      { id: 'movimento-furtivo', name: 'Movimento Furtivo' },
    ],
  },
  {
    id: 'prestidigitacao',
    name: 'Prestidigitação',
    category: 'motoras',
    attribute: 'finesse',
    specializations: [
      { id: 'manipulacao', name: 'Manipulação' },
      { id: 'furtividade-manual', name: 'Furtividade Manual' },
      { id: 'ilusionismo', name: 'Ilusionismo' },
    ],
  },
  
  // Habilidades Sociais
  {
    id: 'conversacao',
    name: 'Conversação',
    category: 'sociais',
    attribute: 'carisma',
    specializations: [
      { id: 'negociacao', name: 'Negociação' },
      { id: 'diplomacia', name: 'Diplomacia' },
      { id: 'persuasao', name: 'Persuasão' },
    ],
  },
  {
    id: 'enganacao',
    name: 'Enganação',
    category: 'sociais',
    attribute: 'carisma',
    specializations: [
      { id: 'mentira', name: 'Mentira' },
      { id: 'disfarce', name: 'Disfarce' },
      { id: 'bluff', name: 'Bluff' },
    ],
  },
  {
    id: 'empatia',
    name: 'Empatia',
    category: 'sociais',
    attribute: 'carisma',
    specializations: [
      { id: 'leitura-emocional', name: 'Leitura Emocional' },
      { id: 'motivacao', name: 'Motivação' },
      { id: 'influencia', name: 'Influência' },
    ],
  },
  {
    id: 'intimidacao',
    name: 'Intimidação',
    category: 'sociais',
    attribute: 'carisma',
    specializations: [
      { id: 'coercao', name: 'Coerção' },
      { id: 'presenca', name: 'Presença' },
      { id: 'ameaca', name: 'Ameaça' },
    ],
  },
  
  // Habilidades Gerais
  {
    id: 'armeiro',
    name: 'Armeiro',
    category: 'gerais',
    attribute: 'inteligencia',
    specializations: [
      { id: 'manutencao', name: 'Manutenção' },
      { id: 'fabricacao', name: 'Fabricação' },
      { id: 'modificacao', name: 'Modificação' },
    ],
  },
  {
    id: 'lidar-animais',
    name: 'Lidar com Animais',
    category: 'gerais',
    attribute: 'carisma',
    specializations: [
      { id: 'amansar', name: 'Amançar' },
      { id: 'treinamento', name: 'Treinamento' },
      { id: 'cuidado', name: 'Cuidado' },
    ],
  },
  {
    id: 'tecnologia',
    name: 'Tecnologia',
    category: 'gerais',
    attribute: 'inteligencia',
    specializations: [
      { id: 'sistemas', name: 'Sistemas' },
      { id: 'hackeamento', name: 'Hackeamento' },
      { id: 'reparo', name: 'Reparo' },
    ],
  },
  {
    id: 'veiculos',
    name: 'Veículos',
    category: 'gerais',
    attribute: 'finesse',
    specializations: [
      { id: 'conducao', name: 'Condução' },
      { id: 'navegacao', name: 'Navegação' },
      { id: 'manutencao-veiculo', name: 'Manutenção' },
    ],
  },
]

export const getSkillsByCategory = (category: Skill['category']): Skill[] => {
  return skills.filter(skill => skill.category === category)
}

export const getSkillById = (id: string): Skill | undefined => {
  return skills.find(skill => skill.id === id)
}

