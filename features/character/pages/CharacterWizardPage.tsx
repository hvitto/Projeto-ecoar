'use client'

import { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CharacterCreationWizard from '@/components/CharacterCreationWizard'
import { useAuth } from '@/contexts/AuthContext'
import { getCharacter, saveCharacter } from '@/lib/storage/characterStorage'
import { setMyTableCharacter } from '@/lib/storage/tablesApiService'
import type { CharacterCreationData } from '@/components/wizard/CharacterCreationWizard'
import type { CharacterWithMetadata } from '@/types/auth'
import { useEffect } from 'react'

interface CharacterWizardPageProps {
  characterId?: string
}

export default function CharacterWizardPage({ characterId }: CharacterWizardPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [initialData, setInitialData] = useState<Partial<CharacterCreationData> | undefined>(
    undefined,
  )
  const [loading, setLoading] = useState(!!characterId)
  const fromMesa = searchParams.get('fromMesa')

  useEffect(() => {
    if (!characterId || !user) {
      setLoading(false)
      return
    }
    getCharacter(user.id, characterId)
      .then((character) => {
        if (character) {
          setInitialData(character.data as Partial<CharacterCreationData>)
        }
      })
      .finally(() => setLoading(false))
  }, [characterId, user])

  const goToDashboard = useCallback(() => {
    if (fromMesa) {
      router.push(`/mesas/${fromMesa}`)
    } else {
      router.push('/personagens')
    }
  }, [fromMesa, router])

  const handleComplete = useCallback(
    async (data: CharacterCreationData) => {
      if (!user || !data?.nome) {
        console.error('Invalid character data or user')
        return
      }
      try {
        const payload = characterId ? { ...data, id: characterId } : data
        const saved: CharacterWithMetadata = await saveCharacter(user.id, payload)
        if (fromMesa) {
          await setMyTableCharacter(fromMesa, saved.id)
          router.push(`/mesas/${fromMesa}`)
        } else {
          router.push(`/personagens/${saved.id}`)
        }
      } catch (error) {
        console.error('Error saving character:', error)
        alert('Erro ao salvar ficha. Tente novamente.')
      }
    },
    [user, characterId, fromMesa, router],
  )

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="text-ecoar-dark-600 dark:text-ecoar-light-900/60">Carregando...</div>
      </div>
    )
  }

  return (
    <CharacterCreationWizard
      key={characterId ?? 'new'}
      onComplete={handleComplete}
      initialData={initialData}
      onGoToDashboard={goToDashboard}
    />
  )
}
