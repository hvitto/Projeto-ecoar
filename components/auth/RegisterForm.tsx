'use client'

import { useState, FormEvent } from 'react'
import { useAuth } from '@/shared/contexts/AuthContext'
import { Input } from '@/shared/components/ui/Input'
import StampButton from '@/components/beyond/StampButton'
import AuthCard from './AuthCard'
import GoogleAuthLink, { suggestUsernameFromEmail } from './GoogleAuthLink'

interface RegisterFormProps {
  onSwitchToLogin?: () => void
  onSuccess?: () => void
}

type Step = 1 | 2

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
  const { register, isLoading } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [emailPathOpen, setEmailPathOpen] = useState(false)
  const [usernameOpen, setUsernameOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const clearFieldError = (field: string) => {
    if (!fieldErrors[field]) return
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Nome é obrigatório'
        if (value.trim().length < 2) return 'Nome deve ter no mínimo 2 caracteres'
        if (value.trim().length > 100) return 'Nome deve ter no máximo 100 caracteres'
        return null
      case 'username': {
        if (!value.trim()) return 'Nome de usuário é obrigatório'
        const usernameTrimmed = value.trim()
        if (usernameTrimmed.length < 3) return 'Mínimo 3 caracteres'
        if (usernameTrimmed.length > 20) return 'Máximo 20 caracteres'
        if (!/^[a-zA-Z0-9_-]+$/.test(usernameTrimmed)) return 'Use apenas letras, números, _ e -'
        if (
          usernameTrimmed.startsWith('-') ||
          usernameTrimmed.startsWith('_') ||
          usernameTrimmed.endsWith('-') ||
          usernameTrimmed.endsWith('_')
        ) {
          return 'Não pode começar ou terminar com - ou _'
        }
        return null
      }
      case 'email':
        if (!value.trim()) return 'Email é obrigatório'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Email inválido'
        return null
      case 'password':
        if (!value) return 'Senha é obrigatória'
        if (value.length < 6) return 'Mínimo 6 caracteres'
        return null
      default:
        return null
    }
  }

  const validateStep1 = (): boolean => {
    if (!emailPathOpen) {
      setError('Escolha Google ou abra o cadastro por email')
      return false
    }
    const errors: Record<string, string> = {}
    const emailError = validateField('email', email)
    if (emailError) errors.email = emailError
    const passwordError = validateField('password', password)
    if (passwordError) errors.password = passwordError
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setError('Corrija email e senha para continuar')
      return false
    }
    setError(null)
    return true
  }

  const goNext = () => {
    if (!validateStep1()) return
    const suggested = suggestUsernameFromEmail(email.trim())
    setUsername((prev) => (prev.trim() ? prev : suggested))
    setStep(2)
  }

  const goBack = () => {
    setError(null)
    setFieldErrors({})
    setStep(1)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      goNext()
      return
    }

    setError(null)
    setSuccess(false)
    setSuccessMessage(null)

    const resolvedUsername = username.trim() || suggestUsernameFromEmail(email.trim())
    const errors: Record<string, string> = {}
    const fullNameError = validateField('fullName', fullName)
    if (fullNameError) errors.fullName = fullNameError
    const usernameError = validateField('username', resolvedUsername)
    if (usernameError) errors.username = usernameError

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      if (errors.username) setUsernameOpen(true)
      setError('Corrija os campos para criar a conta')
      return
    }

    try {
      const result = await register(email.trim(), password, fullName.trim(), resolvedUsername)

      if (result.success) {
        setSuccess(true)
        if (result.message) setSuccessMessage(result.message)
        if (result.user) {
          if (onSuccess) setTimeout(() => onSuccess(), 1000)
        }
      } else {
        const msg = result.error || 'Não foi possível criar a conta. Tente de novo.'
        setError(msg)
        if (/usuário|username/i.test(msg)) setUsernameOpen(true)
      }
    } catch {
      setError('Falha de conexão. Verifique a rede e tente de novo.')
    }
  }

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
      setResendMessage(data.message || (data.success ? 'Email reenviado.' : data.error || 'Erro ao reenviar.'))
    } catch {
      setResendMessage('Erro ao reenviar. Tente novamente.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <AuthCard
      title="Criar conta"
      subtitle={step === 2 ? 'Como você quer ser chamado?' : undefined}
      footer={
        <div className="text-center">
          <p className="text-sm text-ecoar-dark-600 dark:text-[#c5c8ce]">
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              disabled={isLoading}
              className="text-ecoar-dark-900 dark:text-ecoar-light-900 hover:underline font-medium transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal"
            >
              Entrar
            </button>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isLoading} noValidate>
        {!success && (
          <p
            className="text-xs uppercase tracking-[0.14em] text-ecoar-teal-700 dark:text-ecoar-teal"
            aria-live="polite"
          >
            {step}/2
          </p>
        )}

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="p-3 bg-red-500/10 border border-red-500/40 rounded-none text-sm text-red-700 dark:text-red-300 break-words"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            aria-live="polite"
            className="p-4 bg-ecoar-teal-100/80 dark:bg-ecoar-teal/10 border border-ecoar-teal-300/50 dark:border-ecoar-teal/30 rounded-none text-sm text-ecoar-teal-700 dark:text-ecoar-teal-400/90 space-y-2 break-words"
          >
            {successMessage ? (
              <p>{successMessage}</p>
            ) : (
              <p>
                Enviamos um email de confirmação para <strong>{email}</strong>. Clique no link para
                ativar sua conta.
              </p>
            )}
            <p className="text-ecoar-dark-600 dark:text-ecoar-light-900/70">Não recebeu? Verifique o spam ou</p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="text-ecoar-teal-600 dark:text-ecoar-teal-400 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? 'Enviando verificação…' : 'Reenviar email'}
            </button>
            {resendMessage && <p className="text-xs mt-1">{resendMessage}</p>}
          </div>
        )}

        {!success && step === 1 && (
          <>
            <GoogleAuthLink label="Continuar com Google" />

            {!emailPathOpen ? (
              <button
                type="button"
                onClick={() => {
                  setEmailPathOpen(true)
                  setError(null)
                }}
                className="w-full min-h-[44px] text-xs uppercase tracking-[0.12em] text-ecoar-teal-800 dark:text-ecoar-teal border border-ecoar-teal/40 hover:bg-ecoar-teal/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal"
              >
                Usar email
              </button>
            ) : (
              <div className="space-y-4 border-t border-ecoar-teal/30 pt-4">
                <Input
                  id="auth-register-email"
                  type="email"
                  label="EMAIL"
                  name="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearFieldError('email')
                  }}
                  disabled={isLoading}
                  error={fieldErrors.email}
                />

                <Input
                  id="auth-register-password"
                  type="password"
                  label="SENHA"
                  name="new-password"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    clearFieldError('password')
                  }}
                  disabled={isLoading}
                  error={fieldErrors.password}
                />

                <StampButton type="submit" disabled={isLoading} className="w-full">
                  Continuar na mesa
                </StampButton>

                <button
                  type="button"
                  onClick={() => {
                    setEmailPathOpen(false)
                    setError(null)
                    setFieldErrors({})
                  }}
                  className="w-full text-xs uppercase tracking-[0.12em] text-ecoar-dark-600 dark:text-[#c5c8ce] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal"
                >
                  Entrar com Google
                </button>
              </div>
            )}
          </>
        )}

        {!success && step === 2 && (
          <>
            <Input
              id="auth-register-full-name"
              type="text"
              label="INSIRA SEU NOME"
              name="name"
              autoComplete="name"
              placeholder="ex: Leonardo Gulag"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                clearFieldError('fullName')
              }}
              disabled={isLoading}
              error={fieldErrors.fullName}
            />

            {!usernameOpen ? (
              <div className="space-y-1">
                <p className="text-sm text-ecoar-dark-500 dark:text-[#adb5bd] break-words">
                  Apelido:{' '}
                  <span className="text-ecoar-dark-900 dark:text-ecoar-light-900">
                    {username || suggestUsernameFromEmail(email)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setUsernameOpen(true)}
                  className="text-xs uppercase tracking-[0.12em] text-ecoar-teal-700 dark:text-ecoar-teal hover:underline"
                >
                  Alterar apelido
                </button>
              </div>
            ) : (
              <Input
                id="auth-register-username"
                type="text"
                label="USUÁRIO"
                name="username"
                autoComplete="username"
                placeholder="Nome de usuário"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  clearFieldError('username')
                }}
                disabled={isLoading}
                error={fieldErrors.username}
                helperText="3-20 · letras, números, _ e -"
              />
            )}

            <div className="space-y-1.5">
              <StampButton
                type="submit"
                disabled={isLoading}
                className="w-full"
                aria-describedby={isLoading ? 'auth-register-status' : undefined}
              >
                {isLoading ? 'Preparando lugar…' : 'Entrar na mesa'}
              </StampButton>
              {isLoading && (
                <p
                  id="auth-register-status"
                  role="status"
                  aria-live="polite"
                  className="text-xs uppercase tracking-[0.14em] text-ecoar-teal-700 dark:text-ecoar-teal"
                >
                  MESA · PREPARANDO LUGAR
                </p>
              )}
            </div>

            <StampButton
              type="button"
              tone="ghost"
              onClick={goBack}
              disabled={isLoading}
              className="w-full"
            >
              Voltar
            </StampButton>
          </>
        )}
      </form>
    </AuthCard>
  )
}
