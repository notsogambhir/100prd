'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useMockSession } from '@/lib/mock-session'

export default function Home() {
  const { data: session, status } = useSession()
  const mockSession = useMockSession()
  const router = useRouter()

  useEffect(() => {
    // Use mock session in preview environment, regular session otherwise
    const currentSession = mockSession.session || session
    const currentStatus = mockSession.loading ? 'loading' : status

    if (currentStatus === 'loading') return

    if (currentStatus === 'unauthenticated') {
      router.push('/auth/signin')
      } else if (currentSession?.user) {
      const role = currentSession.user.role
      if (role === 'Admin' || role === 'University' || role === 'Department') {
        router.push('/welcome')
      } else {
        router.push('/program-selection')
      }
    }
  }, [mockSession, session, status, router])
}