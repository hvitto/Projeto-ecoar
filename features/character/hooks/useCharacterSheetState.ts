'use client'

import { useState } from 'react'
import {
  createInitialCharacterSheetState,
  type CharacterSheetState,
} from '@/features/character/hooks/sheetInitialState'

/** Estado local da ficha; normalização de `initialData` permanece em CharacterSheet até migração completa. */
export function useCharacterSheetState() {
  const [characterData, setCharacterData] = useState<CharacterSheetState>(createInitialCharacterSheetState)
  return { characterData, setCharacterData }
}
