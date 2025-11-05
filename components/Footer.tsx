'use client'

import { motion } from 'framer-motion'
import { Heart, Github, Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-ecoar-dark/80 backdrop-blur-xl border-t border-ecoar-dark/50 mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">ECOAR Beyond</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Sistema de criação e gerenciamento de personagens para o RPG ECOAR.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-white/60 hover:text-ecoar-teal transition-colors">
                  Criação de Personagem
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/60 hover:text-ecoar-teal transition-colors">
                  Regras do Jogo
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/60 hover:text-ecoar-teal transition-colors">
                  Guia de Jogadores
                </a>
              </li>
            </ul>
          </div>

          {/* Social/Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Contato</h4>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 hover:bg-ecoar-teal/20 hover:border-ecoar-teal/30 transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-white/70" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 hover:bg-ecoar-teal/20 hover:border-ecoar-teal/30 transition-all"
                aria-label="Website"
              >
                <Globe className="w-5 h-5 text-white/70" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50 flex items-center gap-2">
            Feito com <Heart className="w-3 h-3 text-ecoar-magenta fill-ecoar-magenta" /> para ECOAR RPG
          </p>
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} ECOAR Beyond. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

