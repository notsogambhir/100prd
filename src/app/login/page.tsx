'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    collegeId: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Demo colleges for selection
  const demoColleges = [
    { id: 'cmi334fc80000psgvici7ss5f', name: 'Engineering College' },
    { id: 'cmi334fca0001psgvaovlocam', name: 'Management College' }
  ]

  // Demo users
  const demoUsers = [
    { username: 'admin', role: 'Administrator', description: 'Full system access' },
    { username: 'dean', role: 'University', description: 'View-only access across all colleges' },
    { username: 'hod', role: 'Department Head', description: 'Manage faculty and students' },
    { username: 'pc', role: 'Program Co-ordinator', description: 'Manage curriculum and outcomes' },
    { username: 'teacher', role: 'Teacher', description: 'Manage courses and assessments' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* Login Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">NBA OBE Portal</CardTitle>
            <CardDescription className="text-center">
              Login to access the Outcome Based Education Management System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Select value={formData.collegeId} onValueChange={(value) => handleInputChange('collegeId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoColleges.map((college) => (
                      <SelectItem key={college.id} value={college.id}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'LOGIN'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Users Info */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Demo Accounts</CardTitle>
            <CardDescription>
              Use these accounts to explore the system. Password for all accounts: <strong>password</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoUsers.map((user, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.role}</p>
                      <p className="text-xs text-gray-500 mt-1">{user.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          username: user.username,
                          password: 'password',
                          collegeId: user.username === 'admin' || user.username === 'dean' ? '' : 'cmi334fc80000psgvici7ss5f'
                        })
                      }}
                    >
                      Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}