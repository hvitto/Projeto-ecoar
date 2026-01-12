// Attribute Modifier Calculation
// Level 0 = Modifier 0
// Level 1 = Modifier +1
// ... up to Level 8 = Modifier +8
export function getAttributeModifier(level: number): number {
  if (level < 0) return level; // Negative levels have negative modifiers
  return level;
}

// Skill Dice Calculation
export function getSkillDice(level: number): string {
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
// Corpo (Body) = Based on Vitality modifier + base value
// Mente (Mind) = Based on Willpower modifier + base value  
// Fôlego (Breath) = Usually starts at 0, can be increased
// Mana = Usually starts at 0, can be increased
export function calculateCorpoMax(vitality: number, baseCorpo: number = 9): number {
  return baseCorpo + getAttributeModifier(vitality);
}

export function calculateMenteMax(vontade: number, baseMente: number = 9): number {
  return baseMente + getAttributeModifier(vontade);
}

// Common Tests Calculations
// Arredores (Surroundings) = Percepção + Atenção (Arredores specialization)
// Iniciativa (Initiative) = Percepção + Raciocínio (Iniciativa specialization) 
// Esquiva (Dodge) = Percepção + Reflexos (Esquiva specialization)
// Coragem (Courage) = Vontade + Compostura (Coragem specialization)
export interface CommonTestCalc {
  arredores: number;
  iniciativa: number;
  esquiva: number;
  coragem: number;
}

export function calculateCommonTests(
  percepcao: number,
  vontade: number,
  habilidadeAtencao: number = 0,
  habilidadeRaciocínio: number = 0,
  habilidadeReflexos: number = 0,
  habilidadeCompostura: number = 0,
  bonusEspecialidade: number = 0, // +1 if specialization is chosen
  sizeWeightPenalty: number = 0 // Penalty to esquiva from size and weight modifiers
): CommonTestCalc {
  return {
    arredores: getAttributeModifier(percepcao) + habilidadeAtencao + bonusEspecialidade,
    iniciativa: getAttributeModifier(percepcao) + habilidadeRaciocínio + bonusEspecialidade,
    esquiva: getAttributeModifier(percepcao) + habilidadeReflexos + bonusEspecialidade + sizeWeightPenalty,
    coragem: getAttributeModifier(vontade) + habilidadeCompostura + bonusEspecialidade,
  };
}

// Format modifier with + sign
export function formatModifier(mod: number): string {
  if (mod >= 0) return `+${mod}`;
  return `${mod}`;
}

