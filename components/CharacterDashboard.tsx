'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { getUserCharacters, deleteCharacter } from '@/lib/storage/characterStorage'
import { CharacterWithMetadata } from '@/types/auth'
import CharacterCard from '@/components/ui/CharacterCard'
import Button from '@/components/ui/Button'
import { UserPlus, FileText, LogOut } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
    <div className="min-h-screen bg-ecoar-light dark:bg-ecoar-dark-900">
      <Header onNewCharacter={onNewCharacter} />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-ecoar-light-900/90 mb-1">
                Minhas Fichas
              </h1>
              <p className="text-sm text-slate-600 dark:text-ecoar-light-900/60">
                Olá, {user.username || user.email.split('@')[0]}! Gerencie seus personagens aqui.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                leftIcon={UserPlus}
                onClick={onNewCharacter}
                size="lg"
              >
                Nova Ficha
              </Button>
              <Button
                variant="ghost"
                leftIcon={LogOut}
                onClick={handleLogout}
                size="md"
              >
                Sair
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Characters Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-600 dark:text-ecoar-light-900/60">Carregando fichas...</div>
          </div>
        ) : characters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {characters.map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
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
  )
}

