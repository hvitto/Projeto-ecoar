'use client'

export function PhysicalCharacteristicsStep({
  tamanho,
  peso,
  deslocamento,
  sentidos,
  onTamanhoChange,
  onPesoChange,
  onDeslocamentoChange,
  onSentidosChange,
}: {
  tamanho: string
  peso: string
  deslocamento: { terrestre: number; aquatico: number; aereo: number }
  sentidos: { visao: number; audicao: number; olfato: number }
  onTamanhoChange: (value: string) => void
  onPesoChange: (value: string) => void
  onDeslocamentoChange: (value: { terrestre: number; aquatico: number; aereo: number }) => void
  onSentidosChange: (value: { visao: number; audicao: number; olfato: number }) => void
}) {
  const tamanhos = ['Minúsculo', 'Muito Pequeno', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Gigante', 'Massivo', 'Titânico', 'Colossal', 'Absurdo']
  const pesos = ['Peso Pena', 'Miúdo', 'Delicado', 'Muito Leve', 'Leve', 'Médio', 'Pesado', 'Enorme', 'Gigante', 'Massivo', 'Titânico', 'Colossal', 'Absurdo']

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Características Físicas</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Defina tamanho, peso, deslocamento e sentidos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tamanho */}
        <div className="p-4 rounded-none border border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03]">
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">Tamanho</label>
          <select
            value={tamanho}
            onChange={(e) => onTamanhoChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/[0.03] dark:bg-ecoar-dark-700/[0.03] border border-white/[0.08] dark:border-ecoar-light-900/[0.08] rounded-none text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 focus:outline-none focus:ring-1 focus:ring-ecoar-teal/30 dark:focus:ring-ecoar-teal-500/30"
          >
            <option value="">Selecione...</option>
            {tamanhos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Peso */}
        <div className="p-4 rounded-none border border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03]">
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">Peso</label>
          <select
            value={peso}
            onChange={(e) => onPesoChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/[0.03] dark:bg-ecoar-dark-700/[0.03] border border-white/[0.08] dark:border-ecoar-light-900/[0.08] rounded-none text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 focus:outline-none focus:ring-1 focus:ring-ecoar-teal/30 dark:focus:ring-ecoar-teal-500/30"
          >
            <option value="">Selecione...</option>
            {pesos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deslocamento */}
      <div className="p-6 rounded-none border border-ecoar-dark/50 bg-gray-900/40">
        <h4 className="text-xl font-bold text-slate-900 dark:text-ecoar-light-900 mb-4">Deslocamento (em metros)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2">Terrestre</label>
            <input
              type="number"
              value={deslocamento.terrestre}
              onChange={(e) => onDeslocamentoChange({ ...deslocamento, terrestre: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-none text-ecoar-light-900 focus:outline-none focus:outline-none focus:border-ecoar-magenta"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2">Aquático</label>
            <input
              type="number"
              value={deslocamento.aquatico}
              onChange={(e) => onDeslocamentoChange({ ...deslocamento, aquatico: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-none text-ecoar-light-900 focus:outline-none focus:outline-none focus:border-ecoar-magenta"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2">Aéreo</label>
            <input
              type="number"
              value={deslocamento.aereo}
              onChange={(e) => onDeslocamentoChange({ ...deslocamento, aereo: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-none text-ecoar-light-900 focus:outline-none focus:outline-none focus:border-ecoar-magenta"
            />
          </div>
        </div>
      </div>

      {/* Sentidos */}
      <div className="p-6 rounded-none border border-ecoar-dark/50 bg-gray-900/40">
        <h4 className="text-xl font-bold text-slate-900 dark:text-ecoar-light-900 mb-4">Sentidos (em metros)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2">Visão</label>
            <input
              type="number"
              value={sentidos.visao}
              onChange={(e) => onSentidosChange({ ...sentidos, visao: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-none text-ecoar-light-900 focus:outline-none focus:outline-none focus:border-ecoar-magenta"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2">Audição</label>
            <input
              type="number"
              value={sentidos.audicao}
              onChange={(e) => onSentidosChange({ ...sentidos, audicao: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-none text-ecoar-light-900 focus:outline-none focus:outline-none focus:border-ecoar-magenta"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2">Olfato</label>
            <input
              type="number"
              value={sentidos.olfato}
              onChange={(e) => onSentidosChange({ ...sentidos, olfato: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-none text-ecoar-light-900 focus:outline-none focus:outline-none focus:border-ecoar-magenta"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Path Singularities Tab Component
