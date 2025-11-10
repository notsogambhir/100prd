'use client'

import { SessionProvider } from 'next-auth/react'
import { MockSessionProvider } from '@/lib/mock-session'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Check if we're in Z.ai preview environment
  const isPreviewEnvironment = typeof window !== 'undefined' && 
    (window.location.hostname.includes('preview-chat-') || window.location.hostname.includes('space.z.ai'))

  if (isPreviewEnvironment) {
    return <MockSessionProvider>{children}</MockSessionProvider>
  } else {
    return <SessionProvider>{children}</SessionProvider>
  }
}