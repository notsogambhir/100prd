'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Users, 
  Target,
  ClipboardList,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  Loader2
} from 'lucide-react'

interface Course {
  id: string
  code: string
  name: string
  description?: string
  credits: number
  status: 'Future' | 'Active' | 'Completed'
  program: {
    name: string
    code: string
  }
  batch: {
    name: string
    startYear: number
    endYear: number
  }
  section?: {
    name: string
  }
  cos: Array<{
    id: string
    code: string
    description: string
  }>
  assessments: Array<{
    id: string
    name: string
    type: string
  }>
  enrollments: Array<{
    id: string
  }>
}

export default function TeacherCourses() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchTeacherCourses()
    }
  }, [session])

  const fetchTeacherCourses = async () => {
    try {
      const response = await fetch(`/api/courses?teacherId=${session?.user?.id}`)
      if (response.ok) {
        const coursesData = await response.json()
        setCourses(coursesData)
      }
    } catch (error) {
      console.error('Failed to fetch teacher courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-blue-100 text-blue-800'
      case 'Future': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-3 w-3" />
      case 'Completed': return <Target className="h-3 w-3" />
      case 'Future': return <Clock className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== 'Teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="mt-2 text-gray-600">
            Manage your assigned courses and track student progress
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.filter(c => c.status === 'Active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.reduce((sum, course) => sum + course.enrollments.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-500">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Assessments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.reduce((sum, course) => sum + course.assessments.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {course.code} • {course.credits} credits
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(course.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(course.status)}
                      {course.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Course Info */}
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Program: {course.program.name}</p>
                    <p>Batch: {course.batch.name}</p>
                    {course.section && <p>Section: {course.section.name}</p>}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{course.cos.length}</p>
                      <p className="text-xs text-gray-500">COs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{course.assessments.length}</p>
                      <p className="text-xs text-gray-500">Assessments</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{course.enrollments.length}</p>
                      <p className="text-xs text-gray-500">Students</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/courses/${course.id}`)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/teacher/assessments?courseId=${course.id}`)}
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Assessments
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/teacher/reports?courseId=${course.id}`)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Reports
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses assigned</h3>
              <p className="text-gray-500">
                You haven't been assigned to any courses yet. Contact your program coordinator.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}