'use client'

import Image from 'next/image'
import { useId } from 'react'
import { Calendar, Edit, Trash2, Eye } from 'lucide-react'
import Button from './Button'
import { CharacterWithMetadata } from '@/shared/types/auth'
import { getRaceById } from '@/data/races'
import { getPathById } from '@/data/paths'
import { getMartialSchoolDataByIdResolved } from '@/data/martialSchoolSingularities'

interface CharacterCardProps {
  character: CharacterWithMetadata
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  deleteDisabled?: boolean
}

function shortPathLabel(name: string) {
  return name.replace(/^Trilha (da|do|dos|das)\s+/i, '')
}

export default function CharacterCard({
  character,
  onView,
  onEdit,
  onDelete,
  deleteDisabled = false,
}: CharacterCardProps) {
  const titleId = useId()
  const characterData = character.data
  const race = characterData?.raca ? getRaceById(characterData.raca) : null
  const level = characterData?.nivelAlma || characterData?.nivelPoder || 1
  const shortId = character.id?.slice(0, 8)?.toUpperCase() || '--------'
  const displayName = character.name || 'Sem nome'

  const schoolId =
    typeof characterData?.escolaMarcial === 'string' ? characterData.escolaMarcial : ''
  const pathId = typeof characterData?.trilha === 'string' ? characterData.trilha : ''
  const schoolName = schoolId
    ? getMartialSchoolDataByIdResolved(schoolId)?.name ?? schoolId
    : null
  const pathName = pathId ? getPathById(pathId)?.name ?? pathId : null
  const pathShort = pathName ? shortPathLabel(pathName) : null

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
    <article
      aria-labelledby={titleId}
      className="border border-ecoar-teal/45 dark:border-ecoar-teal/55 bg-white/80 dark:bg-[#0a0a0a]/55 hover:border-ecoar-teal transition-colors flex flex-col h-full overflow-hidden"
    >
      <div className="px-3 py-2 border-b border-ecoar-teal/35 dark:border-ecoar-teal/40 flex items-center justify-between gap-2">
        <span className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal">ID · {shortId}</span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] uppercase tracking-[0.12em] text-ecoar-teal dark:text-[#7bb7bb] font-bold">
            Nível {level}
          </span>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleteDisabled}
              aria-label={`Apagar ${displayName}`}
              title="Apagar"
              className="ml-1 inline-flex min-h-11 min-w-11 items-center justify-center text-ecoar-dark-500 dark:text-[#adb5bd] transition-colors hover:text-ecoar-magenta disabled:opacity-40 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      {race?.image?.src ? (
        <div className="relative h-28 border-b border-ecoar-teal/35 dark:border-ecoar-teal/40 bg-[#0a0a0a]">
          <Image
            src={race.image.src}
            alt=""
            fill
            sizes="320px"
            className="object-cover object-top contrast-[1.08] saturate-[0.8] grayscale-[0.2]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" aria-hidden />
          <span className="absolute left-2 bottom-1.5 text-[9px] uppercase tracking-[0.12em] text-ecoar-light-900/90">
            {race.name}
          </span>
        </div>
      ) : null}

      <div className="p-3 flex-1 min-w-0">
        <h3
          id={titleId}
          className="font-display text-base uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 truncate mb-2"
          title={displayName}
        >
          {displayName}
        </h3>
        <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-ecoar-dark-500 dark:text-[#adb5bd] mb-3">
          <Calendar className="w-3 h-3 text-ecoar-teal shrink-0" aria-hidden />
          Criada em {formatDate(character.createdAt)}
        </p>
        {race?.name ? <p className="sr-only">Raça {race.name}</p> : null}

        <div className="grid grid-cols-2 border border-ecoar-teal/35">
          <div className="px-2 py-1.5 border-r border-ecoar-teal/35 min-w-0">
            <div className="text-[9px] uppercase tracking-[0.12em] text-ecoar-teal mb-0.5">Escola</div>
            <div
              className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 leading-tight truncate"
              title={schoolName ?? undefined}
            >
              {schoolName ?? '—'}
            </div>
          </div>
          <div className="px-2 py-1.5 min-w-0">
            <div className="text-[9px] uppercase tracking-[0.12em] text-ecoar-teal mb-0.5">Trilha</div>
            <div
              className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 leading-tight truncate"
              title={pathName ?? undefined}
            >
              {pathShort ?? '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-t border-ecoar-teal/35 dark:border-ecoar-teal/40">
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Eye}
            onClick={onView}
            className="flex-1 min-h-11 rounded-none border-0 border-r border-ecoar-teal/35"
            aria-label={`Abrir ficha de ${displayName}`}
          >
            Abrir
          </Button>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Edit}
            onClick={onEdit}
            className="flex-1 min-h-11 rounded-none border-0"
            aria-label={`Editar ficha de ${displayName}`}
          >
            Editar
          </Button>
        )}
      </div>
    </article>
  )
}
