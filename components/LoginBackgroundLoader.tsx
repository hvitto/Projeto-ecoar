'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const LoginBackground = dynamic(() => import('@/components/LoginBackground'), {
  ssr: false,
})

export default function LoginBackgroundLoader() {
  const pathname = usePathname()
  if (pathname !== '/') return null
  return <LoginBackground />
}
