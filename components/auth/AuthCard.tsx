'use client'

import { ReactNode } from 'react'
import { Crown } from 'lucide-react'
import Card from '@/shared/components/ui/Card'

interface AuthCardProps {
  children: ReactNode
  title: string
  subtitle?: string
  footer?: ReactNode
}

export default function AuthCard({ children, title, subtitle, footer }: AuthCardProps) {
  return (
    <div className="w-full">
      <Card className="p-4 sm:p-6 md:p-8 rounded-xl bg-white dark:bg-ecoar-dark-800 border border-ecoar-dark-200/50 dark:border-ecoar-light-900/10 shadow-lg max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 bg-ecoar-teal-100/80 dark:bg-ecoar-teal-600/20 rounded-lg flex items-center justify-center border border-ecoar-teal-300/40 dark:border-ecoar-teal-500/20 mb-3">
            <Crown className="w-5 h-5 text-ecoar-teal-600 dark:text-ecoar-teal-400/90" />
          </div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-ecoar-dark-900 dark:text-ecoar-light-900/95 mb-0.5">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-ecoar-dark-500 dark:text-ecoar-light-900/55 text-center">
              {subtitle}
            </p>
          )}
        </div>

        <div className="mb-6">
          {children}
        </div>

        {footer && (
          <div className="pt-4 border-t border-ecoar-dark-200/40 dark:border-ecoar-light-900/[0.08]">
            {footer}
          </div>
        )}
      </Card>
    </div>
  )
}
