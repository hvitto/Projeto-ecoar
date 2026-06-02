'use client'

export default function StepSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Carregando etapa">
      <div className="h-8 w-48 rounded-lg bg-ecoar-dark-300/20 dark:bg-white/[0.06]" />
      <div className="h-4 w-full max-w-md rounded bg-ecoar-dark-300/15 dark:bg-white/[0.04]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-ecoar-dark-300/15 dark:bg-white/[0.05] border border-ecoar-dark-300/20 dark:border-ecoar-light-900/[0.06]"
          />
        ))}
      </div>
    </div>
  )
}
