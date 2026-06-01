'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { staggerContainer, staggerItem } from '@/lib/motionVariants'
import Button from '@/components/ui/Button'
import AuthCard from './AuthCard'
import { DEMO_ACCOUNTS } from '@/lib/config'
import { Sparkles } from 'lucide-react'

interface DemoOnlyLoginProps {
  onSuccess?: () => void
}

export default function DemoOnlyLogin({ onSuccess }: DemoOnlyLoginProps) {
  const { loginDemo, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [pendingDemoId, setPendingDemoId] = useState<string | null>(null)

  const busy = isLoading || pendingDemoId !== null

  const handleDemoLogin = async (accountId: string) => {
    setError(null)
    setPendingDemoId(accountId)
    try {
      const result = await loginDemo(accountId)
      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error || 'Erro ao entrar na demonstração.')
      }
    } catch {
      setError('Erro ao iniciar a demonstração.')
    } finally {
      setPendingDemoId(null)
    }
  }

  return (
    <AuthCard
      title="ECOAR — Demonstração"
      subtitle="Escolha um perfil para explorar o app. Os dados ficam salvos neste navegador."
    >
      <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div
          variants={staggerItem}
          className="flex gap-3 rounded-lg border border-ecoar-teal-500/25 bg-ecoar-teal-500/10 p-3 text-sm text-ecoar-teal-700 dark:text-ecoar-teal-300/90"
        >
          <Sparkles className="w-5 h-5 shrink-0" aria-hidden />
          <p>
            Modo demonstração: sem cadastro, sem servidor de login e sem variáveis de ambiente. Ideal para testar o
            wizard e as fichas localmente.
          </p>
        </motion.div>

        {error && (
          <motion.p variants={staggerItem} className="text-sm text-red-400 text-center" role="alert">
            {error}
          </motion.p>
        )}

        <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <Button
              key={acc.id}
              type="button"
              onClick={() => void handleDemoLogin(acc.id)}
              disabled={busy}
              variant="secondary"
              size="sm"
              className="w-full min-h-[44px] rounded-lg text-xs justify-center"
            >
              {pendingDemoId === acc.id ? 'Abrindo...' : acc.label}
            </Button>
          ))}
        </motion.div>
      </motion.div>
    </AuthCard>
  )
}
