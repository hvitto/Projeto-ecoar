'use client'

import { getRaceById } from '@/data/races'
import { getPathById } from '@/data/paths'
import { getLocationById } from '@/data/locations'
import { getAttributeModifier } from '@/lib/calculations'
import type { CharacterCreationData } from '@/components/wizard/CharacterCreationWizard'
import { martialSchoolCreationLabel } from '@/components/wizard/shared/wizardHelpers'

export function FinalReviewStep({
  nome,
  onNomeChange,
  data,
}: {
  nome: string
  onNomeChange: (nome: string) => void
  data: Partial<CharacterCreationData>
}) {
  const selectedRace = data.raca ? getRaceById(data.raca) : null
  const martialSchoolLabel = martialSchoolCreationLabel(data.escolaMarcial)
  const selectedPath = data.trilha ? getPathById(data.trilha) : null
  const selectedLocation = data.localizacao ? getLocationById(data.localizacao) : null

  const reviewCardClasses =
    'p-4 rounded-none border border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03] backdrop-blur-sm shadow-none'

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Finalize seu Personagem</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Revise suas escolhas e dê um nome ao seu personagem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Character Name */}
        <div className="md:col-span-2">
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">Nome do Personagem</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Digite o nome..."
            className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-none text-ecoar-light-900 placeholder:text-[#adb5bd]/60 focus:outline-none focus:outline-none focus:border-ecoar-magenta focus:border-ecoar-magenta"
          />
        </div>

        {/* Summary Cards */}
        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Raça</h4>
          {selectedRace ? (
            <div>
              <div className="text-slate-900 dark:text-ecoar-light-900 text-xl font-semibold">{selectedRace.name}</div>
            </div>
          ) : (
            <div className="text-slate-900 dark:text-ecoar-light-900/40">Não selecionado</div>
          )}
        </div>

        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Escola Marcial</h4>
          {martialSchoolLabel ? (
            <div>
              <div className="text-slate-900 dark:text-ecoar-light-900 text-xl font-semibold">{martialSchoolLabel.name}</div>
              {martialSchoolLabel.subtitle && (
                <div className="text-ecoar-magenta/60 text-sm">{martialSchoolLabel.subtitle}</div>
              )}
            </div>
          ) : (
            <div className="text-slate-900 dark:text-ecoar-light-900/40">Não selecionado</div>
          )}
        </div>

        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Trilha</h4>
          {selectedPath ? (
            <div className="text-slate-900 dark:text-ecoar-light-900 text-xl font-semibold">{selectedPath.name}</div>
          ) : (
            <div className="text-slate-900 dark:text-ecoar-light-900/40">Não selecionado</div>
          )}
        </div>

        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Região</h4>
          {selectedLocation ? (
            <div>
              <div className="text-slate-900 dark:text-ecoar-light-900 text-xl font-semibold">{selectedLocation.name}</div>
              {selectedLocation.nation && (
                <div className="text-slate-500 dark:text-ecoar-light-900/60 text-sm">{selectedLocation.nation}</div>
              )}
              {selectedLocation.region && (
                <div className="text-ecoar-teal/70 text-sm">{selectedLocation.region}</div>
              )}
            </div>
          ) : (
            <div className="text-slate-900 dark:text-ecoar-light-900/40">Não selecionado</div>
          )}
        </div>

        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Atributos</h4>
          <div className="space-y-2">
            {Object.entries(data.attributes || {}).map(([attr, value]) => (
              <div key={attr} className="flex justify-between text-slate-700 dark:text-ecoar-light-900/80">
                <span className="capitalize">{attr}:</span>
                <span className="font-semibold">{value} ({getAttributeModifier(value) >= 0 ? '+' : ''}{getAttributeModifier(value)})</span>
              </div>
            ))}
          </div>
        </div>

        {((data.equipamentos && data.equipamentos.length > 0) || (data.armas && data.armas.length > 0)) && (
          <div className={`md:col-span-2 ${reviewCardClasses}`}>
            <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Equipamentos & Armas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.equipamentos && data.equipamentos.length > 0 && (
                <div>
                  <h5 className="text-slate-700 dark:text-ecoar-light-900/80 font-semibold mb-2">Equipamentos:</h5>
                  <ul className="list-disc list-inside text-slate-600 dark:text-ecoar-light-900/70 space-y-1">
                    {data.equipamentos.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.armas && data.armas.length > 0 && (
                <div>
                  <h5 className="text-slate-700 dark:text-ecoar-light-900/80 font-semibold mb-2">Armas:</h5>
                  <ul className="list-disc list-inside text-slate-600 dark:text-ecoar-light-900/70 space-y-1">
                    {data.armas.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

