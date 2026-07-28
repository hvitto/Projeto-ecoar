'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CharacterSheet from '@/components/CharacterSheet'
import { useAuth } from '@/shared/contexts/AuthContext'
import { getCharacter } from '@/lib/storage/characterStorage'
import { getTable, getTableCharacters } from '@/lib/storage/tablesApiService'
import type { CharacterWithMetadata } from '@/shared/types/auth'

interface CharacterSheetPageProps {
  characterId: string
}

export default function CharacterSheetPage({ characterId }: CharacterSheetPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [character, setCharacter] = useState<CharacterWithMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [canEdit, setCanEdit] = useState(true)
  const [isTableGmEditor, setIsTableGmEditor] = useState(false)
  const fromMesa = searchParams.get('fromMesa')

  useEffect(() => {
    if (!fromMesa || !user) {
      setCanEdit(true)
      setIsTableGmEditor(false)
      return
    }
    Promise.all([getTable(fromMesa), getTableCharacters(fromMesa)])
      .then(([table, list]) => {
        const isGm = table?.myRole === 'gm'
        setIsTableGmEditor(isGm)
        const item = list.find((i) => i.character.id === characterId)
        setCanEdit(isGm || (item?.canEdit ?? false))
      })
      .catch(() => {
        setCanEdit(true)
        setIsTableGmEditor(false)
      })
  }, [fromMesa, user, characterId])

  useEffect(() => {
    if (!user) return
    getCharacter(user.id, characterId)
      .then((loaded) => {
        if (!loaded) {
          router.replace('/personagens')
          return
        }
        setCharacter(loaded)
      })
      .catch(() => router.replace('/personagens'))
      .finally(() => setLoading(false))
  }, [user, characterId, router])

  const goBack = useCallback(() => {
    if (fromMesa) {
      router.push(`/mesas/${fromMesa}`)
    } else {
      router.push('/personagens')
    }
  }, [fromMesa, router])

  if (loading || !character) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[#0a0a0a]">
        <div
          role="status"
          aria-live="polite"
          className="border border-ecoar-teal/40 bg-[#1a1d21] px-6 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ecoar-teal"
        >
          Abrindo ficha…
        </div>
      </div>
    )
  }

  return (
    <CharacterSheet
      initialData={character.data}
      canEdit={canEdit}
      isTableGmEditor={isTableGmEditor}
      tableId={fromMesa}
      onOpenEvolution={() => {
        const qs = fromMesa ? `?fromMesa=${encodeURIComponent(fromMesa)}` : ''
        router.push(`/personagens/${characterId}/evolucao${qs}`)
      }}
      onCharacterSaved={(saved) => setCharacter(saved)}
      onBackToDashboard={goBack}
    />
  )
}
