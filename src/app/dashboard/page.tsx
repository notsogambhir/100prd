'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  Home,
  Building,
  UserCheck,
  ClipboardList
} from 'lucide-react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedProgram, setSelectedProgram] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    // Load saved selections
    const savedProgramId = localStorage.getItem('selectedProgramId')
    const savedBatchId = localStorage.getItem('selectedBatchId')
    if (savedProgramId) setSelectedProgram(savedProgramId)
    if (savedBatchId) setSelectedBatch(savedBatchId)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('selectedProgramId')
    localStorage.removeItem('selectedBatchId')
    signOut({ callbackUrl: '/auth/signin' })
  }

  const getNavigationItems = () => {
    const role = session?.user?.role
    const baseItems = [
      { icon: Home, label: 'Dashboard', href: '/dashboard' },
      { icon: Menu, label: 'Welcome Tab', href: '/welcome-tab' },
    ]

    if (role === 'Admin') {
      return [
        ...baseItems,
        { icon: Building, label: 'Academic Structure', href: '/admin/academic-structure' },
        { icon: UserCheck, label: 'User Management', href: '/admin/users' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
      ]
    }

    if (role === 'Department') {
      return [
        ...baseItems,
        { icon: UserCheck, label: 'Faculty Management', href: '/department/faculty' },
        { icon: Users, label: 'Student Management', href: '/department/students' },
      ]
    }

    if (role === 'PC') {
      return [
        ...baseItems,
        { icon: BookOpen, label: 'Courses', href: '/courses' },
        { icon: GraduationCap, label: 'Program Outcomes', href: '/program-outcomes' },
        { icon: Users, label: 'Teachers', href: '/teachers' },
        { icon: FileText, label: 'Reports', href: '/reports' },
      ]
    }

    if (role === 'Teacher') {
      return [
        ...baseItems,
        { icon: BookOpen, label: 'My Courses', href: '/teacher/courses' },
        { icon: ClipboardList, label: 'Assessments', href: '/teacher/assessments' },
        { icon: FileText, label: 'Reports', href: '/teacher/reports' },
      ]
    }

    return baseItems
  }

  const getDashboardStats = () => {
    const role = session?.user?.role
    
    if (role === 'Admin') {
      return [
        { title: 'Total Colleges', value: '12', icon: Building, color: 'bg-blue-500' },
        { title: 'Total Programs', value: '48', icon: BookOpen, color: 'bg-green-500' },
        { title: 'Total Users', value: '256', icon: Users, color: 'bg-purple-500' },
        { title: 'Active Courses', value: '189', icon: GraduationCap, color: 'bg-orange-500' },
      ]
    }

    if (role === 'PC') {
      return [
        { title: 'My Programs', value: '3', icon: BookOpen, color: 'bg-blue-500' },
        { title: 'Active Courses', value: '24', icon: GraduationCap, color: 'bg-green-500' },
        { title: 'Assigned Teachers', value: '18', icon: Users, color: 'bg-purple-500' },
        { title: 'Total Students', value: '420', icon: Users, color: 'bg-orange-500' },
      ]
    }

    if (role === 'Teacher') {
      return [
        { title: 'My Courses', value: '4', icon: BookOpen, color: 'bg-blue-500' },
        { title: 'Total Students', value: '120', icon: Users, color: 'bg-green-500' },
        { title: 'Pending Assessments', value: '2', icon: ClipboardList, color: 'bg-orange-500' },
        { title: 'Completed Assessments', value: '8', icon: FileText, color: 'bg-purple-500' },
      ]
    }

    return []
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const navigationItems = getNavigationItems()
  const dashboardStats = getDashboardStats()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">NBA OBE Portal</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div className="ml-4 lg:ml-0">
                  <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
                  <p className="text-sm text-gray-500">
                    Welcome back, {session.user?.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">{session.user?.role}</Badge>
                <Avatar>
                  <AvatarFallback>
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {session.user?.role === 'Admin' && 'System Overview'}
              {session.user?.role === 'PC' && 'Program Management'}
              {session.user?.role === 'Teacher' && 'Teaching Dashboard'}
              {session.user?.role === 'Department' && 'Department Overview'}
              {session.user?.role === 'University' && 'University View'}
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your educational outcomes and accreditation requirements
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks you might want to perform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {session.user?.role === 'Admin' && (
                  <>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/academic-structure')}>
                      <Building className="mr-2 h-4 w-4" />
                      Manage Academic Structure
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/users')}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Manage Users
                    </Button>
                  </>
                )}
                {session.user?.role === 'PC' && (
                  <>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/courses')}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Manage Courses
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/program-outcomes')}>
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Define Program Outcomes
                    </Button>
                  </>
                )}
                {session.user?.role === 'Teacher' && (
                  <>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/teacher/courses')}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      View My Courses
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/teacher/assessments')}>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Manage Assessments
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">New assessment created for CS101</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">Student marks uploaded for Math201</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">CO-PO mapping updated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}