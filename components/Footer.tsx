'use client'

import { motion } from 'framer-motion'
import { Heart, Github, Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-ecoar-dark-600/70 dark:bg-ecoar-dark-800/70 backdrop-blur-xl border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06] mt-auto">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
          {/* Brand */}
          <div>
            <h3 className="text-base font-semibold text-ecoar-light-700 dark:text-ecoar-light-900/90 mb-2">ECOAR Beyond</h3>
            <p className="text-xs text-ecoar-light-700/70 dark:text-ecoar-light-900/50 leading-relaxed">
              Sistema de criação e gerenciamento de personagens para o RPG ECOAR.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold text-ecoar-light-700/90 dark:text-ecoar-light-900/80 mb-2 uppercase tracking-wider">Links Rápidos</h4>
            <ul className="space-y-1.5">
              <li>
                <a href="#" className="text-xs text-ecoar-light-700/70 dark:text-ecoar-light-900/50 hover:text-ecoar-teal-600 dark:hover:text-ecoar-teal-400 transition-colors">
                  Criação de Personagem
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-ecoar-light-700/70 dark:text-ecoar-light-900/50 hover:text-ecoar-teal-600 dark:hover:text-ecoar-teal-400 transition-colors">
                  Regras do Jogo
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-ecoar-light-700/70 dark:text-ecoar-light-900/50 hover:text-ecoar-teal-600 dark:hover:text-ecoar-teal-400 transition-colors">
                  Guia de Jogadores
                </a>
              </li>
            </ul>
          </div>

          {/* Social/Contact */}
          <div>
            <h4 className="text-xs font-semibold text-ecoar-light-700/90 dark:text-ecoar-light-900/80 mb-2 uppercase tracking-wider">Contato</h4>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-8 h-8 bg-ecoar-light-700/10 dark:bg-ecoar-light-900/[0.03] rounded-lg flex items-center justify-center border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] hover:bg-ecoar-teal-100/50 dark:hover:bg-ecoar-teal-600/15 hover:border-ecoar-teal-500/50 dark:hover:border-ecoar-teal-400/40 transition-all"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 text-ecoar-dark-700 dark:text-ecoar-light-900/60" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-ecoar-light-700/10 dark:bg-ecoar-light-900/[0.03] rounded-lg flex items-center justify-center border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] hover:bg-ecoar-teal-100/50 dark:hover:bg-ecoar-teal-600/15 hover:border-ecoar-teal-500/50 dark:hover:border-ecoar-teal-400/40 transition-all"
                aria-label="Website"
              >
                <Globe className="w-4 h-4 text-ecoar-dark-700 dark:text-ecoar-light-900/60" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-5 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-ecoar-light-700/60 dark:text-ecoar-light-900/40 flex items-center gap-1.5">
            Feito com <Heart className="w-3 h-3 text-ecoar-magenta-600 dark:text-ecoar-magenta-400 fill-ecoar-magenta-600 dark:fill-ecoar-magenta-400" /> para ECOAR RPG
          </p>
          <p className="text-[11px] text-ecoar-light-700/60 dark:text-ecoar-light-900/40">
            © {new Date().getFullYear()} ECOAR Beyond. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

