'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CharacterEvolutionScreen from '@/components/CharacterEvolutionScreen'
import { useAuth } from '@/shared/contexts/AuthContext'
import { getCharacter } from '@/lib/storage/characterStorage'
import type { CharacterWithMetadata } from '@/shared/types/auth'

interface CharacterEvolutionPageProps {
  characterId: string
}

export default function CharacterEvolutionPage({ characterId }: CharacterEvolutionPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [character, setCharacter] = useState<CharacterWithMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const fromMesa = searchParams.get('fromMesa')

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

  if (loading || !character) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="text-ecoar-dark-600 dark:text-ecoar-light-900/60">Carregando...</div>
      </div>
    )
  }

  const sheetUrl = fromMesa
    ? `/personagens/${characterId}?fromMesa=${encodeURIComponent(fromMesa)}`
    : `/personagens/${characterId}`

  return (
    <CharacterEvolutionScreen
      initialCharacterData={character.data}
      onCancel={() => router.push(sheetUrl)}
      onSaved={(saved) => {
        setCharacter(saved)
        router.push(sheetUrl)
      }}
    />
  )
}
