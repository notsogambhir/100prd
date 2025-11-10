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
        router.push('/dashboard')
      } else {
        router.push('/program-selection')
      }
    }
  }, [mockSession, session, status, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        <img
          src="/logo.svg"
          alt="NBA OBE Portal"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">NBA OBE Portal</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}