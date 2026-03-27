'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getCharacter } from '@/lib/storage/characterStorage'
import type { CharacterData, CharacterWithMetadata } from '@/types/auth'
import PlayerSingularitiesViewer from '@/components/singularities/PlayerSingularitiesViewer'
import type { CharacterSingularitySelectionSlice } from '@/lib/characterBonuses'
import { useSystemSingularityBonuses } from '@/lib/useSystemSingularityBonuses'

function PlayerSingularitiesSection({ characterData }: { characterData: CharacterData }) {
  const selectionSlice = useMemo((): CharacterSingularitySelectionSlice => {
    return {
      singularidades: (characterData.singularidades as string[] | undefined) ?? [],
      singularidadesEcoar: (characterData.singularidadesEcoar as string[] | undefined) ?? [],
      singularidadesMarciais: (characterData.singularidadesMarciais as string[] | undefined) ?? [],
      singularidadesRaciais: (characterData.singularidadesRaciais as string[] | undefined) ?? [],
      singularidadesCondicionaisCriacaoAtivas:
        (characterData.singularidadesCondicionaisCriacaoAtivas as string[] | undefined) ?? [],
      singularidadesCondicionaisAtivas:
        (characterData.singularidadesCondicionaisAtivas as string[] | undefined) ?? [],
      singularidadesCondicionaisMarciaisAtivas:
        (characterData.singularidadesCondicionaisMarciaisAtivas as string[] | undefined) ?? [],
      singularidadesCondicionaisRaciaisAtivas:
        (characterData.singularidadesCondicionaisRaciaisAtivas as string[] | undefined) ?? [],
    }
  }, [
    characterData.singularidades,
    characterData.singularidadesEcoar,
    characterData.singularidadesMarciais,
    characterData.singularidadesRaciais,
    characterData.singularidadesCondicionaisCriacaoAtivas,
    characterData.singularidadesCondicionaisAtivas,
    characterData.singularidadesCondicionaisMarciaisAtivas,
    characterData.singularidadesCondicionaisRaciaisAtivas,
  ])

  const singularityBonuses = useSystemSingularityBonuses(selectionSlice)

  return <PlayerSingularitiesViewer characterData={characterData} singularityBonuses={singularityBonuses} />
}

export default function PlayerSingularitiesPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const characterId = params.id as string

  const [character, setCharacter] = useState<CharacterWithMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const title = useMemo(() => {
    const base = character?.name || character?.data?.nome || 'Personagem'
    return `Singularidades • ${base}`
  }, [character?.data?.nome, character?.name])

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !user) {
      setLoading(false)
      setError('Você precisa estar logado para ver esta página.')
      return
    }
    if (!characterId) {
      setLoading(false)
      setError('ID do personagem inválido.')
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    getCharacter(user.id, characterId)
      .then((res) => {
        if (cancelled) return
        if (!res) {
          setCharacter(null)
          setError('Personagem não encontrado.')
          return
        }
        setCharacter(res)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Erro ao carregar personagem.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [characterId, isAuthenticated, isLoading, user])

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50/80 dark:bg-ecoar-dark-900/50">
      <header className="shrink-0 border-b border-slate-200 dark:border-ecoar-light-900/10 bg-white/90 dark:bg-ecoar-dark-800/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-ecoar-light-900/65"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-ecoar-light-900/15 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-5 h-5 text-ecoar-teal-600 dark:text-ecoar-teal-400 shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 truncate">
                  {title}
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-ecoar-light-900/50">
                  Visualização dedicada das singularidades do jogador
                </p>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <Link
              href="/"
              className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 text-slate-600 dark:text-ecoar-light-900/70 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/10"
            >
              Ir para início
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 pb-24">
          {loading && <p className="text-sm text-slate-600 dark:text-ecoar-light-900/60">Carregando...</p>}
          {!loading && error && (
            <p className="text-sm text-ecoar-magenta dark:text-ecoar-magenta/90">{error}</p>
          )}
          {!loading && !error && character && (
            <div className="rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800/50 p-4">
              <PlayerSingularitiesSection characterData={character.data} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

