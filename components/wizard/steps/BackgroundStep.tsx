'use client'

import { User } from 'lucide-react'
import { Input, Textarea } from '@/shared/components/ui'

export function BackgroundStep({
  nome,
  backstory,
  tracoPositivo,
  tracoNegativo,
  personalidade,
  onNomeChange,
  onBackstoryChange,
  onTracoPositivoChange,
  onTracoNegativoChange,
  onPersonalidadeChange,
}: {
  nome: string
  backstory: string
  tracoPositivo: string
  tracoNegativo: string
  personalidade: string
  onNomeChange: (value: string) => void
  onBackstoryChange: (value: string) => void
  onTracoPositivoChange: (value: string) => void
  onTracoNegativoChange: (value: string) => void
  onPersonalidadeChange: (value: string) => void
}) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Background do Personagem</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Preencha as informações sobre seu personagem</p>
      </div>

      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">Nome *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Nome do personagem"
            className="w-full px-3 py-2 bg-white/[0.03] dark:bg-ecoar-dark-700/[0.03] border border-white/[0.08] dark:border-ecoar-light-900/[0.08] rounded-lg text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 placeholder-white/40 dark:placeholder-ecoar-light-900/40 focus:outline-none focus:ring-1 focus:ring-ecoar-teal/30 dark:focus:ring-ecoar-teal-500/30"
          />
        </div>

        {/* Backstory */}
        <div>
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">História/Background</label>
          <textarea
            value={backstory}
            onChange={(e) => onBackstoryChange(e.target.value)}
            placeholder="Conte a história do seu personagem..."
            rows={5}
            className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
          />
        </div>

        {/* Personalidade */}
        <div>
          <label className="block text-slate-900 dark:text-ecoar-light-900 font-semibold mb-2">Personalidade</label>
          <textarea
            value={personalidade}
            onChange={(e) => onPersonalidadeChange(e.target.value)}
            placeholder="Como seu personagem age e reage..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traço Positivo */}
          <div>
            <label className="block text-slate-900 dark:text-ecoar-light-900 font-semibold mb-2">Traço Positivo</label>
            <input
              type="text"
              value={tracoPositivo}
              onChange={(e) => onTracoPositivoChange(e.target.value)}
              placeholder="Um traço positivo..."
              className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Traço Negativo */}
          <div>
            <label className="block text-slate-900 dark:text-ecoar-light-900 font-semibold mb-2">Traço Negativo</label>
            <input
              type="text"
              value={tracoNegativo}
              onChange={(e) => onTracoNegativoChange(e.target.value)}
              placeholder="Um traço negativo..."
              className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* FinalReviewVisualizer / FinalReviewStep não são montados no fluxo atual (o passo 7 usa só BackgroundStep).
 * A revisão com bônus de singularidades está na coluna lateral "Resumo". Se estes componentes voltarem ao fluxo,
 * reutilize a mesma agregação (aggregateSimpleBonuses / computeEffectiveAttributeRows) que o Resumo. */
// Final Review Visualizer (Read-only)
