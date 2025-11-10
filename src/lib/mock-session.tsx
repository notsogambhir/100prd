'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface MockUser {
  id: string
  email: string
  name: string
  role: string
  collegeId: string | null
  status: string
}

interface MockSession {
  user: MockUser | null
  expires: Date | null
}

const MockSessionContext = createContext<{
  session: MockSession | null
  loading: boolean
}>({
  session: null,
  loading: true
})

export function MockSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MockSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if we're in Z.ai preview environment
    const isPreviewEnvironment = typeof window !== 'undefined' && 
      (window.location.hostname.includes('preview-chat-') || window.location.hostname.includes('space.z.ai'))

    if (isPreviewEnvironment) {
      // Try to get mock session from localStorage
      const mockSessionData = localStorage.getItem('mock-session')
      
      if (mockSessionData) {
        try {
          const parsedSession = JSON.parse(mockSessionData)
          // Check if session is still valid (not expired)
          if (new Date(parsedSession.expires) > new Date()) {
            setSession(parsedSession)
          } else {
            // Clear expired session
            localStorage.removeItem('mock-session')
            setSession(null)
          }
        } catch (error) {
          console.error('Failed to parse mock session:', error)
          setSession(null)
        }
      }
      setLoading(false)
    } else {
      // Not in preview environment, no mock session
      setLoading(false)
    }
  }, [])

  return (
    <MockSessionContext.Provider value={{ session, loading }}>
      {children}
    </MockSessionContext.Provider>
  )
}

export function useMockSession() {
  const context = useContext(MockSessionContext)
  if (!context) {
    throw new Error('useMockSession must be used within a MockSessionProvider')
  }
  return context
}