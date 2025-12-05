'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import AuthCard from './AuthCard'
import { LogIn, Mail, Lock } from 'lucide-react'

interface LoginFormProps {
  onSwitchToRegister?: () => void
  onSuccess?: () => void
}

export default function LoginForm({ onSwitchToRegister, onSuccess }: LoginFormProps) {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

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
          <p className="text-sm text-ecoar-dark-600 dark:text-ecoar-light-900/60">
            Não tem uma conta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-ecoar-teal-600 dark:text-ecoar-teal-400/90 hover:text-ecoar-teal-700 dark:hover:text-ecoar-teal-400 font-medium transition-colors"
            >
              Cadastre-se
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

        <Input
          type="email"
          label="Email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          error={error && !email.trim() ? 'Email é obrigatório' : undefined}
        />

        <Input
          type="password"
          label="Senha"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          error={error && !password.trim() ? 'Senha é obrigatória' : undefined}
        />

        <Button
          type="submit"
          disabled={isLoading || !email.trim() || !password.trim()}
          leftIcon={LogIn}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthCard>
  )
}

