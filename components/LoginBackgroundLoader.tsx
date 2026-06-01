'use client'

import dynamic from 'next/dynamic'

const LoginBackground = dynamic(() => import('@/components/LoginBackground'), {
  ssr: false,
})

export default function LoginBackgroundLoader() {
  return <LoginBackground />
}
