'use client'

import { useState, useEffect, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { joinTable } from '@/lib/storage/tablesApiService'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import { fadeInUp } from '@/lib/motionVariants'

export default function EntrarMesaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState(false)

  const tokenFromUrl = searchParams.get('token')

  useEffect(() => {
    if (!tokenFromUrl) return
    setJoining(true)
    setError(null)
    joinTable({ token: tokenFromUrl })
      .then((result) => {
        router.replace(`/mesas/${result.tableId}`)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro ao entrar na mesa')
        setJoining(false)
      })
  }, [tokenFromUrl, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setError('Digite o código da mesa')
      return
    }
    setLoading(true)
    try {
      const result = await joinTable({ code: trimmed })
      router.push(`/mesas/${result.tableId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar na mesa')
    } finally {
      setLoading(false)
    }
  }

  if (joining) {
    return (
      <div className="h-full min-h-0 flex flex-col">
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="text-slate-600 dark:text-ecoar-light-900/60">Entrando na mesa...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <motion.div className="max-w-lg mx-auto px-3 py-6 sm:py-8" variants={fadeInUp} initial="hidden" animate="visible">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-ecoar-teal-600 dark:text-ecoar-teal-400 hover:underline mb-6 transition-colors duration-fast"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-2">Entrar em uma mesa</h1>
        <p className="text-sm text-slate-600 dark:text-ecoar-light-900/60 mb-6">
          Cole o link de convite que o GM enviou ou digite o código de 6 caracteres.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}
          <Input
            label="Código da mesa"
            placeholder="Ex: ABC12X"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={loading}
            maxLength={6}
          />
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        </motion.div>
      </div>
    </div>
  )
}
