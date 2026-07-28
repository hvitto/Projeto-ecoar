'use client'

import { ReactNode } from 'react'

interface AuthCardProps {
  children: ReactNode
  title: string
  subtitle?: string
  stamp?: string
  footer?: ReactNode
}

export default function AuthCard({
  children,
  title,
  subtitle,
  stamp,
  footer,
}: AuthCardProps) {
  return (
    <div className="auth-gate w-full">
      <div
        role="region"
        aria-labelledby="auth-gate-title"
        className="rounded-none border border-ecoar-teal/50 dark:border-ecoar-teal bg-white dark:bg-[#0a0a0a]"
      >
        <div className="px-3 sm:px-4 pt-3 pb-2.5 border-b border-ecoar-teal/40 dark:border-ecoar-teal/50">
          {stamp && (
            <p className="mb-1.5 text-[0.6875rem] uppercase leading-none tracking-[0.16em] text-ecoar-teal-700 dark:text-ecoar-teal">
              {stamp}
            </p>
          )}
          <h2
            id="auth-gate-title"
            className="font-display text-xl uppercase leading-[1.05] tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1.5 max-w-[40ch] text-xs leading-relaxed tracking-[0.02em] text-ecoar-dark-600 dark:text-[#c5c8ce]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="px-3 sm:px-4 py-3 text-sm leading-relaxed tracking-[0.02em]">
          {children}
        </div>

        {footer && (
          <div className="px-3 sm:px-4 py-2.5 border-t border-ecoar-teal/40 dark:border-ecoar-teal/50 text-xs leading-relaxed tracking-[0.02em]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
