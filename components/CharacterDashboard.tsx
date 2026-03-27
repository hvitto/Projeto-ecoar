'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motionVariants'
import { getUserCharacters, deleteCharacter } from '@/lib/storage/characterStorage'
import { getUserTables } from '@/lib/storage/tablesApiService'
import { CharacterWithMetadata } from '@/types/auth'
import type { GameTable } from '@/types/tables'
import CharacterCard from '@/components/ui/CharacterCard'
import Button from '@/components/ui/Button'
import { UserPlus, FileText, LogOut, Users, Plus, LogIn, Database, Sparkles } from 'lucide-react'
import Header from './Header'

interface CharacterDashboardProps {
  onNewCharacter: () => void
  onViewCharacter: (character: CharacterWithMetadata) => void
  onEditCharacter: (character: CharacterWithMetadata) => void
}

export default function CharacterDashboard({
  onNewCharacter,
  onViewCharacter,
  onEditCharacter,
}: CharacterDashboardProps) {
  const { user, logout } = useAuth()
  const [characters, setCharacters] = useState<CharacterWithMetadata[]>([])
  const [tables, setTables] = useState<GameTable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tablesLoading, setTablesLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadTables = useCallback(async () => {
    try {
      const list = await getUserTables()
      setTables(list)
    } catch {
      setTables([])
    } finally {
      setTablesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadTables()
    }
  }, [user, loadTables])

  // Carregar fichas do usuário
  useEffect(() => {
    if (user) {
      loadCharacters()
    }
  }, [user])

  const loadCharacters = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const userCharacters = await getUserCharacters(user.id)
      const sorted = [...userCharacters].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      setCharacters(sorted)
    } catch (error) {
      console.error('Error loading characters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (characterId: string) => {
    if (!user) return
    
    if (!confirm('Tem certeza que deseja deletar esta ficha? Esta ação não pode ser desfeita.')) {
      return
    }

    setDeletingId(characterId)
    try {
      const success = await deleteCharacter(user.id, characterId)
      if (success) {
        await loadCharacters()
      }
    } catch (error) {
      console.error('Error deleting character:', error)
      alert('Erro ao deletar ficha. Tente novamente.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden overflow-x-hidden">
      <div className="flex-shrink-0">
        <Header onNewCharacter={onNewCharacter} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-1">
                Minhas Fichas
              </h1>
              <p className="text-sm text-slate-600 dark:text-ecoar-light-900/60">
                Olá, {user.username || user.email.split('@')[0]}! Gerencie seus personagens aqui.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Button
                variant="primary"
                leftIcon={UserPlus}
                onClick={onNewCharacter}
                size="lg"
                className="w-full sm:w-auto min-h-[44px]"
              >
                Nova Ficha
              </Button>
              <Button
                variant="ghost"
                leftIcon={LogOut}
                onClick={handleLogout}
                size="md"
                className="w-full sm:w-auto min-h-[44px]"
              >
                Sair
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
          <div className="rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800/70 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-ecoar-light-900/85">
                  Acesso rápido admin
                </h2>
                <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 mt-1">
                  Abra as bases para consulta e gestão de catálogo.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/referencia/aquisicao-equipamentos" target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" leftIcon={Database} size="md">
                    Base de Equipamentos
                  </Button>
                </Link>
                <Link href="/referencia/singularidades" target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" leftIcon={Sparkles} size="md">
                    Base de Singularidades
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Suas mesas */}
        <motion.section variants={fadeInUp} initial="hidden" animate="visible" className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-ecoar-light-900/90">
              Suas mesas
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/mesas/criar">
                <Button variant="secondary" leftIcon={Plus} size="md">
                  Criar mesa
                </Button>
              </Link>
              <Link href="/mesas/entrar">
                <Button variant="ghost" leftIcon={LogIn} size="md">
                  Entrar em uma mesa
                </Button>
              </Link>
            </div>
          </div>
          {tablesLoading ? (
            <p className="text-sm text-slate-500">Carregando mesas...</p>
          ) : tables.length === 0 ? (
            <p className="text-sm text-slate-500">
              Você não está em nenhuma mesa. Crie uma ou peça o link/código ao GM.
            </p>
          ) : (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={staggerContainer} initial="hidden" animate="visible">
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
                  <Link key={t.id} href={`/mesas/${t.id}`}>
                    <motion.div
                      variants={staggerItem}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800 hover:border-ecoar-teal-300 dark:hover:border-ecoar-teal/40 hover:shadow-md dark:hover:shadow-ecoar-teal-600/10 transition-all duration-normal cursor-pointer"
                    >
                      {t.coverImageUrl ? (
                        <img
                          src={t.coverImageUrl}
                          alt=""
                          className="w-full h-24 object-cover rounded-md mb-2"
                        />
                      ) : (
                        <div className="w-full h-24 rounded-md bg-slate-100 dark:bg-ecoar-dark-700 flex items-center justify-center mb-2">
                          <Users className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      <h3 className="font-medium text-slate-900 dark:text-ecoar-light-900/90 truncate">
                        {t.name}
                      </h3>
                      {nextSession && (
                        <p className="text-xs text-ecoar-teal-600 dark:text-ecoar-teal-400 mt-0.5">
                          Próxima sessão: {nextSession}
                        </p>
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </motion.div>
          )}
        </motion.section>

        {/* Characters Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-600 dark:text-ecoar-light-900/60">Carregando fichas...</div>
          </div>
        ) : characters.length === 0 ? (
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-slate-50 dark:bg-ecoar-light-900/[0.03] rounded-full flex items-center justify-center border border-slate-200 dark:border-ecoar-light-900/[0.08] mb-6">
              <FileText className="w-12 h-12 text-slate-400 dark:text-ecoar-light-900/40" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-2">
              Nenhuma ficha encontrada
            </h2>
            <p className="text-sm text-slate-600 dark:text-ecoar-light-900/60 mb-6 text-center max-w-md">
              Você ainda não criou nenhum personagem. Comece criando sua primeira ficha!
            </p>
            <Button
              variant="primary"
              leftIcon={UserPlus}
              onClick={onNewCharacter}
              size="lg"
            >
              Criar Primeira Ficha
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {characters.map((character) => (
              <motion.div key={character.id} variants={staggerItem}>
                <CharacterCard
                  character={character}
                  onView={() => onViewCharacter(character)}
                  onEdit={() => onEditCharacter(character)}
                  onDelete={deletingId === character.id ? undefined : () => handleDelete(character.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
        </div>
      </div>
    </div>
  )
}

