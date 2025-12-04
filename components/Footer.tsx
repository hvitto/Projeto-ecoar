'use client'

import { motion } from 'framer-motion'
import { Heart, Github, Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-ecoar-dark/70 dark:bg-ecoar-dark-800/70 backdrop-blur-xl border-t border-white/[0.06] dark:border-ecoar-light-900/[0.06] mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
          {/* Brand */}
          <div>
            <h3 className="text-base font-semibold text-white/90 dark:text-ecoar-light-900/90 mb-2">ECOAR Beyond</h3>
            <p className="text-xs text-white/50 dark:text-ecoar-light-900/50 leading-relaxed">
              Sistema de criação e gerenciamento de personagens para o RPG ECOAR.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold text-white/80 dark:text-ecoar-light-900/80 mb-2 uppercase tracking-wider">Links Rápidos</h4>
            <ul className="space-y-1.5">
              <li>
                <a href="#" className="text-xs text-white/50 dark:text-ecoar-light-900/50 hover:text-ecoar-teal/80 transition-colors">
                  Criação de Personagem
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-white/50 dark:text-ecoar-light-900/50 hover:text-ecoar-teal/80 transition-colors">
                  Regras do Jogo
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-white/50 dark:text-ecoar-light-900/50 hover:text-ecoar-teal/80 transition-colors">
                  Guia de Jogadores
                </a>
              </li>
            </ul>
          </div>

          {/* Social/Contact */}
          <div>
            <h4 className="text-xs font-semibold text-white/80 dark:text-ecoar-light-900/80 mb-2 uppercase tracking-wider">Contato</h4>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-8 h-8 bg-white/[0.03] dark:bg-ecoar-light-900/[0.03] rounded-lg flex items-center justify-center border border-white/[0.08] dark:border-ecoar-light-900/[0.08] hover:bg-ecoar-teal/15 hover:border-ecoar-teal/20 transition-all"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 text-white/60 dark:text-ecoar-light-900/60" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-white/[0.03] dark:bg-ecoar-light-900/[0.03] rounded-lg flex items-center justify-center border border-white/[0.08] dark:border-ecoar-light-900/[0.08] hover:bg-ecoar-teal/15 hover:border-ecoar-teal/20 transition-all"
                aria-label="Website"
              >
                <Globe className="w-4 h-4 text-white/60 dark:text-ecoar-light-900/60" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-5 border-t border-white/[0.06] dark:border-ecoar-light-900/[0.06] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-white/40 dark:text-ecoar-light-900/40 flex items-center gap-1.5">
            Feito com <Heart className="w-3 h-3 text-ecoar-magenta/80 fill-ecoar-magenta/80" /> para ECOAR RPG
          </p>
          <p className="text-[11px] text-white/40 dark:text-ecoar-light-900/40">
            © {new Date().getFullYear()} ECOAR Beyond. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

