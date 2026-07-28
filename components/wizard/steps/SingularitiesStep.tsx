'use client'

import SingularityCard from '@/shared/components/ui/SingularityCard'
import { getSingularitiesByCategory, getSingularityById, Singularity } from '@/data/singularities'

export function SingularitiesStep({
  singularidades,
  pontosDisponiveis,
  onSingularidadesChange,
  onPointsChange,
}: {
  singularidades: string[]
  pontosDisponiveis: number
  onSingularidadesChange: (singularidades: string[]) => void
  onPointsChange: (gastos: number) => void
}) {
  const toggleSingularity = (id: string) => {
    const singularity = getSingularityById(id)
    if (!singularity) return

    const isSelected = singularidades.includes(id)
    if (isSelected) {
      onSingularidadesChange(singularidades.filter(s => s !== id))
      onPointsChange(pontosDisponiveis + singularity.cost)
    } else {
      if (pontosDisponiveis >= singularity.cost) {
        onSingularidadesChange([...singularidades, id])
        onPointsChange(pontosDisponiveis - singularity.cost)
      }
    }
  }

  const categories: Singularity['category'][] = ['evolucao', 'talento', 'infusao', 'adaptacao', 'fragil', 'mente-prodigiosa', 'fisica-prodiga']
  const categoryLabels: Record<Singularity['category'], string> = {
    evolucao: 'Evolução',
    talento: 'Talento',
    infusao: 'Infusão',
    adaptacao: 'Adaptação',
    fragil: 'Frágil',
    'mente-prodigiosa': 'Mente Prodigiosa',
    'fisica-prodiga': 'Física Pródiga',
  }

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Singularidades</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Escolha singularidades para seu personagem</p>
        <div className={`mt-2 text-base font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal/90' : 'text-red-400/90'}`}>
          Pontos Disponíveis: {pontosDisponiveis}
        </div>
      </div>

      {categories.map((category) => {
        const categorySingularities = getSingularitiesByCategory(category)
        if (categorySingularities.length === 0) return null

        return (
          <div key={category} className="space-y-3">
            <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 border-b border-white/[0.06] dark:border-ecoar-light-900/[0.06] pb-1.5">
              {categoryLabels[category]}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categorySingularities.map((singularity) => {
                const isSelected = singularidades.includes(singularity.id)
                const canAfford = pontosDisponiveis >= singularity.cost
                return (
                  <SingularityCard
                    key={singularity.id}
                    name={singularity.name}
                    description={singularity.description}
                    cost={singularity.cost}
                    isSelected={isSelected}
                    canAfford={canAfford}
                    canSelect={canAfford}
                    onClick={() => toggleSingularity(singularity.id)}
                    requirements={singularity.requirements}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Ecoar Step
