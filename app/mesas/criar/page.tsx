'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createTable } from '@/lib/storage/tablesApiService'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import { fadeInUp } from '@/lib/motionVariants'

export default function CriarMesaPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [nextSessionAt, setNextSessionAt] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Nome da mesa é obrigatório')
      return
    }
    setLoading(true)
    try {
      const table = await createTable({
        name: trimmedName,
        coverImageUrl: coverImageUrl.trim() || undefined,
        nextSessionAt: nextSessionAt.trim() || undefined,
        description: description.trim() || undefined,
      })
      router.push(`/mesas/${table.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar mesa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ecoar-light dark:bg-ecoar-dark-900">
      <motion.div className="max-w-lg mx-auto px-4 py-8" variants={fadeInUp} initial="hidden" animate="visible">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-ecoar-teal-600 dark:text-ecoar-teal-400 hover:underline mb-6 transition-colors duration-fast"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-display font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-2">Criar mesa</h1>
        <p className="text-sm text-slate-600 dark:text-ecoar-light-900/60 mb-6">
          Defina o nome, capa e data da próxima sessão. Você será o GM desta mesa.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}
          <Input
            label="Nome da mesa"
            placeholder="Ex: Campanha do Reinado"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <Input
            label="URL da foto de capa (opcional)"
            placeholder="https://..."
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            disabled={loading}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-ecoar-light-900/80 mb-1">
              Data da próxima sessão (opcional)
            </label>
            <input
              type="datetime-local"
              value={nextSessionAt}
              onChange={(e) => setNextSessionAt(e.target.value)}
              disabled={loading}
              className="input-field w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800 text-slate-900 dark:text-ecoar-light-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-ecoar-light-900/80 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="Breve descrição da campanha ou mesa"
              className="input-field w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800 text-slate-900 dark:text-ecoar-light-900 resize-none"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Criando...' : 'Criar mesa'}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
