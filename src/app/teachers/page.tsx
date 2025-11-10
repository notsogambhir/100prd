'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Users, 
  BookOpen, 
  Target,
  CheckCircle,
  Clock,
  Loader2,
  UserCheck,
  Mail
} from 'lucide-react'

interface Teacher {
  id: string
  name: string
  email: string
  role: string
  status: string
  collegeId?: string
  college?: {
    name: string
  }
  teacherToPcs: Array<{
    pc: {
      id: string
      name: string
      email: string
    }
  }>
  assignedCourses: Array<{
    id: string
    code: string
    name: string
    status: string
  }>
  _count: {
    assignedCourses: number
  }
}

export default function Teachers() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [colleges, setColleges] = useState<any[]>([])
  const [selectedCollege, setSelectedCollege] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchTeachers()
      if (session.user.role === 'Admin' || session.user.role === 'University') {
        fetchColleges()
      }
    }
  }, [session])

  const fetchTeachers = async () => {
    try {
      let url = '/api/users?role=Teacher'
      
      if (session?.user?.role === 'PC') {
        // PCs can only see teachers assigned to their programs
        url += `&pcId=${session.user.id}`
      } else if (session?.user?.role === 'Department') {
        // Department heads can see teachers in their college
        url += `&collegeId=${session.user.collegeId}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const teachersData = await response.json()
        setTeachers(teachersData)
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchColleges = async () => {
    try {
      const response = await fetch('/api/colleges')
      if (response.ok) {
        const collegesData = await response.json()
        setColleges(collegesData)
      }
    } catch (error) {
      console.error('Failed to fetch colleges:', error)
    }
  }

  const handleTeacherClick = (teacherId: string) => {
    router.push(`/teachers/${teacherId}`)
  }

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getStatusIcon = (status: string) => {
    return status === 'Active' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || (session.user.role !== 'PC' && session.user.role !== 'Admin' && session.user.role !== 'University' && session.user.role !== 'Department')) {
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
          <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
          <p className="mt-2 text-gray-600">
            View and manage teaching staff
            {session.user.role === 'PC' && ' assigned to your programs'}
            {session.user.role === 'Department' && ' in your department'}
          </p>
        </div>

        {/* College Filter for Admin/University */}
        {(session.user.role === 'Admin' || session.user.role === 'University') && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter by College</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-64">
                <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Colleges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Colleges</SelectItem>
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teachers.filter(t => t.status === 'Active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-500">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teachers.reduce((sum, teacher) => sum + teacher._count.assignedCourses, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-500">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">PC Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teachers.reduce((sum, teacher) => sum + teacher.teacherToPcs.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teachers List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Teaching Staff</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PC Assignments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                        <div className="text-sm text-gray-500">ID: {teacher.id.slice(-6)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {teacher.email}
                      </div>
                      {teacher.college && (
                        <div className="text-xs text-gray-500 mt-1">
                          {teacher.college.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(teacher.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(teacher.status)}
                          {teacher.status}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {teacher._count.assignedCourses} courses
                      </div>
                      {teacher.assignedCourses.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {teacher.assignedCourses.slice(0, 2).map(c => c.code).join(', ')}
                          {teacher.assignedCourses.length > 2 && '...'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {teacher.teacherToPcs.length} PC(s)
                      </div>
                      {teacher.teacherToPcs.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {teacher.teacherToPcs.slice(0, 2).map(tp => tp.pc.name).join(', ')}
                          {teacher.teacherToPcs.length > 2 && '...'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTeacherClick(teacher.id)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {teachers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
              <p className="text-gray-500">
                {session.user.role === 'PC' 
                  ? 'No teachers have been assigned to your programs yet.'
                  : 'No teachers found in the system.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}