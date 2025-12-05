'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Crown } from 'lucide-react'
import Card from '@/components/ui/Card'

interface AuthCardProps {
  children: ReactNode
  title: string
  subtitle?: string
  footer?: ReactNode
}

export default function AuthCard({ children, title, subtitle, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 md:p-8 bg-white/90 dark:bg-ecoar-dark-800/60 backdrop-blur-xl border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.12] shadow-lg">
          {/* Header com Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-ecoar-teal-100/80 dark:bg-ecoar-teal-600/15 rounded-xl flex items-center justify-center border border-ecoar-teal-300/50 dark:border-ecoar-teal-500/20 mb-4">
              <Crown className="w-6 h-6 text-ecoar-teal-600 dark:text-ecoar-teal-400/80" />
            </div>
            <h1 className="text-2xl font-bold text-ecoar-dark-900 dark:text-ecoar-light-900/90 mb-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-ecoar-dark-600 dark:text-ecoar-light-900/60 text-center">
                {subtitle}
              </p>
            )}
          </div>

          {/* Conteúdo do formulário */}
          <div className="mb-6">
            {children}
          </div>

          {/* Footer com links alternativos */}
          {footer && (
            <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06]">
              {footer}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

