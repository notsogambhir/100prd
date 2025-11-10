'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.role === 'Admin' || session?.user?.role === 'University' || session?.user?.role === 'Department') {
      router.push('/dashboard')
    } else {
      router.push('/program-selection')
    }
  }, [status, session, router])

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
        <p className="text-gray-600 mt-2">Loading...</p>
      </div>
    </div>
  )
}