'use client'

import { useRouter } from 'next/navigation'
import CharacterDashboard from '@/components/CharacterDashboard'
import type { CharacterWithMetadata } from '@/shared/types/auth'

export default function CharacterDashboardPage() {
  const router = useRouter()

  return (
    <CharacterDashboard
      onNewCharacter={() => router.push('/personagens/novo')}
      onViewCharacter={(character: CharacterWithMetadata) =>
        router.push(`/personagens/${character.id}`)
      }
      onEditCharacter={(character: CharacterWithMetadata) =>
        router.push(`/personagens/${character.id}/editar`)
      }
    />
  )
}
