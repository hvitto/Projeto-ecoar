'use client'

import WizardStage from '@/components/beyond/WizardStage'

const fieldClass =
  'w-full px-3 py-2.5 bg-[#0a0a0a]/55 border border-ecoar-teal/45 dark:border-ecoar-teal/55 text-[11px] text-ecoar-dark-900 dark:text-ecoar-light-900 placeholder:text-ecoar-dark-500/70 dark:placeholder:text-[#adb5bd]/60 focus:outline-none focus:border-ecoar-magenta rounded-none'

const labelClass = 'block text-[9px] uppercase tracking-[0.14em] text-ecoar-teal mb-1.5'

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
    <WizardStage
      title="Finalização"
      refId="STEP-08"
      lede="Nome, história e traços. Último carimbo antes da ficha."
      hero="dither"
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="char-nome">
            Nome *
          </label>
          <input
            id="char-nome"
            type="text"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Nome do personagem"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="char-backstory">
            História / Background
          </label>
          <textarea
            id="char-backstory"
            value={backstory}
            onChange={(e) => onBackstoryChange(e.target.value)}
            placeholder="Conte a história do seu personagem..."
            rows={5}
            className={`${fieldClass} resize-none`}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="char-personalidade">
            Personalidade
          </label>
          <textarea
            id="char-personalidade"
            value={personalidade}
            onChange={(e) => onPersonalidadeChange(e.target.value)}
            placeholder="Como seu personagem age e reage..."
            rows={3}
            className={`${fieldClass} resize-none`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="char-traco-pos">
              Traço positivo
            </label>
            <input
              id="char-traco-pos"
              type="text"
              value={tracoPositivo}
              onChange={(e) => onTracoPositivoChange(e.target.value)}
              placeholder="Um traço positivo..."
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="char-traco-neg">
              Traço negativo
            </label>
            <input
              id="char-traco-neg"
              type="text"
              value={tracoNegativo}
              onChange={(e) => onTracoNegativoChange(e.target.value)}
              placeholder="Um traço negativo..."
              className={fieldClass}
            />
          </div>
        </div>
      </div>
    </WizardStage>
  )
}
