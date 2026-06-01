import { getDemoAccountById } from '@/lib/config'
import { signToken } from '@/lib/auth/jwt'

const LOCAL_PREFIX = 'local-demo-'

export async function createLocalDemoSession(accountId: string | undefined) {
  const account = getDemoAccountById(accountId)
  if (!account) {
    return { ok: false as const, status: 400, error: 'Conta de teste inválida' }
  }

  if (!process.env.JWT_SECRET?.trim()) {
    return {
      ok: false as const,
      status: 503,
      error:
        'Configure JWT_SECRET no arquivo .env.local (veja README). O login demo local precisa disso para gerar a sessão.',
    }
  }

  const userId = `${LOCAL_PREFIX}${account.id}`
  const user = {
    id: userId,
    email: account.email,
    fullName: account.fullName,
    username: account.username,
    createdAt: new Date().toISOString(),
  }

  try {
    const token = await signToken({ userId })
    return { ok: true as const, user, token }
  } catch {
    return {
      ok: false as const,
      status: 503,
      error: 'Não foi possível gerar o token de sessão. Verifique JWT_SECRET no .env.local.',
    }
  }
}
