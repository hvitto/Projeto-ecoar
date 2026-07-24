'use client'

import { motion } from 'framer-motion'
import { Sword } from 'lucide-react'
import { getAllMartialSchools } from '@/data/martialSchoolSingularities'
import MartialSchoolCard from '@/shared/components/ui/MartialSchoolCard'

export function MartialSchoolSelectionStep({
  selectedEscolaMarcial,
  onSelect,
}: {
  selectedEscolaMarcial: string
  onSelect: (id: string) => void
}) {
  const allMartialSchools = getAllMartialSchools()

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Sword className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-0.5">
              Escolha sua Escola Marcial
            </h3>
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/50">Selecione a classe de combate do seu personagem</p>
          </div>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allMartialSchools.map((school, index) => (
          <MartialSchoolCard
            key={school.id}
            school={school}
            isSelected={selectedEscolaMarcial === school.id}
            onClick={() => onSelect(school.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

