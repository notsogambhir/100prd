'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMockSession } from '@/hooks/use-mock-session'
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  FileText, 
  Target,
  TrendingUp,
  Award,
  Calendar,
  Settings,
  LogOut,
  Home,
  BarChart3,
  CheckCircle,
  Clock,
  UserCheck,
  ClipboardList,
  Building,
  ArrowRight,
  Star,
  Activity
} from 'lucide-react'

export default function Welcome() {
  const { session, isLoading, signOut } = useMockSession()
  const router = useRouter()

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800'
      case 'University': return 'bg-purple-100 text-purple-800'
      case 'Department': return 'bg-blue-100 text-blue-800'
      case 'PC': return 'bg-green-100 text-green-800'
      case 'Teacher': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case 'Admin':
        return {
          title: 'Welcome, System Administrator',
          subtitle: 'Manage the entire NBA OBE portal',
          description: 'You have full control over all system features, user management, and institutional settings.'
        }
      case 'University':
        return {
          title: 'Welcome, University Leadership',
          subtitle: 'View comprehensive institutional analytics',
          description: 'Monitor all colleges, programs, and high-level institutional metrics across the university.'
        }
      case 'Department':
        return {
          title: 'Welcome, Department Head',
          subtitle: 'Lead your academic department',
          description: 'Manage faculty, students, and oversee departmental operations and academic performance.'
        }
      case 'PC':
        return {
          title: 'Welcome, Program Coordinator',
          subtitle: 'Shape your program\'s success',
          description: 'Define learning outcomes, manage curriculum, and ensure program quality and accreditation compliance.'
        }
      case 'Teacher':
        return {
          title: 'Welcome, Educator',
          subtitle: 'Inspire and evaluate student learning',
          description: 'Create assessments, manage course content, and track student progress and attainment.'
        }
      default:
        return {
          title: 'Welcome to NBA OBE Portal',
          subtitle: 'Your gateway to educational excellence',
          description: 'Manage outcomes, assessments, and accreditation requirements efficiently.'
        }
    }
  }

  const getQuickActions = (role: string) => {
    switch (role) {
      case 'Admin':
        return [
          { icon: Building, label: 'Academic Structure', href: '/admin/academic-structure', description: 'Manage colleges, programs, and batches' },
          { icon: Users, label: 'User Management', href: '/admin/users', description: 'Create and manage user accounts' },
          { icon: Settings, label: 'System Settings', href: '/admin/settings', description: 'Configure system-wide settings' }
        ]
      case 'University':
        return [
          { icon: BarChart3, label: 'Analytics Dashboard', href: '/analytics', description: 'View institutional analytics' },
          { icon: FileText, label: 'Generate Reports', href: '/reports', description: 'Create accreditation reports' },
          { icon: TrendingUp, label: 'Performance Metrics', href: '/analytics', description: 'Monitor performance trends' }
        ]
      case 'Department':
        return [
          { icon: UserCheck, label: 'Faculty Management', href: '/department/faculty', description: 'Manage faculty assignments' },
          { icon: Users, label: 'Student Management', href: '/department/students', description: 'Oversee student records' },
          { icon: ClipboardList, label: 'Department Reports', href: '/reports', description: 'View departmental reports' }
        ]
      case 'PC':
        return [
          { icon: BookOpen, label: 'Course Management', href: '/courses', description: 'Create and manage courses' },
          { icon: Target, label: 'Program Outcomes', href: '/program-outcomes', description: 'Define learning outcomes' },
          { icon: FileText, label: 'Assessment Reports', href: '/reports', description: 'Generate attainment reports' }
        ]
      case 'Teacher':
        return [
          { icon: BookOpen, label: 'My Courses', href: '/teacher/courses', description: 'View assigned courses' },
          { icon: ClipboardList, label: 'My Assessments', href: '/teacher/assessments', description: 'Manage course assessments' },
          { icon: FileText, label: 'Grade Reports', href: '/teacher/reports', description: 'View student performance' }
        ]
      default:
        return []
    }
  }

  const getRecentActivity = (role: string) => {
    switch (role) {
      case 'Admin':
        return [
          { icon: Users, text: 'New user account created', time: '2 hours ago' },
          { icon: Building, text: 'Engineering College program added', time: '5 hours ago' },
          { icon: Settings, text: 'System configuration updated', time: '1 day ago' }
        ]
      case 'University':
        return [
          { icon: BarChart3, text: 'Monthly performance report generated', time: '3 hours ago' },
          { icon: TrendingUp, text: 'University-wide attainment improved by 15%', time: '1 day ago' },
          { icon: FileText, text: 'Accreditation report submitted', time: '2 days ago' }
        ]
      case 'Department':
        return [
          { icon: UserCheck, text: '3 new faculty members onboarded', time: '4 hours ago' },
          { icon: Users, text: 'Student enrollment completed', time: '1 day ago' },
          { icon: Award, text: 'Department excellence award received', time: '3 days ago' }
        ]
      case 'PC':
        return [
          { icon: Target, text: 'CO-PO mapping completed for CS101', time: '2 hours ago' },
          { icon: BookOpen, text: 'New course approved', time: '5 hours ago' },
          { icon: CheckCircle, text: 'Program outcomes review passed', time: '1 day ago' }
        ]
      case 'Teacher':
        return [
          { icon: ClipboardList, text: 'Mid-term assessment created', time: '3 hours ago' },
          { icon: Users, text: 'Student marks uploaded', time: '6 hours ago' },
          { icon: FileText, text: 'Course attainment report generated', time: '1 day ago' }
        ]
      default:
        return []
    }
  }

  const getSystemStats = (role: string) => {
    switch (role) {
      case 'Admin':
        return [
          { icon: Building, label: '12 Colleges', value: '+2', color: 'text-green-600' },
          { icon: BookOpen, label: '48 Programs', value: '+5', color: 'text-green-600' },
          { icon: Users, label: '256 Users', value: '+12', color: 'text-green-600' },
          { icon: GraduationCap, label: '189 Active Courses', value: '+8', color: 'text-green-600' }
        ]
      case 'University':
        return [
          { icon: Building, label: '8 Institutions', value: 'All', color: 'text-blue-600' },
          { icon: Users, label: '12,450 Students', value: '+2.5%', color: 'text-blue-600' },
          { icon: Award, label: '95% Accreditation Rate', value: '+3%', color: 'text-green-600' }
        ]
      case 'Department':
        return [
          { icon: UserCheck, label: '45 Faculty Members', value: '+3', color: 'text-green-600' },
          { icon: Users, label: '1,200 Students', value: '+5%', color: 'text-green-600' },
          { icon: Target, label: '15 Active Programs', value: '+1', color: 'text-green-600' }
        ]
      case 'PC':
        return [
          { icon: BookOpen, label: '8 Managed Courses', value: 'All', color: 'text-blue-600' },
          { icon: Target, label: '24 Course Outcomes', value: '+2', color: 'text-green-600' },
          { icon: Users, label: '420 Students', value: '+8%', color: 'text-green-600' }
        ]
      case 'Teacher':
        return [
          { icon: BookOpen, label: '4 Assigned Courses', value: 'All', color: 'text-blue-600' },
          { icon: ClipboardList, label: '12 Assessments', value: '+2', color: 'text-green-600' },
          { icon: Users, label: '120 Total Students', value: '+15%', color: 'text-green-600' }
        ]
      default:
        return []
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">Please sign in to access the portal.</p>
          <Button 
            className="mt-4"
            onClick={() => router.push('/auth/signin')}
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    )
  }

  const welcomeInfo = getWelcomeMessage(session.user.role)
  const quickActions = getQuickActions(session.user.role)
  const recentActivity = getRecentActivity(session.user.role)
  const systemStats = getSystemStats(session.user.role)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{welcomeInfo.title}</h1>
            <p className="text-lg text-gray-600">{welcomeInfo.subtitle}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={getRoleColor(session.user.role)}>
              {session.user.role}
            </Badge>
            <div className="text-sm text-gray-500">
              {session.user.name}
            </div>
            <Button variant="outline" onClick={() => {
              console.log('Sign out clicked')
              signOut()
            }}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <Card className="border-l-4 border-blue-500 bg-blue-50">
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">{welcomeInfo.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                onClick={() => {
                  console.log('Card clicked:', action.href)
                  router.push(action.href)
                }}
              >
                <div className="flex items-center text-lg mb-3">
                  <action.icon className="h-6 w-6 mr-3 text-blue-600" />
                  {action.label}
                </div>
                <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                <button 
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Button clicked:', action.href)
                    router.push(action.href)
                  }}
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2 inline" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* System Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                System Overview
              </CardTitle>
              <CardDescription>
                Key metrics and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <stat.icon className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{stat.label}</p>
                        <p className="text-sm text-gray-500">Current semester</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                      <span className={`text-sm ml-2 ${stat.color}`}>
                        {stat.value.includes('+') ? stat.value : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates and actions in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <activity.icon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help & Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              Help & Resources
            </CardTitle>
            <CardDescription>
              Get assistance and learn more about the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start">
                <FileText className="h-4 w-4 mr-2" />
                User Guide
              </Button>
              <Button variant="outline" className="justify-start">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
              <Button variant="outline" className="justify-start">
                <Award className="h-4 w-4 mr-2" />
                NBA Guidelines
              </Button>
              <Button variant="outline" className="justify-start">
                <Star className="h-4 w-4 mr-2" />
                Support Center
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}