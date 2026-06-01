'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CharacterSheet from '@/components/CharacterSheet'
import { useAuth } from '@/contexts/AuthContext'
import { getCharacter } from '@/lib/storage/characterStorage'
import { getTable, getTableCharacters } from '@/lib/storage/tablesApiService'
import type { CharacterWithMetadata } from '@/types/auth'

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
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="text-ecoar-dark-600 dark:text-ecoar-light-900/60">Carregando ficha...</div>
      </div>
    )
  }

  return (
    <CharacterSheet
      initialData={character.data}
      canEdit={canEdit}
      isTableGmEditor={isTableGmEditor}
      onOpenEvolution={() => {
        const qs = fromMesa ? `?fromMesa=${encodeURIComponent(fromMesa)}` : ''
        router.push(`/personagens/${characterId}/evolucao${qs}`)
      }}
      onCharacterSaved={(saved) => setCharacter(saved)}
      onBackToDashboard={goBack}
    />
  )
}
