'use client'

import { useState, useEffect, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { staggerContainer, staggerItem } from '@/lib/motionVariants'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import AuthCard from './AuthCard'
import { LogIn } from 'lucide-react'
import { AuthError } from '@/types/auth'

interface LoginFormProps {
  onSwitchToRegister?: () => void
  onSuccess?: () => void
  initialMessage?: string | null
  onMessageShown?: () => void
}

export default function LoginForm({ onSwitchToRegister, onSuccess, initialMessage, onMessageShown }: LoginFormProps) {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(initialMessage || null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const isEmailNotVerified = error === AuthError.EMAIL_NOT_VERIFIED

  const handleResendVerification = async () => {
    if (!email.trim()) return
    setResendLoading(true)
    setResendMessage(null)
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      const res = await fetch(`${base}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      setResendMessage(data.message || (data.success ? 'Email reenviado. Verifique sua caixa de entrada.' : data.error || 'Erro ao reenviar.'))
    } catch {
      setResendMessage('Erro ao reenviar. Tente novamente.')
    } finally {
      setResendLoading(false)
    }
  }

  useEffect(() => {
    if (initialMessage) setInfoMessage(initialMessage)
  }, [initialMessage])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos')
      return
    }

    const result = await login(email.trim(), password)

    if (result.success) {
      if (onSuccess) {
        onSuccess()
      }
    } else {
      setError(result.error || 'Erro ao fazer login')
    }
  }

  return (
    <AuthCard
      title="Bem-vindo de volta"
      subtitle="Entre na sua conta para continuar"
      footer={
        <div className="text-center">
          <p className="text-sm text-ecoar-dark-500 dark:text-ecoar-light-900/55">
            Não tem uma conta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-ecoar-dark-700 dark:text-ecoar-light-900/80 hover:underline font-medium transition-colors duration-fast"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      }
    >
      <motion.form onSubmit={handleSubmit} className="space-y-4" variants={staggerContainer} initial="hidden" animate="visible">
        {infoMessage && (
          <motion.div
            variants={staggerItem}
            className="p-3 bg-ecoar-teal-100/80 dark:bg-ecoar-teal/10 border border-ecoar-teal-300/50 rounded-lg text-sm text-ecoar-teal-700 dark:text-ecoar-teal-400/90"
          >
            {infoMessage}
            {onMessageShown && (
              <button type="button" onClick={() => { setInfoMessage(null); onMessageShown() }} className="ml-2 text-xs underline">
                Fechar
              </button>
            )}
          </motion.div>
        )}
        {error && (
          <motion.div
            variants={staggerItem}
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 space-y-2"
          >
            <p>{error}</p>
            {isEmailNotVerified && (
              <div className="pt-1">
                <p className="text-ecoar-dark-600 dark:text-ecoar-light-900/70 text-xs mb-1">Não recebeu o email? Verifique o spam ou reenvie o link de verificação.</p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="text-ecoar-teal-600 dark:text-ecoar-teal-400 font-medium hover:underline text-xs"
                >
                  {resendLoading ? 'Enviando...' : 'Reenviar email de verificação'}
                </button>
                {resendMessage && <p className="text-xs mt-1 text-ecoar-dark-600 dark:text-ecoar-light-900/70">{resendMessage}</p>}
              </div>
            )}
          </motion.div>
        )}

        <motion.div variants={staggerItem}>
          <label className="block text-xs font-medium uppercase tracking-wide text-ecoar-dark-500 dark:text-ecoar-light-900/60 mb-2">EMAIL</label>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            error={error && !email.trim() ? 'Email é obrigatório' : undefined}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-ecoar-dark-500 dark:text-ecoar-light-900/60">SENHA</label>
            <button type="button" className="text-xs text-ecoar-dark-500 dark:text-ecoar-light-900/55 hover:underline">Esqueceu a senha?</button>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            error={error && !password.trim() ? 'Senha é obrigatória' : undefined}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <Button
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            leftIcon={LogIn}
            className="w-full min-h-[44px] rounded-lg bg-ecoar-dark-900 dark:bg-ecoar-dark-900 text-white hover:bg-ecoar-dark-800 dark:hover:bg-ecoar-dark-800 shadow-none"
            size="lg"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </motion.div>

        <motion.div className="relative my-4" variants={staggerItem}>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ecoar-dark-200 dark:border-ecoar-light-900/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-ecoar-light dark:bg-ecoar-dark-900 text-ecoar-dark-500 dark:text-ecoar-light-900/60">ou</span>
          </div>
        </motion.div>

        <motion.a
          variants={staggerItem}
          href={typeof window !== 'undefined' ? `${window.location.origin}/api/auth/google` : '/api/auth/google'}
          className="flex items-center justify-center gap-2 w-full min-h-[44px] py-3 px-4 rounded-lg border border-ecoar-dark-200 dark:border-ecoar-light-900/30 bg-white dark:bg-ecoar-dark-800 text-ecoar-dark-900 dark:text-ecoar-light-900 hover:bg-ecoar-dark-50 dark:hover:bg-ecoar-dark-700 transition-colors duration-fast font-medium text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com Google
        </motion.a>
      </motion.form>
    </AuthCard>
  )
}

