'use client'

import { Sparkles, Info } from 'lucide-react'

export function EvolutionStep({
  nivelAlmaInicial,
  pontosEvolucao,
}: {
  nivelAlmaInicial: number
  pontosEvolucao: number
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-none flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Sparkles className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              Evolução do Personagem
            </h3>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
              Você começou com Nível de Alma {nivelAlmaInicial}. Use seus {pontosEvolucao} Pontos de Evolução para adquirir singularidades ou evoluir traços.
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-none border border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03]">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60 space-y-1.5">
            <p>
              <strong className="text-slate-900 dark:text-ecoar-light-900">Pontos de Evolução:</strong> Você possui {pontosEvolucao} Pontos de Evolução que podem ser gastos para:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Evoluir Atributos (máximo nível 8)</li>
              <li>Evoluir Habilidades (máximo nível 8)</li>
              <li>Evoluir Aptidões (máximo nível 8)</li>
              <li>Adquirir Singularidades</li>
            </ul>
            <p className="mt-3">
              <strong className="text-slate-900 dark:text-ecoar-light-900">Nota:</strong> Os Pontos de Evolução são convertidos em Pontos de Criação (PC) na proporção de 1 PE = 10 PC. Você pode gastá-los nos steps anteriores ou guardá-los para usar durante o jogo.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="p-4 rounded-none border bg-ecoar-teal/8 border-ecoar-teal/20">
        <div className="text-[11px] text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50 uppercase tracking-wider mb-1.5">Pontos de Evolução Disponíveis</div>
        <div className="text-xl font-semibold text-ecoar-teal/90 dark:text-ecoar-teal-400/90">{pontosEvolucao}</div>
        <div className="text-[11px] text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50 mt-1.5">
          Equivalente a {pontosEvolucao * 10} Pontos de Criação
        </div>
      </div>
    </div>
  )
}

// Physical Characteristics Step
