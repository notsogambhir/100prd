'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function SignIn() {
  const [email, setEmail] = useState('admin@obe.com')
  const [password, setPassword] = useState('password')
  const [collegeId, setCollegeId] = useState('college-1')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Check if we're in Z.ai preview environment
  const isPreviewEnvironment = typeof window !== 'undefined' && 
    (window.location.hostname.includes('preview-chat-') || window.location.hostname.includes('space.z.ai'))

  // Demo users for demonstration
  const demoUsers = [
    { email: 'admin@obe.com', role: 'Admin', description: 'System Administrator' },
    { email: 'dean@obe.com', role: 'University', description: 'University Level View' },
    { email: 'hod@obe.com', role: 'Department', description: 'Department Head' },
    { email: 'pc@obe.com', role: 'PC', description: 'Program Coordinator' },
    { email: 'teacher@obe.com', role: 'Teacher', description: 'Teacher' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // In preview environment, simulate successful login
      if (isPreviewEnvironment) {
        // Simulate authentication success
        const mockSession = {
          user: {
            id: 'demo-user-id',
            email: email,
            name: demoUsers.find(u => u.email === email)?.name || 'Demo User',
            role: demoUsers.find(u => u.email === email)?.role || 'Teacher',
            collegeId: collegeId,
            status: 'Active'
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        }

        // Store mock session in localStorage
        localStorage.setItem('mock-session', JSON.stringify(mockSession))
        
        // Redirect based on role
        const role = mockSession.user.role
        if (role === 'Admin' || role === 'University' || role === 'Department') {
          router.push('/dashboard')
        } else {
          router.push('/program-selection')
        }
        return
      }

      // For local development, attempt real authentication
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, collegeId })
      })

      if (response.ok) {
        const result = await response.json()
        if (result) {
          const role = demoUsers.find(u => u.email === email)?.role || 'Teacher'
          if (role === 'Admin' || role === 'University' || role === 'Department') {
            router.push('/dashboard')
          } else {
            router.push('/program-selection')
          }
        }
      } else {
        setError('Invalid credentials')
      }
    } catch (error) {
      setError('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password')
    setCollegeId('college-1')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            NBA OBE Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isPreviewEnvironment ? 'Preview Environment - Demo Mode' : 'Sign in to your account'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              {isPreviewEnvironment ? 'Select any demo account below' : 'Enter your credentials to access the portal'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {!isPreviewEnvironment && (
                <div className="space-y-2">
                  <label htmlFor="college" className="text-sm font-medium text-gray-700">College (Optional)</label>
                  <Select value={collegeId} onValueChange={setCollegeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your college" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No College Selection</SelectItem>
                      <SelectItem value="college-1">Engineering College</SelectItem>
                      <SelectItem value="college-2">Management College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPreviewEnvironment ? 'Continue' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Accounts</CardTitle>
            <CardDescription className="text-xs">
              Click on any demo account to auto-fill credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {demoUsers.map((user) => (
                <div
                  key={user.email}
                  className="p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleDemoLogin(user.email)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.description}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Password: password (for all demo accounts)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}