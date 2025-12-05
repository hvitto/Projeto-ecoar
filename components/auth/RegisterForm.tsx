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
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Nome completo é obrigatório'
        if (value.trim().length < 2) return 'Nome completo deve ter no mínimo 2 caracteres'
        if (value.trim().length > 100) return 'Nome completo deve ter no máximo 100 caracteres'
        return null
      case 'username':
        if (!value.trim()) return 'Nome de usuário é obrigatório'
        const usernameTrimmed = value.trim().toLowerCase()
        if (usernameTrimmed.length < 3) return 'Nome de usuário deve ter no mínimo 3 caracteres'
        if (usernameTrimmed.length > 20) return 'Nome de usuário deve ter no máximo 20 caracteres'
        if (!/^[a-z0-9_-]+$/.test(usernameTrimmed)) return 'Use apenas letras minúsculas, números, _ e -'
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

    // Validações de todos os campos
    const errors: Record<string, string> = {}
    
    const fullNameError = validateField('fullName', fullName)
    if (fullNameError) errors.fullName = fullNameError
    
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

    const result = await register(
      email.trim(),
      password,
      fullName.trim(),
      username.trim().toLowerCase()
    )

    if (result.success) {
      setSuccess(true)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1000)
      }
    } else {
      setError(result.error || 'Erro ao cadastrar')
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
            className="p-3 bg-ecoar-teal-100/80 dark:bg-ecoar-teal/10 border border-ecoar-teal-300/50 dark:border-ecoar-teal/30 rounded-lg text-sm text-ecoar-teal-700 dark:text-ecoar-teal-400/90"
          >
            Conta criada com sucesso! Redirecionando...
          </motion.div>
        )}

        <Input
          type="text"
          label="Nome Completo"
          placeholder="Seu nome completo"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value)
            if (fieldErrors.fullName) {
              setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors.fullName
                return newErrors
              })
            }
          }}
          disabled={isLoading || success}
          error={fieldErrors.fullName}
          helperText="Seu nome completo para identificação"
        />

        <Input
          type="text"
          label="Nome de Usuário"
          placeholder="nome_usuario"
          value={username}
          onChange={(e) => {
            // Converter para minúsculas automaticamente
            const value = e.target.value.toLowerCase()
            setUsername(value)
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
          disabled={isLoading || success || !fullName.trim() || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
          leftIcon={UserPlus}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Criando conta...' : success ? 'Conta criada!' : 'Criar conta'}
        </Button>
      </form>
    </AuthCard>
  )
}

