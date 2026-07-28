'use client'

export default function Footer() {
  return (
    <footer className="border-t border-ecoar-teal/50 dark:border-ecoar-teal bg-white/80 dark:bg-[#1a1d21]/90 mt-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 text-[9px] uppercase tracking-[0.14em] text-ecoar-dark-500 dark:text-ecoar-light-900/55">
        <div className="px-4 py-2.5 border-b sm:border-b-0 sm:border-r border-ecoar-teal/40 dark:border-ecoar-teal/50">
          ECOAR + · Companion digital
        </div>
        <div className="px-4 py-2.5 border-b sm:border-b-0 sm:border-r border-ecoar-teal/40 dark:border-ecoar-teal/50">
          PAL · TEAL GRID / MAGENTA ACCENT
        </div>
        <div className="px-4 py-2.5">
          © {new Date().getFullYear()} · ID EB-OPERATE
        </div>
      </div>
    </footer>
  )
}
