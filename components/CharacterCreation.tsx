'use client'

import { useState } from 'react'
import { races, getAllGenus, getRacesByGenus } from '@/data/races'
import { classes } from '@/data/classes'
import { paths } from '@/data/paths'

interface CharacterCreationProps {
  onComplete: (data: {
    oficio: string
    genus: string
    raca: string
    trilha: string
  }) => void
  initialData?: {
    oficio?: string
    genus?: string
    raca?: string
    trilha?: string
  }
}

export default function CharacterCreation({ onComplete, initialData }: CharacterCreationProps) {
  const [step, setStep] = useState(1)
  const [selectedOficio, setSelectedOficio] = useState(initialData?.oficio || '')
  const [selectedGenus, setSelectedGenus] = useState(initialData?.genus || '')
  const [selectedRaca, setSelectedRaca] = useState(initialData?.raca || '')
  const [selectedTrilha, setSelectedTrilha] = useState(initialData?.trilha || '')

  const availableRaces = selectedGenus ? getRacesByGenus(selectedGenus) : []

  const handleComplete = () => {
    if (selectedOficio && selectedGenus && selectedRaca && selectedTrilha) {
      onComplete({
        oficio: selectedOficio,
        genus: selectedGenus,
        raca: selectedRaca,
        trilha: selectedTrilha,
      })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Criação de Personagem</h2>
      
      {/* Step 1: Ofício */}
      {step === 1 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">1. Defina um Ofício</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((classe) => (
              <button
                key={classe.id}
                onClick={() => {
                  setSelectedOficio(classe.id)
                  setTimeout(() => setStep(2), 300)
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedOficio === classe.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <h4 className="font-semibold text-gray-800">{classe.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{classe.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Genus */}
      {step === 2 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setStep(1)}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Voltar
            </button>
            <h3 className="text-xl font-semibold">2. Defina seu Genus</h3>
            <div></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getAllGenus().map((genus) => (
              <button
                key={genus}
                onClick={() => {
                  setSelectedGenus(genus)
                  setSelectedRaca('') // Reset race when genus changes
                  setTimeout(() => setStep(3), 300)
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedGenus === genus
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <h4 className="font-semibold text-gray-800">{genus}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {getRacesByGenus(genus).length} raça(s) disponível(is)
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Raça */}
      {step === 3 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => {
                setStep(2)
                setSelectedRaca('')
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Voltar
            </button>
            <h3 className="text-xl font-semibold">3. Defina sua Raça</h3>
            <div></div>
          </div>
          {availableRaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableRaces.map((race) => (
                <button
                  key={race.id}
                  onClick={() => {
                    setSelectedRaca(race.id)
                    setTimeout(() => setStep(4), 300)
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedRaca === race.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <h4 className="font-semibold text-gray-800">{race.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{race.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Selecione um Genus primeiro.</p>
          )}
        </div>
      )}

      {/* Step 4: Trilha */}
      {step === 4 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => {
                setStep(3)
                setSelectedTrilha('')
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Voltar
            </button>
            <h3 className="text-xl font-semibold">4. Defina sua Trilha</h3>
            <div></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paths.map((path) => (
              <button
                key={path.id}
                onClick={() => {
                  setSelectedTrilha(path.id)
                  setTimeout(() => {
                    handleComplete()
                  }, 300)
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedTrilha === path.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <h4 className="font-semibold text-gray-800">{path.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{path.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Resumo:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Ofício: {selectedOficio ? classes.find(c => c.id === selectedOficio)?.name : 'Não selecionado'}</div>
          <div>Genus: {selectedGenus || 'Não selecionado'}</div>
          <div>Raça: {selectedRaca ? races.find(r => r.id === selectedRaca)?.name : 'Não selecionado'}</div>
          <div>Trilha: {selectedTrilha ? paths.find(p => p.id === selectedTrilha)?.name : 'Não selecionado'}</div>
        </div>
      </div>
    </div>
  )
}

