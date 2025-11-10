'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface MockSession {
  user: {
    id: string
    email: string
    name: string
    role: string
    collegeId: string
    status: string
  }
  expires: string
}

export function useMockSession() {
  const [session, setSession] = useState<MockSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const router = useRouter()

  useEffect(() => {
    // Simple session creation for demo
    const createDemoSession = () => {
      const demoSession: MockSession = {
        user: {
          id: 'demo-user-id',
          email: 'admin@obe.com',
          name: 'Admin User',
          role: 'Admin',
          collegeId: 'college-1',
          status: 'Active'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
      
      localStorage.setItem('mock-session', JSON.stringify(demoSession))
      setSession(demoSession)
      setStatus('authenticated')
      setIsLoading(false)
    }

    // Try to get existing session or create demo session
    try {
      const existingSession = localStorage.getItem('mock-session')
      if (existingSession) {
        const parsedSession = JSON.parse(existingSession)
        setSession(parsedSession)
        setStatus('authenticated')
        setIsLoading(false)
      } else {
        // Create demo session immediately
        createDemoSession()
      }
    } catch (error) {
      console.error('Session error:', error)
      createDemoSession()
    }
  }, [router])

  const signOut = () => {
    localStorage.removeItem('mock-session')
    localStorage.removeItem('selectedProgramId')
    localStorage.removeItem('selectedBatchId')
    setSession(null)
    setStatus('unauthenticated')
    router.push('/auth/signin')
  }

  return {
    session,
    status,
    isLoading,
    signOut
  }
}