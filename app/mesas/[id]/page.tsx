'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { fadeInUp } from '@/lib/motionVariants'
import {
  getTable,
  getTableCharacters,
  setMyTableCharacter,
  type TableCharacterItem,
} from '@/lib/storage/tablesApiService'
import { getCharacter, getUserCharacters } from '@/lib/storage/characterStorage'
import { saveCharacter } from '@/lib/storage/characterStorage'
import type { GameTableWithMembers } from '@/types/tables'
import type { CharacterWithMetadata } from '@/types/auth'
import { ArrowLeft, Copy, UserPlus, FileText, Eye, Pencil } from 'lucide-react'
import Button from '@/components/ui/Button'
import CharacterSheet from '@/components/CharacterSheet'
import CharacterCreationWizard from '@/components/CharacterCreationWizard'
import CharacterEvolutionScreen from '@/components/CharacterEvolutionScreen'

const POLL_INTERVAL_MS = 8000

export default function MesaPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const tableId = params.id as string

  const [table, setTable] = useState<GameTableWithMembers | null>(null)
  const [tableCharacters, setTableCharacters] = useState<TableCharacterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'sheet' | 'wizard' | 'pickCharacter' | 'evolution'>('list')
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterWithMetadata | null>(null)
  const [myCharacters, setMyCharacters] = useState<CharacterWithMetadata[]>([])
  const [copySuccess, setCopySuccess] = useState(false)
  const requestedView = searchParams.get('view')
  const requestedCharacterId = searchParams.get('characterId')

  const isValidViewMode = (value: string | null): value is 'list' | 'sheet' | 'wizard' | 'pickCharacter' | 'evolution' => {
    return value === 'list' || value === 'sheet' || value === 'wizard' || value === 'pickCharacter' || value === 'evolution'
  }

  const updateRouteState = (nextView: 'list' | 'sheet' | 'wizard' | 'pickCharacter' | 'evolution', nextCharacterId?: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', nextView)
    if (nextCharacterId) {
      params.set('characterId', nextCharacterId)
    } else {
      params.delete('characterId')
    }
    router.replace(`/mesas/${tableId}?${params.toString()}`)
  }

  const loadTable = useCallback(async () => {
    if (!tableId) return
    try {
      const t = await getTable(tableId)
      setTable(t)
    } catch {
      setError('Mesa não encontrada')
    }
  }, [tableId])

  const loadCharacters = useCallback(async () => {
    if (!tableId) return
    try {
      const list = await getTableCharacters(tableId)
      setTableCharacters(list)
    } catch {
      // keep previous
    }
  }, [tableId])

  const load = useCallback(() => {
    return loadTable().then(() => loadCharacters())
  }, [loadTable, loadCharacters])

  useEffect(() => {
    if (!tableId) return
    setLoading(true)
    setError(null)
    load().finally(() => setLoading(false))
  }, [tableId, load])

  useEffect(() => {
    if (!isValidViewMode(requestedView)) {
      setViewMode('list')
      updateRouteState('list')
      return
    }
    setViewMode(requestedView)
  }, [requestedView])

  useEffect(() => {
    if (!tableId || !table || viewMode !== 'list') return
    const interval = setInterval(loadCharacters, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [tableId, table, viewMode, loadCharacters])

  const inviteLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/mesas/entrar?token=${table?.inviteToken ?? ''}`
      : ''
  const copyInviteLink = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  const isPlayerWithoutCharacter =
    table?.myRole === 'player' && (table?.myCharacterId == null || table?.myCharacterId === '')

  useEffect(() => {
    if (viewMode === 'pickCharacter' && user) {
      getUserCharacters(user.id).then(setMyCharacters)
    }
  }, [viewMode, user])

  const handleCreateNewCharacter = () => {
    setSelectedCharacter(null)
    setViewMode('wizard')
    updateRouteState('wizard')
  }
  const handleUseExistingCharacter = () => {
    setSelectedCharacter(null)
    setViewMode('pickCharacter')
    updateRouteState('pickCharacter')
  }

  const handleWizardComplete = async (
    data: Parameters<Parameters<typeof CharacterCreationWizard>[0]['onComplete']>[0]
  ) => {
    if (!user || !tableId) return
    try {
      const created = await saveCharacter(user.id, data as CharacterWithMetadata['data'])
      await setMyTableCharacter(tableId, created.id)
      setSelectedCharacter(null)
      setViewMode('list')
      updateRouteState('list')
      load()
    } catch (err) {
      console.error(err)
      alert('Erro ao criar ficha. Tente novamente.')
    }
  }

  const handlePickCharacter = async (character: CharacterWithMetadata) => {
    if (!tableId) return
    try {
      await setMyTableCharacter(tableId, character.id)
      setViewMode('list')
      updateRouteState('list')
      load()
    } catch (err) {
      console.error(err)
      alert('Erro ao vincular ficha. Tente novamente.')
    }
  }

  const handleViewCharacter = (item: TableCharacterItem) => {
    setSelectedCharacter(item.character)
    setViewMode('sheet')
    updateRouteState('sheet', item.character.id)
  }

  const handleEditCharacter = (item: TableCharacterItem) => {
    if (!item.canEdit) return
    setSelectedCharacter(item.character)
    setViewMode('wizard')
    updateRouteState('wizard', item.character.id)
  }

  const handleBackFromSheet = () => {
    setSelectedCharacter(null)
    setViewMode('list')
    updateRouteState('list')
    loadCharacters()
  }

  const handleBackFromWizard = () => {
    setSelectedCharacter(null)
    setViewMode('list')
    updateRouteState('list')
  }

  useEffect(() => {
    if (!requestedCharacterId || !user) return
    const fromTableList = tableCharacters.find((item) => item.character.id === requestedCharacterId)?.character
    if (fromTableList) {
      setSelectedCharacter(fromTableList)
      return
    }
    getCharacter(user.id, requestedCharacterId)
      .then((character) => {
        if (!character) {
          setSelectedCharacter(null)
          updateRouteState('list')
          return
        }
        setSelectedCharacter(character)
      })
      .catch(() => {
        setSelectedCharacter(null)
        updateRouteState('list')
      })
  }, [requestedCharacterId, tableCharacters, user])

  if (loading && !table) {
    return (
      <div className="h-full min-h-0 flex flex-col">
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="text-slate-600 dark:text-ecoar-light-900/60">Carregando mesa...</div>
        </div>
      </div>
    )
  }

  if (error || !table) {
    return (
      <div className="h-full min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <p className="text-red-400 mb-4">{error ?? 'Mesa não encontrada'}</p>
        <Link href="/" className="text-ecoar-teal-600 dark:text-ecoar-teal-400 hover:underline transition-colors duration-fast">
          Voltar ao início
        </Link>
        </div>
      </div>
    )
  }

  if (viewMode === 'wizard') {
    return (
      <div className="h-full min-h-0 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2 bg-ecoar-light/95 dark:bg-ecoar-dark-900/95 border-b border-slate-200 dark:border-ecoar-light-900/20">
          <button
            type="button"
            onClick={handleBackFromWizard}
            className="inline-flex items-center gap-2 text-sm text-ecoar-teal-600 dark:text-ecoar-teal-400 hover:underline transition-colors duration-fast"
          >
            <ArrowLeft className="w-4 h-4" /> Cancelar e voltar à mesa
          </button>
        </div>
        <CharacterCreationWizard
          initialData={selectedCharacter?.data as Parameters<typeof CharacterCreationWizard>[0]['initialData']}
          onComplete={handleWizardComplete}
        />
      </div>
    )
  }

  if (viewMode === 'sheet' && selectedCharacter) {
    const canEdit = tableCharacters.find((i) => i.character.id === selectedCharacter.id)?.canEdit ?? false
    const isTableGmEditor = table.myRole === 'gm'
    return (
      <div className="h-full min-h-0 flex flex-col overflow-hidden">
        <CharacterSheet
          initialData={selectedCharacter.data}
          canEdit={canEdit}
          isTableGmEditor={isTableGmEditor}
          onOpenEvolution={() => {
            setViewMode('evolution')
            updateRouteState('evolution', selectedCharacter.id)
          }}
          onCharacterSaved={(saved) => {
            setSelectedCharacter(saved)
            setTableCharacters((prev) =>
              prev.map((item) =>
                item.character.id === saved.id
                  ? { ...item, character: saved }
                  : item
              )
            )
          }}
          onBackToDashboard={handleBackFromSheet}
        />
      </div>
    )
  }

  if (viewMode === 'evolution' && selectedCharacter) {
    const isTableGmEditor = table.myRole === 'gm'
    return (
      <div className="h-full min-h-0 flex flex-col overflow-hidden">
        <CharacterEvolutionScreen
          initialCharacterData={selectedCharacter.data}
          isTableGmEditor={isTableGmEditor}
          onCancel={() => {
            setViewMode('sheet')
            updateRouteState('sheet', selectedCharacter.id)
          }}
          onSaved={(saved) => {
            setSelectedCharacter(saved)
            setViewMode('sheet')
            updateRouteState('sheet', saved.id)
            load()
          }}
        />
      </div>
    )
  }

  if (viewMode === 'pickCharacter') {
    return (
      <div className="h-full min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <motion.div className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6" variants={fadeInUp} initial="hidden" animate="visible">
          <button
            onClick={() => {
              setViewMode('list')
              updateRouteState('list')
            }}
            className="inline-flex items-center gap-2 text-sm text-ecoar-teal-600 dark:text-ecoar-teal-400 hover:underline mb-6 transition-colors duration-fast"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-2">Usar ficha existente</h2>
          <p className="text-sm text-slate-600 dark:text-ecoar-light-900/60 mb-4">
            Escolha uma das suas fichas para usar nesta mesa.
          </p>
          <ul className="space-y-2">
            {myCharacters.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800 transition-all duration-normal hover:shadow-md"
              >
                <span className="font-medium text-slate-900 dark:text-ecoar-light-900">{c.name}</span>
                <Button size="sm" onClick={() => handlePickCharacter(c)}>
                  Usar esta ficha
                </Button>
              </li>
            ))}
          </ul>
          {myCharacters.length === 0 && (
            <p className="text-sm text-slate-500">Você não tem fichas. Crie uma nova na mesa.</p>
          )}
        </motion.div>
        </div>
      </div>
    )
  }

  const nextSession = table.nextSessionAt
    ? new Date(table.nextSessionAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
      <motion.div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6" variants={fadeInUp} initial="hidden" animate="visible">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-ecoar-teal-600 dark:text-ecoar-teal-400 hover:underline mb-6 transition-colors duration-fast"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
          {table.coverImageUrl ? (
            <img
              src={table.coverImageUrl}
              alt=""
              className="w-full md:w-48 h-32 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full md:w-48 h-32 rounded-lg bg-slate-200 dark:bg-ecoar-dark-800 flex items-center justify-center">
              <FileText className="w-12 h-12 text-slate-400" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-ecoar-light-900/90 mb-1">
              {table.name}
            </h1>
            {table.description && (
              <p className="text-sm text-slate-600 dark:text-ecoar-light-900/60 mb-2">
                {table.description}
              </p>
            )}
            {nextSession && (
              <p className="text-sm text-ecoar-teal-600 dark:text-ecoar-teal-400">
                Próxima sessão: {nextSession}
              </p>
            )}
            {table.myRole === 'gm' && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Link de convite:</span>
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="inline-flex items-center gap-1 text-xs text-ecoar-teal-600 dark:text-ecoar-teal-400 hover:underline"
                >
                  <Copy className="w-3 h-3" />
                  {copySuccess ? 'Copiado!' : 'Copiar link'}
                </button>
                {table.inviteCode && (
                  <span className="text-xs text-slate-500">
                    Código: <strong>{table.inviteCode}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {isPlayerWithoutCharacter && (
          <div className="mb-6 p-4 rounded-lg border border-ecoar-teal-300/50 dark:border-ecoar-teal/30 bg-ecoar-teal-50/50 dark:bg-ecoar-teal/5">
            <p className="text-sm text-slate-700 dark:text-ecoar-light-900/80 mb-3">
              Você ainda não vinculou uma ficha a esta mesa.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button leftIcon={UserPlus} onClick={handleCreateNewCharacter} size="md">
                Criar nova ficha
              </Button>
              <Button variant="secondary" leftIcon={FileText} onClick={handleUseExistingCharacter} size="md">
                Usar ficha existente
              </Button>
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-3">
          Fichas na mesa
        </h2>
        {tableCharacters.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma ficha na mesa ainda.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tableCharacters.map((item) => (
              <li
                key={item.character.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900 dark:text-ecoar-light-900">
                    {item.character.name}
                  </span>
                  {item.memberUsername && (
                    <span className="text-xs text-slate-500">@{item.memberUsername}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={Eye}
                    onClick={() => handleViewCharacter(item)}
                  >
                    Ver
                  </Button>
                  {item.canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={Pencil}
                      onClick={() => handleEditCharacter(item)}
                    >
                      Editar
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
      </div>
    </div>
  )
}
