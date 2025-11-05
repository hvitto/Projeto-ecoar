'use client'

import { motion } from 'framer-motion'
import { ScrollText, Crown } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-ecoar-dark/80 backdrop-blur-xl border-b border-ecoar-dark/50 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-ecoar-teal/20 rounded-xl flex items-center justify-center border border-ecoar-teal/30">
              <Crown className="w-5 h-5 text-ecoar-teal" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ECOAR</h1>
              <p className="text-xs text-white/60">Beyond</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Personagens
            </a>
            <a href="#" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Regras
            </a>
            <a href="#" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Sobre
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

