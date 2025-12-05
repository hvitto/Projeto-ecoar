'use client'

import { motion } from 'framer-motion'
import { User, Calendar, Edit, Trash2, Eye } from 'lucide-react'
import Card from './Card'
import Button from './Button'
import { CharacterWithMetadata } from '@/types/auth'
import { getRaceById } from '@/data/races'

interface CharacterCardProps {
  character: CharacterWithMetadata
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function CharacterCard({ character, onView, onEdit, onDelete }: CharacterCardProps) {
  const characterData = character.data
  const race = characterData?.raca ? getRaceById(characterData.raca) : null
  
  // Calcular nível total aproximado (nível de alma ou poder)
  const level = characterData?.nivelAlma || characterData?.nivelPoder || 1
  
  // Obter atributo principal ou valor médio
  const getMainAttribute = () => {
    if (characterData?.attributes) {
      const attrs = characterData.attributes
      const values = [
        attrs.carisma || 0,
        attrs.finesse || 0,
        attrs.forca || 0,
        attrs.inteligencia || 0,
        attrs.percepcao || 0,
        attrs.vitalidade || 0,
        attrs.vontade || 0,
      ]
      const sum = values.reduce((a, b) => a + b, 0)
      return sum > 0 ? Math.round(sum / values.length) : 0
    }
    return 0
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date)
    } catch {
      return dateString
    }
  }

  return (
    <Card
      variant="default"
      className="p-4 hover:border-slate-300 dark:hover:border-ecoar-teal-500/30 transition-all duration-200"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 truncate mb-1">
              {character.name || 'Personagem sem nome'}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-ecoar-light-900/60">
              {race && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {race.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(character.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Info Preview */}
        <div className="flex-1 mb-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-ecoar-light-900/[0.03] rounded px-2 py-1.5 border border-slate-200 dark:border-ecoar-light-900/[0.06]">
              <div className="text-slate-500 dark:text-ecoar-light-900/50 mb-0.5">Nível</div>
              <div className="text-slate-900 dark:text-ecoar-light-900/90 font-semibold">{level}</div>
            </div>
            <div className="bg-slate-50 dark:bg-ecoar-light-900/[0.03] rounded px-2 py-1.5 border border-slate-200 dark:border-ecoar-light-900/[0.06]">
              <div className="text-slate-500 dark:text-ecoar-light-900/50 mb-0.5">Atributo Médio</div>
              <div className="text-slate-900 dark:text-ecoar-light-900/90 font-semibold">{getMainAttribute()}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-ecoar-light-900/[0.06]">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={Eye}
              onClick={onView}
              className="flex-1"
            >
              Ver
            </Button>
          )}
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={Edit}
              onClick={onEdit}
              className="flex-1"
            >
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={Trash2}
              onClick={onDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <span className="sr-only">Deletar</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

