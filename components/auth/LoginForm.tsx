'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useAuth } from '@/shared/contexts/AuthContext'
import { Input } from '@/shared/components/ui/Input'
import StampButton from '@/components/beyond/StampButton'
import AuthCard from './AuthCard'
import GoogleAuthLink from './GoogleAuthLink'
import { AuthError } from '@/shared/types/auth'

interface LoginFormProps {
  onSwitchToRegister?: () => void
  onSuccess?: () => void
  initialMessage?: string | null
  onMessageShown?: () => void
}

type FieldErrors = {
  email?: string
  password?: string
}

export default function LoginForm({ onSwitchToRegister, onSuccess, initialMessage, onMessageShown }: LoginFormProps) {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [infoMessage, setInfoMessage] = useState<string | null>(initialMessage || null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const isEmailNotVerified = error === AuthError.EMAIL_NOT_VERIFIED
  const formBusy = isLoading || loginSubmitting

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setFieldErrors((prev) => ({ ...prev, email: 'Informe o email para reenviar' }))
      return
    }
    setResendLoading(true)
    setResendMessage(null)
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      const res = await fetch(`${base}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      setResendMessage(data.message || (data.success ? 'Email reenviado.' : data.error || 'Erro ao reenviar.'))
    } catch {
      setResendMessage('Falha de conexão. Tente de novo.')
    } finally {
      setResendLoading(false)
    }
  }

  useEffect(() => {
    if (initialMessage) setInfoMessage(initialMessage)
  }, [initialMessage])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (formBusy) return
    setError(null)

    const nextFieldErrors: FieldErrors = {
      email: !email.trim() ? 'Email é obrigatório' : undefined,
      password: !password.trim() ? 'Senha é obrigatória' : undefined,
    }
    if (nextFieldErrors.email || nextFieldErrors.password) {
      setFieldErrors(nextFieldErrors)
      return
    }

    setFieldErrors({})
    setLoginSubmitting(true)
    try {
      const result = await login(email.trim(), password)
      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error || 'Não foi possível entrar. Tente de novo.')
      }
    } catch {
      setError('Falha de conexão. Verifique a rede e tente de novo.')
    } finally {
      setLoginSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Entrar"
      footer={
        <p className="text-center text-sm text-ecoar-dark-600 dark:text-[#c5c8ce]">
          Sem conta?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            disabled={formBusy}
            className="text-ecoar-dark-900 dark:text-ecoar-light-900 hover:underline font-medium transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal"
          >
            Criar conta
          </button>
        </p>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-3"
        aria-busy={formBusy}
        noValidate
      >
        {infoMessage && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start justify-between gap-2 p-2.5 border border-ecoar-teal/40 text-xs text-ecoar-teal-800 dark:text-ecoar-teal break-words"
          >
            <span>{infoMessage}</span>
            {onMessageShown && (
              <button
                type="button"
                onClick={() => {
                  setInfoMessage(null)
                  onMessageShown()
                }}
                className="shrink-0 underline"
              >
                Fechar
              </button>
            )}
          </div>
        )}

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="space-y-1.5 p-2.5 border border-red-500/40 text-sm text-red-700 dark:text-red-300 break-words"
          >
            <p>{error}</p>
            {isEmailNotVerified && (
              <div>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading || formBusy}
                  className="text-ecoar-teal-800 dark:text-ecoar-teal font-medium hover:underline text-xs disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal"
                >
                  {resendLoading ? 'Enviando…' : 'Reenviar verificação'}
                </button>
                {resendMessage && (
                  <p role="status" aria-live="polite" className="text-xs mt-1 text-ecoar-dark-600 dark:text-ecoar-light-900/70">
                    {resendMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <Input
          id="auth-login-email"
          type="email"
          label="EMAIL"
          name="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
            if (error && !isEmailNotVerified) setError(null)
          }}
          disabled={formBusy}
          error={fieldErrors.email}
          required
        />

        <Input
          id="auth-login-password"
          type="password"
          label="SENHA"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
            if (error && !isEmailNotVerified) setError(null)
          }}
          disabled={formBusy}
          error={fieldErrors.password}
          required
        />

        <StampButton
          type="submit"
          disabled={formBusy}
          className="w-full"
        >
          {loginSubmitting ? 'Entrando…' : 'Entrar'}
        </StampButton>

        <div className="border-t border-ecoar-teal/30" aria-hidden="true" />

        <GoogleAuthLink label="Entrar com Google" disabled={formBusy} />
      </form>
    </AuthCard>
  )
}
