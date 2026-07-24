// Attribute Modifier Calculation
// Level 0 = Modifier 0
// Level 1 = Modifier +1
// ... up to Level 8 = Modifier +8
export function getAttributeModifier(level: number): number {
  if (level < 0) return level; // Negative levels have negative modifiers
  return level;
}

export function getSkillDice(level: number): string {
  const diceTable: Record<number, string> = {
    0: '1d4',
    1: '1d6',
    2: '1d8',
    3: '1d10',
    4: '1d12',
    5: '1d12+1d4',
    6: '1d20+1',
    7: '1d20+1d6',
    8: '1d20+1d8',
  };
  return diceTable[level] || '1d4';
}

// Aptitude Dice and Modifier Calculation
export function getAptitudeDice(level: number): string {
  const diceTable: Record<number, string> = {
    0: '1d4-1',
    1: '1d4',
    2: '1d6',
    3: '1d8',
    4: '1d10',
    5: '1d12',
    6: '1d12+1d4',
    7: '1d20+1',
    8: '1d20+1d6',
  };
  return diceTable[level] || '1d4-1';
}

export function getAptitudeModifier(level: number): number {
  return level;
}

// Limits Calculation
// Corpo = (Vitalidade + Nível de Poder) x 3
// Mente = (Vontade + Nível de Poder) x 3
// Fôlego = Corpo x 2
// Mana = Mente x 2
export function calculateCorpoMax(vitalidade: number, nivelPoder: number): number {
  return (vitalidade + nivelPoder) * 3;
}

export function calculateMenteMax(vontade: number, nivelPoder: number): number {
  return (vontade + nivelPoder) * 3;
}

export function calculateFolegoMax(corpoMax: number): number {
  return corpoMax * 2;
}

export function calculateManaMax(menteMax: number): number {
  return menteMax * 2;
}

export function calculateEspiritoMax(nivelPoder: number): number {
  return Math.max(0, nivelPoder) * 15
}

export type CharacterLimitsInput = {
  vitalidade: number
  vontade: number
  nivelPoder: number
  corpoBonus?: number
  menteBonus?: number
  folegoBonus?: number
  manaBonus?: number
}

export type CharacterLimits = {
  corpoMax: number
  menteMax: number
  folegoMax: number
  manaMax: number
}

export function calculateCharacterLimits(input: CharacterLimitsInput): CharacterLimits {
  const corpoBonus = input.corpoBonus ?? 0
  const menteBonus = input.menteBonus ?? 0
  const folegoBonus = input.folegoBonus ?? 0
  const manaBonus = input.manaBonus ?? 0
  const corpoMax = calculateCorpoMax(input.vitalidade, input.nivelPoder) + corpoBonus
  const menteMax = calculateMenteMax(input.vontade, input.nivelPoder) + menteBonus
  return {
    corpoMax,
    menteMax,
    folegoMax: calculateFolegoMax(corpoMax) + folegoBonus,
    manaMax: calculateManaMax(menteMax) + manaBonus,
  }
}

export function toLimitShape(max: number, atual?: number): { atual: number; max: number } {
  const safeMax = Number.isFinite(max) ? max : 0
  const safeAtual = atual !== undefined && Number.isFinite(atual) ? atual : safeMax
  return { atual: safeAtual, max: safeMax }
}

export interface CommonTestCalc {
  arredores: number
  iniciativa: number
  esquiva: number
  coragem: number
}

export type CommonTestSpecializationBonuses = {
  arredores?: number
  iniciativa?: number
  esquiva?: number
  coragem?: number
}

export function getCommonTestSpecializationBonus(
  skillSpecialization: string | undefined,
  expectedSpecializationId: string,
): number {
  return skillSpecialization === expectedSpecializationId ? 1 : 0
}

export function calculateCommonTests(
  percepcao: number,
  vontade: number,
  habilidadeAtencao: number = 0,
  habilidadeRaciocinio: number = 0,
  habilidadeReflexos: number = 0,
  habilidadeCompostura: number = 0,
  specializationBonuses: CommonTestSpecializationBonuses | number = 0,
  sizeWeightPenalty: number = 0,
): CommonTestCalc {
  const specs: CommonTestSpecializationBonuses =
    typeof specializationBonuses === 'number'
      ? {
          arredores: specializationBonuses,
          iniciativa: specializationBonuses,
          esquiva: specializationBonuses,
          coragem: specializationBonuses,
        }
      : specializationBonuses

  return {
    arredores: getAttributeModifier(percepcao) + habilidadeAtencao + (specs.arredores ?? 0),
    iniciativa: getAttributeModifier(percepcao) + habilidadeRaciocinio + (specs.iniciativa ?? 0),
    esquiva:
      getAttributeModifier(percepcao) + habilidadeReflexos + (specs.esquiva ?? 0) + sizeWeightPenalty,
    coragem: getAttributeModifier(vontade) + habilidadeCompostura + (specs.coragem ?? 0),
  }
}

export function formatModifier(mod: number): string {
  if (mod >= 0) return `+${mod}`;
  return `${mod}`;
}

export function formatDiceWithModifier(dice: string, mod: number): string {
  if (mod === 0) return dice
  return `${dice} ${mod >= 0 ? '+' : '-'} ${Math.abs(mod)}`
}

