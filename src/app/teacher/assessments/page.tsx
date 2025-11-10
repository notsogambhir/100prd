'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  ClipboardList, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  Users,
  CheckCircle,
  Clock,
  Loader2,
  FileText,
  Target
} from 'lucide-react'

interface Course {
  id: string
  code: string
  name: string
  program: {
    name: string
  }
  batch: {
    name: string
  }
  section?: {
    name: string
  }
}

interface Assessment {
  id: string
  name: string
  type: 'Internal' | 'External'
  course: {
    code: string
    name: string
  }
  section: {
    name: string
  }
  creator: {
    name: string
    email: string
  }
  questions: Array<{
    id: string
    name: string
    maxMarks: number
    co?: {
      code: string
      description: string
    }
  }>
  _count: {
    marks: number
  }
}

function TeacherAssessmentsContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')

  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchTeacherCourses()
      if (selectedCourse) {
        fetchAssessments(selectedCourse)
      }
    }
  }, [session, selectedCourse])

  const fetchTeacherCourses = async () => {
    try {
      const response = await fetch(`/api/courses?teacherId=${session?.user?.id}`)
      if (response.ok) {
        const coursesData = await response.json()
        setCourses(coursesData)
      }
    } catch (error) {
      console.error('Failed to fetch teacher courses:', error)
    }
  }

  const fetchAssessments = async (courseId: string) => {
    try {
      const response = await fetch(`/api/assessments?courseId=${courseId}`)
      if (response.ok) {
        const assessmentsData = await response.json()
        setAssessments(assessmentsData)
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAssessment = () => {
    router.push(`/courses/${selectedCourse}?tab=assessments`)
  }

  const handleManageQuestions = (assessmentId: string) => {
    router.push(`/assessments/${assessmentId}/questions`)
  }

  const handleUploadMarks = async (assessmentId: string) => {
    // Create file input and trigger click
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.xlsx,.xls'
    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)
      formData.append('assessmentId', assessmentId)

      try {
        const response = await fetch('/api/marks/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Upload successful:', result)
          // Show success message
          alert(`Successfully uploaded ${result.successfulUploads} marks for ${result.totalProcessed} students.`)
          // Refresh assessments to update marks count
          fetchTeacherCourses()
          if (selectedCourse) {
            fetchAssessments(selectedCourse)
          }
        } else {
          const error = await response.json()
          console.error('Upload failed:', error)
          alert(`Upload failed: ${error.error}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('Upload failed. Please try again.')
      }
    }
    fileInput.click()
  }

  const handleDownloadTemplate = async (assessmentId: string) => {
    try {
      const response = await fetch(`/api/marks/upload?assessmentId=${assessmentId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `assessment-template-${assessmentId}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download template:', error)
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'Internal' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
          <p className="mt-2 text-gray-600">
            Create and manage assessments for your courses
          </p>
        </div>

        {/* Course Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
            <CardDescription>
              Choose a course to view and manage its assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCourse && (
                <Button onClick={handleCreateAssessment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assessment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedCourse && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-500">
                      <ClipboardList className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                      <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
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
                      <p className="text-sm font-medium text-gray-600">With Questions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {assessments.filter(a => a.questions.length > 0).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-orange-500">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Marks Uploaded</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {assessments.filter(a => a._count.marks > 0).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assessments List */}
            <div className="space-y-6">
              {assessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{assessment.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {assessment.course.code} - {assessment.course.name} • Section {assessment.section.name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(assessment.type)}>
                          {assessment.type}
                        </Badge>
                        {assessment._count.marks > 0 && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Graded
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Assessment Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Questions</p>
                          <p className="font-medium">{assessment.questions.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Marks</p>
                          <p className="font-medium">
                            {assessment.questions.reduce((sum, q) => sum + q.maxMarks, 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Students Graded</p>
                          <p className="font-medium">{assessment._count.marks}</p>
                        </div>
                      </div>

                      {/* Questions Preview */}
                      {assessment.questions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Questions:</p>
                          <div className="flex flex-wrap gap-2">
                            {assessment.questions.slice(0, 5).map((question) => (
                              <Badge key={question.id} variant="outline" className="text-xs">
                                {question.name} ({question.maxMarks})
                              </Badge>
                            ))}
                            {assessment.questions.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{assessment.questions.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleManageQuestions(assessment.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Manage Questions
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadTemplate(assessment.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Template
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUploadMarks(assessment.id)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Marks
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/teacher/reports?assessmentId=${assessment.id}`)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {assessments.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
                  <p className="text-gray-500 mb-4">
                    Create your first assessment for this course to get started.
                  </p>
                  <Button onClick={handleCreateAssessment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!selectedCourse && (
          <Card>
            <CardContent className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a course</h3>
              <p className="text-gray-500">
                Choose a course from the dropdown above to view and manage its assessments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function TeacherAssessments() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <TeacherAssessmentsContent />
    </Suspense>
  )
}