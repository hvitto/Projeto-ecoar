'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/shared/contexts/AuthContext'
import { getUserCharacters, deleteCharacter } from '@/lib/storage/characterStorage'
import { getUserTables } from '@/lib/storage/tablesApiService'
import { CharacterWithMetadata } from '@/shared/types/auth'
import type { GameTable } from '@/shared/types/tables'
import CharacterCard from '@/shared/components/ui/CharacterCard'
import DeleteCharacterDialog from '@/features/character/components/DeleteCharacterDialog'
import { Users, Plus, LogIn, Database, Sparkles } from 'lucide-react'
import Header from './Header'
import StampButton from '@/components/beyond/StampButton'
import RangeFrame from '@/components/beyond/RangeFrame'
import CoordLabel from '@/components/beyond/CoordLabel'

interface CharacterDashboardProps {
  onNewCharacter: () => void
  onViewCharacter: (character: CharacterWithMetadata) => void
  onEditCharacter: (character: CharacterWithMetadata) => void
}

const stampGhostClass =
  'inline-flex min-h-11 items-center justify-center gap-2 border border-ecoar-teal/50 bg-transparent px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ecoar-dark-900 transition-all hover:bg-ecoar-teal/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal dark:border-ecoar-teal dark:text-ecoar-light-900'

const stampGridClass =
  'inline-flex min-h-11 items-center justify-center gap-2 border border-ecoar-teal/60 bg-transparent px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ecoar-teal transition-all hover:bg-ecoar-teal/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal dark:border-ecoar-teal'

export default function CharacterDashboard({
  onNewCharacter,
  onViewCharacter,
  onEditCharacter,
}: CharacterDashboardProps) {
  const { user } = useAuth()
  const [characters, setCharacters] = useState<CharacterWithMetadata[]>([])
  const [tables, setTables] = useState<GameTable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tablesLoading, setTablesLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [tablesError, setTablesError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<CharacterWithMetadata | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const loadTables = useCallback(async () => {
    setTablesLoading(true)
    setTablesError(null)
    try {
      const list = await getUserTables()
      setTables(list)
    } catch {
      setTables([])
      setTablesError('Não foi possível carregar suas mesas. Verifique a conexão e tente de novo.')
    } finally {
      setTablesLoading(false)
    }
  }, [])

  const loadCharacters = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setLoadError(null)
    try {
      const userCharacters = await getUserCharacters(user.id)
      const sorted = [...userCharacters].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      setCharacters(sorted)
    } catch (error) {
      console.error('Error loading characters:', error)
      setCharacters([])
      setLoadError('Não foi possível carregar suas fichas. Verifique a conexão e tente de novo.')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      void loadTables()
    }
  }, [user, loadTables])

  useEffect(() => {
    if (user) {
      void loadCharacters()
    }
  }, [user, loadCharacters])

  useEffect(() => {
    if (!statusMessage) return
    const id = window.setTimeout(() => setStatusMessage(null), 4000)
    return () => window.clearTimeout(id)
  }, [statusMessage])

  const openDelete = (character: CharacterWithMetadata) => {
    setDeleteError(null)
    setPendingDelete(character)
  }

  const closeDelete = () => {
    if (deleteBusy) return
    setPendingDelete(null)
    setDeleteError(null)
  }

  const confirmDelete = async () => {
    if (!user || !pendingDelete || deleteBusy) return

    const deletedName = pendingDelete.name || 'Sem nome'
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      const success = await deleteCharacter(user.id, pendingDelete.id)
      if (success) {
        setPendingDelete(null)
        setStatusMessage(`Ficha “${deletedName}” apagada.`)
        await loadCharacters()
      } else {
        setDeleteError(`Não deu para apagar “${deletedName}”. Tente de novo em instantes.`)
      }
    } catch (error) {
      console.error('Error deleting character:', error)
      setDeleteError(`Falha ao apagar “${deletedName}”. Confira a conexão e tente de novo.`)
    } finally {
      setDeleteBusy(false)
    }
  }

  if (!user) {
    return (
      <div
        className="flex h-full min-h-0 items-center justify-center bg-[#1a1d21]"
        role="status"
        aria-live="polite"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ecoar-teal">
          Preparando elenco…
        </p>
      </div>
    )
  }

  const sheetCountLabel =
    isLoading ? '…' : characters.length === 1 ? '1 ficha' : `${characters.length} fichas`

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden overflow-x-hidden">
      <div className="flex-shrink-0">
        <Header onNewCharacter={onNewCharacter} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <main className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-5 sm:py-6">
          <p className="sr-only" role="status" aria-live="polite">
            {statusMessage ?? ''}
          </p>

          <header className="mb-5 sm:mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] uppercase leading-[0.88] tracking-[-0.03em] text-ecoar-dark-900 dark:text-ecoar-light-900 max-w-[14ch]">
                Minhas Fichas
              </h1>
              <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-ecoar-dark-500 dark:text-[#adb5bd]">
                {sheetCountLabel}
              </p>
            </div>
            <CoordLabel refId="DASH-ROOT" className="shrink-0" />
          </header>

          <section aria-labelledby="roster-heading" className="mb-10 sm:mb-12">
            <h2 id="roster-heading" className="sr-only">
              Elenco de fichas
            </h2>
            {isLoading ? (
              <div
                className="flex items-center justify-center border border-ecoar-teal/50 dark:border-ecoar-teal py-16 sm:py-20"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-ecoar-teal">
                  Carregando fichas…
                </p>
              </div>
            ) : loadError ? (
              <RangeFrame title="Fichas" refId="SHEETS-ERR" bodyClassName="p-8 sm:p-12">
                <div className="flex flex-col items-center text-center pr-2">
                  <h3 className="font-display text-xl uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 mb-2">
                    Falha ao carregar
                  </h3>
                  <p
                    className="text-[11px] text-ecoar-dark-500 dark:text-[#adb5bd] mb-6 max-w-sm"
                    role="alert"
                  >
                    {loadError}
                  </p>
                  <StampButton onClick={() => void loadCharacters()}>Tentar de novo</StampButton>
                </div>
              </RangeFrame>
            ) : characters.length === 0 ? (
              <RangeFrame title="Fichas" refId="SHEETS-EMPTY" bodyClassName="p-8 sm:p-12">
                <div className="flex flex-col items-center text-center pr-2">
                  <h3 className="font-display text-xl uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 mb-2">
                    Nenhuma ficha
                  </h3>
                  <p className="text-[11px] text-ecoar-dark-500 dark:text-[#adb5bd] mb-6 max-w-sm">
                    Crie a primeira ficha e entre no jogo.
                  </p>
                  <StampButton onClick={onNewCharacter}>Criar primeira ficha</StampButton>
                </div>
              </RangeFrame>
            ) : (
              <RangeFrame title="Fichas" refId="SHEETS" bodyClassName="p-3 sm:p-4">
                <ul className="grid list-none grid-cols-1 gap-3 p-0 pr-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {characters.map((character) => (
                    <li key={character.id} className="min-w-0">
                      <CharacterCard
                        character={character}
                        onView={() => onViewCharacter(character)}
                        onEdit={() => onEditCharacter(character)}
                        onDelete={() => openDelete(character)}
                        deleteDisabled={deleteBusy && pendingDelete?.id === character.id}
                      />
                    </li>
                  ))}
                </ul>
              </RangeFrame>
            )}
          </section>

          <div className="space-y-6 border-t border-ecoar-teal/30 dark:border-ecoar-teal/40 pt-8">
            <RangeFrame title="Suas mesas" refId="TABLES" bodyClassName="p-3 sm:p-4">
              <div className="mb-4 flex flex-wrap gap-2 pr-2">
                <Link href="/mesas/criar" className={stampGhostClass}>
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Criar mesa
                </Link>
                <Link href="/mesas/entrar" className={stampGhostClass}>
                  <LogIn className="h-3.5 w-3.5" aria-hidden />
                  Entrar
                </Link>
              </div>
              {tablesLoading ? (
                <p
                  className="pr-2 text-[10px] uppercase tracking-[0.14em] text-ecoar-teal"
                  role="status"
                  aria-live="polite"
                >
                  Carregando mesas…
                </p>
              ) : tablesError ? (
                <div className="pr-2">
                  <p className="mb-3 text-[11px] text-ecoar-dark-500 dark:text-[#adb5bd]" role="alert">
                    {tablesError}
                  </p>
                  <StampButton tone="ghost" onClick={() => void loadTables()} className="min-h-11 px-4 py-2">
                    Tentar de novo
                  </StampButton>
                </div>
              ) : tables.length === 0 ? (
                <p className="pr-2 text-[11px] text-ecoar-dark-500 dark:text-[#adb5bd]">
                  Ainda sem mesa. Crie uma ou peça o código ao mestre.
                </p>
              ) : (
                <ul className="grid list-none grid-cols-1 gap-2 p-0 pr-2 sm:grid-cols-2 lg:grid-cols-3">
                  {tables.map((t) => {
                    const nextSession = t.nextSessionAt
                      ? new Date(t.nextSessionAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : null
                    return (
                      <li key={t.id} className="min-w-0">
                        <Link
                          href={`/mesas/${t.id}`}
                          className="block border border-ecoar-teal/40 bg-[#0a0a0a]/30 transition-colors hover:border-ecoar-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal dark:border-ecoar-teal/50"
                          aria-label={
                            nextSession
                              ? `Abrir mesa ${t.name}, próxima sessão ${nextSession}`
                              : `Abrir mesa ${t.name}`
                          }
                        >
                          {t.coverImageUrl ? (
                            <img
                              src={t.coverImageUrl}
                              alt=""
                              className="h-24 w-full object-cover contrast-[1.05] saturate-[0.85]"
                            />
                          ) : (
                            <div
                              className="flex h-24 w-full items-center justify-center border-b border-ecoar-teal/30 bg-[#0a0a0a]"
                              aria-hidden
                            >
                              <Users className="h-7 w-7 text-ecoar-teal" />
                            </div>
                          )}
                          <div className="p-3">
                            <h3 className="truncate font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900">
                              {t.name}
                            </h3>
                            {nextSession ? (
                              <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-ecoar-teal">
                                Sessão · {nextSession}
                              </p>
                            ) : null}
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </RangeFrame>

            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-ecoar-teal">
                Consulta do livro
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/referencia/aquisicao-equipamentos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={stampGridClass}
                  aria-label="Equipamentos — abre em nova aba"
                >
                  <Database className="h-3.5 w-3.5" aria-hidden />
                  Equipamentos
                </Link>
                <Link
                  href="/referencia/singularidades"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={stampGridClass}
                  aria-label="Singularidades — abre em nova aba"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Singularidades
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {pendingDelete ? (
        <DeleteCharacterDialog
          characterName={pendingDelete.name || 'Sem nome'}
          busy={deleteBusy}
          error={deleteError}
          onCancel={closeDelete}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}
    </div>
  )
}
