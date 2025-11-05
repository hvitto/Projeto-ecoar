// Tabela de Progressão de Nível de Alma
export interface SoulLevel {
  nivel: number
  pontosEvolucao: number
  nivelPoder: number
  estagio: string
}

export const soulLevels: SoulLevel[] = [
  // Personagem Mundano (Nível de Poder 3)
  { nivel: 1, pontosEvolucao: 0, nivelPoder: 3, estagio: 'Personagem Mundano' },
  { nivel: 2, pontosEvolucao: 10, nivelPoder: 3, estagio: 'Personagem Mundano' },
  { nivel: 3, pontosEvolucao: 25, nivelPoder: 3, estagio: 'Personagem Mundano' },
  { nivel: 4, pontosEvolucao: 45, nivelPoder: 3, estagio: 'Personagem Mundano' },
  
  // Personagem Treinado (Nível de Poder 4)
  { nivel: 5, pontosEvolucao: 70, nivelPoder: 4, estagio: 'Personagem Treinado' },
  { nivel: 6, pontosEvolucao: 105, nivelPoder: 4, estagio: 'Personagem Treinado' },
  { nivel: 7, pontosEvolucao: 145, nivelPoder: 4, estagio: 'Personagem Treinado' },
  { nivel: 8, pontosEvolucao: 185, nivelPoder: 4, estagio: 'Personagem Treinado' },
  
  // Personagem Grandioso (Nível de Poder 5)
  { nivel: 9, pontosEvolucao: 225, nivelPoder: 5, estagio: 'Personagem Grandioso' },
  { nivel: 10, pontosEvolucao: 265, nivelPoder: 5, estagio: 'Personagem Grandioso' },
  { nivel: 11, pontosEvolucao: 305, nivelPoder: 5, estagio: 'Personagem Grandioso' },
  { nivel: 12, pontosEvolucao: 345, nivelPoder: 5, estagio: 'Personagem Grandioso' },
  
  // Personagem Temido (Nível de Poder 6)
  { nivel: 13, pontosEvolucao: 400, nivelPoder: 6, estagio: 'Personagem Temido' },
  { nivel: 14, pontosEvolucao: 455, nivelPoder: 6, estagio: 'Personagem Temido' },
  { nivel: 15, pontosEvolucao: 515, nivelPoder: 6, estagio: 'Personagem Temido' },
  { nivel: 16, pontosEvolucao: 580, nivelPoder: 6, estagio: 'Personagem Temido' },
  
  // Personagem Lendário (Nível de Poder 7)
  { nivel: 17, pontosEvolucao: 650, nivelPoder: 7, estagio: 'Personagem Lendário' },
  { nivel: 18, pontosEvolucao: 730, nivelPoder: 7, estagio: 'Personagem Lendário' },
  { nivel: 19, pontosEvolucao: 810, nivelPoder: 7, estagio: 'Personagem Lendário' },
  { nivel: 20, pontosEvolucao: 890, nivelPoder: 7, estagio: 'Personagem Lendário' },
  
  // Personagem Monstruoso (Nível de Poder 8)
  { nivel: 21, pontosEvolucao: 970, nivelPoder: 8, estagio: 'Personagem Monstruoso' },
  { nivel: 22, pontosEvolucao: 1050, nivelPoder: 8, estagio: 'Personagem Monstruoso' },
  { nivel: 23, pontosEvolucao: 1130, nivelPoder: 8, estagio: 'Personagem Monstruoso' },
  { nivel: 24, pontosEvolucao: 1250, nivelPoder: 8, estagio: 'Personagem Monstruoso' },
]

export function getSoulLevelByNivel(nivel: number): SoulLevel | undefined {
  return soulLevels.find(sl => sl.nivel === nivel)
}

export function getSoulLevelsByEstagio(estagio: string): SoulLevel[] {
  return soulLevels.filter(sl => sl.estagio === estagio)
}

export function getEstagios(): string[] {
  return Array.from(new Set(soulLevels.map(sl => sl.estagio)))
}

