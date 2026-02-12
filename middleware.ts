import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Origens permitidas para CORS (frontend em domínio diferente da API)
const DEFAULT_ORIGINS = 'https://ecoar.dev'
const ALLOWED_ORIGINS = (
  process.env.CORS_ORIGIN || DEFAULT_ORIGINS
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

function getCorsHeaders(origin: string | null) {
  const allowOrigin =
    origin && ALLOWED_ORIGINS.includes(origin)
      ? origin
      : ALLOWED_ORIGINS[0] || '*'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')

  // Preflight: responder OPTIONS com headers CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    })
  }

  const response = NextResponse.next()
  Object.entries(getCorsHeaders(origin)).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export const config = {
  matcher: '/api/:path*',
}
