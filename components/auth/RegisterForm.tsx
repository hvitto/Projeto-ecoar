'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import AuthCard from './AuthCard'
import { UserPlus, Mail, Lock, User, AtSign } from 'lucide-react'

interface RegisterFormProps {
  onSwitchToLogin?: () => void
  onSuccess?: () => void
}

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
  const { register, isLoading } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) return 'Nome é obrigatório'
        if (value.trim().length > 50) return 'Nome deve ter no máximo 50 caracteres'
        return null
      case 'lastName':
        if (!value.trim()) return 'Sobrenome é obrigatório'
        if (value.trim().length > 50) return 'Sobrenome deve ter no máximo 50 caracteres'
        return null
      case 'username':
        if (!value.trim()) return 'Nome de usuário é obrigatório'
        const usernameTrimmed = value.trim()
        if (usernameTrimmed.length < 3) return 'Nome de usuário deve ter no mínimo 3 caracteres'
        if (usernameTrimmed.length > 20) return 'Nome de usuário deve ter no máximo 20 caracteres'
        if (!/^[a-zA-Z0-9_-]+$/.test(usernameTrimmed)) return 'Use apenas letras, números, _ e -'
        if (usernameTrimmed.startsWith('-') || usernameTrimmed.startsWith('_') || usernameTrimmed.endsWith('-') || usernameTrimmed.endsWith('_')) {
          return 'Nome de usuário não pode começar ou terminar com - ou _'
        }
        return null
      case 'email':
        if (!value.trim()) return 'Email é obrigatório'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Email inválido'
        return null
      case 'password':
        if (!value) return 'Senha é obrigatória'
        if (value.length < 6) return 'Senha deve ter no mínimo 6 caracteres'
        return null
      case 'confirmPassword':
        if (!value) return 'Confirmação de senha é obrigatória'
        if (value !== password) return 'As senhas não coincidem'
        return null
      default:
        return null
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setSuccess(false)
    setSuccessMessage(null)

    // Validações de todos os campos
    const errors: Record<string, string> = {}
    
    const firstNameError = validateField('firstName', firstName)
    if (firstNameError) errors.firstName = firstNameError
    const lastNameError = validateField('lastName', lastName)
    if (lastNameError) errors.lastName = lastNameError
    
    const usernameError = validateField('username', username)
    if (usernameError) errors.username = usernameError
    
    const emailError = validateField('email', email)
    if (emailError) errors.email = emailError
    
    const passwordError = validateField('password', password)
    if (passwordError) errors.password = passwordError
    
    const confirmPasswordError = validateField('confirmPassword', confirmPassword)
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Por favor, corrija os erros nos campos')
      return
    }

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
    const result = await register(
      email.trim(),
      password,
      fullName,
      username.trim()
    )

    if (result.success) {
      setSuccess(true)
      if (result.message) setSuccessMessage(result.message)
      if (result.user) {
        if (onSuccess) setTimeout(() => onSuccess(), 1000)
      }
    } else {
      setError(result.error || 'Erro ao cadastrar')
    }
  }

  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

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
      subtitle="Cadastre-se para começar a criar seus personagens"
      footer={
        <div className="text-center">
          <p className="text-sm text-ecoar-dark-600 dark:text-ecoar-light-900/60">
            Já tem uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-ecoar-teal-600 dark:text-ecoar-teal-400/90 hover:text-ecoar-teal-700 dark:hover:text-ecoar-teal-400 font-medium transition-colors"
            >
              Entrar
            </button>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-ecoar-teal-100/80 dark:bg-ecoar-teal/10 border border-ecoar-teal-300/50 dark:border-ecoar-teal/30 rounded-lg text-sm text-ecoar-teal-700 dark:text-ecoar-teal-400/90 space-y-2"
          >
            {successMessage ? (
              <p>{successMessage}</p>
            ) : (
              <p>Enviamos um email de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.</p>
            )}
            <p className="text-ecoar-dark-600 dark:text-ecoar-light-900/70">Não recebeu? Verifique o spam ou</p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="text-ecoar-teal-600 dark:text-ecoar-teal-400 font-medium hover:underline"
            >
              {resendLoading ? 'Enviando...' : 'Reenviar email'}
            </button>
            {resendMessage && <p className="text-xs mt-1">{resendMessage}</p>}
          </motion.div>
        )}

        <Input
          type="text"
          label="Nome"
          placeholder="Seu nome"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value)
            if (fieldErrors.firstName) {
              setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors.firstName
                return newErrors
              })
            }
          }}
          disabled={isLoading || success}
          error={fieldErrors.firstName}
        />

        <Input
          type="text"
          label="Sobrenome"
          placeholder="Seu sobrenome"
          value={lastName}
          onChange={(e) => {
            setLastName(e.target.value)
            if (fieldErrors.lastName) {
              setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors.lastName
                return newErrors
              })
            }
          }}
          disabled={isLoading || success}
          error={fieldErrors.lastName}
        />

        <Input
          type="text"
          label="Nome de Usuário"
          placeholder="nome_usuario"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            if (fieldErrors.username) {
              setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors.username
                return newErrors
              })
            }
          }}
          disabled={isLoading || success}
          error={fieldErrors.username}
          helperText="3-20 caracteres: letras, números, _ e -"
        />

        <Input
          type="email"
          label="Email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (fieldErrors.email) {
              setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors.email
                return newErrors
              })
            }
          }}
          disabled={isLoading || success}
          error={fieldErrors.email}
        />

        <Input
          type="password"
          label="Senha"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (fieldErrors.password || fieldErrors.confirmPassword) {
              setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors.password
                delete newErrors.confirmPassword
                return newErrors
              })
            }
          }}
          disabled={isLoading || success}
          error={fieldErrors.password}
          helperText="Mínimo de 6 caracteres"
        />

        <Input
          type="password"
          label="Confirmar Senha"
          placeholder="Digite a senha novamente"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (fieldErrors.confirmPassword) {
              setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors.confirmPassword
                return newErrors
              })
            }
          }}
          disabled={isLoading || success}
          error={fieldErrors.confirmPassword}
        />

        <Button
          type="submit"
          disabled={isLoading || success || !firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
          leftIcon={UserPlus}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Criando conta...' : success ? 'Conta criada!' : 'Criar conta'}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ecoar-dark-200 dark:border-ecoar-light-900/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-ecoar-light dark:bg-ecoar-dark-900 text-ecoar-dark-500 dark:text-ecoar-light-900/60">ou</span>
          </div>
        </div>

        <a
          href={typeof window !== 'undefined' ? `${window.location.origin}/api/auth/google` : '/api/auth/google'}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border border-ecoar-dark-200 dark:border-ecoar-light-900/30 bg-white dark:bg-ecoar-dark-800 text-ecoar-dark-900 dark:text-ecoar-light-900 hover:bg-ecoar-dark-50 dark:hover:bg-ecoar-dark-700 transition-colors font-medium text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com Google
        </a>
      </form>
    </AuthCard>
  )
}

