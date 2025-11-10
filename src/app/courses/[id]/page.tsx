'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Target,
  Users,
  UserCheck,
  ClipboardList,
  Save,
  X,
  Loader2,
  ArrowLeft
} from 'lucide-react'

interface Course {
  id: string
  code: string
  name: string
  description?: string
  credits: number
  status: 'Future' | 'Active' | 'Completed'
  target: number
  attainmentLevel1: number
  attainmentLevel2: number
  attainmentLevel3: number
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
  teacher?: {
    name: string
    email: string
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

interface CourseOutcome {
  id: string
  code: string
  description: string
  courseId: string
}

interface ProgramOutcome {
  id: string
  code: string
  description: string
  programId: string
}

interface CoPoMapping {
  id: string
  coId: string
  poId: string
  level: number
}

interface Assessment {
  id: string
  name: string
  type: 'Internal' | 'External'
  courseId: string
  sectionId: string
}

interface Section {
  id: string
  name: string
}

interface Teacher {
  id: string
  name: string
  email: string
}

export default function CourseDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [cos, setCos] = useState<CourseOutcome[]>([])
  const [pos, setPos] = useState<ProgramOutcome[]>([])
  const [coPoMappings, setCoPoMappings] = useState<CoPoMapping[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Form states
  const [coForm, setCoForm] = useState({ code: '', description: '' })
  const [assessmentForm, setAssessmentForm] = useState({ name: '', type: 'Internal' as const, sectionId: '' })
  const [teacherAssignment, setTeacherAssignment] = useState({ teacherId: '', assignmentType: 'single' as const })
  // const [coPoMappings, setCoPoMappings] = useState<Record<string, Record<string, number>>>({})
  // const [pos, setPos] = useState<ProgramOutcome[]>([])
  // const [isLoadingMappings, setIsLoadingMappings] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user && courseId) {
      fetchCourseData()
    }
  }, [session, courseId])

  const fetchCourseData = async () => {
    try {
      const [courseRes, coRes, poRes, assessmentRes, sectionRes, teacherRes, mappingRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/course-outcomes?courseId=${courseId}`),
        fetch('/api/program-outcomes'),
        fetch(`/api/assessments?courseId=${courseId}`),
        fetch('/api/sections'),
        fetch('/api/users?role=Teacher'),
        fetch(`/api/co-po-mappings?courseId=${courseId}`)
      ])

      if (courseRes.ok) {
        const courseData = await courseRes.json()
        setCourse(courseData)
      }

      if (coRes.ok) {
        const coData = await coRes.json()
        setCos(coData)
      }

      if (poRes.ok) {
        const poData = await poRes.json()
        setPos(poData)
      }

      if (assessmentRes.ok) {
        const assessmentData = await assessmentRes.json()
        setAssessments(assessmentData)
      }

      if (sectionRes.ok) {
        const sectionData = await sectionRes.json()
        setSections(sectionData)
      }

      if (teacherRes.ok) {
        const teacherData = await teacherRes.json()
        setTeachers(teacherData)
      }

      if (mappingRes.ok) {
        const mappingData = await mappingRes.json()
        // Convert mappings to matrix format
        const mappingMatrix: Record<string, Record<string, number>> = {}
        mappingData.forEach((mapping: any) => {
          if (!mappingMatrix[mapping.coId]) {
            mappingMatrix[mapping.coId] = {}
          }
          mappingMatrix[mapping.coId][mapping.poId] = mapping.level
        })
        setCoPoMappings(mappingMatrix)
      }
    } catch (error) {
      console.error('Failed to fetch course data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCO = async () => {
    try {
      const response = await fetch('/api/course-outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...coForm,
          courseId,
          createdBy: session?.user?.id
        })
      })

      if (response.ok) {
        const coRes = await fetch(`/api/course-outcomes?courseId=${courseId}`)
        if (coRes.ok) {
          const coData = await coRes.json()
          setCos(coData)
        }
        setCoForm({ code: '', description: '' })
        setHasUnsavedChanges(true)
      }
    } catch (error) {
      console.error('Failed to create CO:', error)
    }
  }

  const handleDeleteCO = async (coId: string) => {
    try {
      const response = await fetch(`/api/course-outcomes/${coId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCos(cos.filter(co => co.id !== coId))
        setHasUnsavedChanges(true)
      }
    } catch (error) {
      console.error('Failed to delete CO:', error)
    }
  }

  const handleCreateAssessment = async () => {
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assessmentForm,
          courseId,
          createdBy: session?.user?.id
        })
      })

      if (response.ok) {
        const assessmentRes = await fetch(`/api/assessments?courseId=${courseId}`)
        if (assessmentRes.ok) {
          const assessmentData = await assessmentRes.json()
          setAssessments(assessmentData)
        }
        setAssessmentForm({ name: '', type: 'Internal', sectionId: '' })
      }
    } catch (error) {
      console.error('Failed to create assessment:', error)
    }
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAssessments(assessments.filter(a => a.id !== assessmentId))
      }
    } catch (error) {
      console.error('Failed to delete assessment:', error)
    }
  }

  const handleMappingChange = async (coId: string, poId: string, level: number) => {
    const newMappings = { ...coPoMappings }
    if (!newMappings[coId]) {
      newMappings[coId] = {}
    }
    newMappings[coId][poId] = level
    setCoPoMappings(newMappings)
    setHasUnsavedChanges(true)
  }

  const handleSaveMappings = async () => {
    setIsLoadingMappings(true)
    try {
      // Convert matrix back to array format
      const mappingsArray: any[] = []
      Object.entries(coPoMappings).forEach(([coId, poMappings]) => {
        Object.entries(poMappings).forEach(([poId, level]) => {
          if (level > 0) { // Only save mappings with level > 0
            mappingsArray.push({
              coId,
              poId,
              level
            })
          }
        })
      })

      const response = await fetch('/api/co-po-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappings: mappingsArray })
      })

      if (response.ok) {
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      console.error('Failed to save CO-PO mappings:', error)
    } finally {
      setIsLoadingMappings(false)
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || !course) {
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/courses')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
              <p className="text-gray-600 mt-1">{course.code} • {course.credits} credits</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge className={getStatusColor(course.status)}>
                  {course.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  {course.program.name} • {course.batch.name}
                </span>
                {course.section && (
                  <span className="text-sm text-gray-500">
                    Section {course.section.name}
                  </span>
                )}
              </div>
            </div>
            
            {course.teacher && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Assigned Teacher</p>
                <p className="font-medium">{course.teacher.name}</p>
                <p className="text-sm text-gray-500">{course.teacher.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Unsaved Changes Bar */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-yellow-50 border-t border-yellow-200 p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <p className="text-yellow-800">You have unsaved changes</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setHasUnsavedChanges(false)
                  // Reset mappings to original state
                  fetchCourseData()
                }}>
                  Discard
                </Button>
                <Button onClick={handleSaveMappings} disabled={isLoadingMappings}>
                  {isLoadingMappings ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="cos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cos">Course Outcomes</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="co-po-mapping">CO-PO Mapping</TabsTrigger>
            <TabsTrigger value="faculty">Faculty Assignment</TabsTrigger>
          </TabsList>

          {/* Course Outcomes Tab */}
          <TabsContent value="cos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Course Outcomes (COs)
                </CardTitle>
                <CardDescription>
                  Define the learning outcomes for this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add CO Form */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="co-code">CO Code</Label>
                      <Input
                        id="co-code"
                        placeholder="e.g., CO1"
                        value={coForm.code}
                        onChange={(e) => setCoForm({ ...coForm, code: e.target.value })}
                      />
                    </div>
                    <div className="flex-2">
                      <Label htmlFor="co-description">Description</Label>
                      <Input
                        id="co-description"
                        placeholder="Course outcome description"
                        value={coForm.description}
                        onChange={(e) => setCoForm({ ...coForm, description: e.target.value })}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleCreateCO} disabled={!coForm.code || !coForm.description}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add CO
                      </Button>
                    </div>
                  </div>

                  {/* COs List */}
                  <div className="space-y-2">
                    {cos.map((co) => (
                      <div key={co.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{co.code}</span>
                          <p className="text-sm text-gray-600">{co.description}</p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Course Outcome</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {co.code}? This will also remove any mappings and associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCO(co.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Assessments
                </CardTitle>
                <CardDescription>
                  Create and manage assessments for this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add Assessment Form */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="assessment-name">Assessment Name</Label>
                      <Input
                        id="assessment-name"
                        placeholder="e.g., Mid-Term Exam"
                        value={assessmentForm.name}
                        onChange={(e) => setAssessmentForm({ ...assessmentForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="assessment-type">Type</Label>
                      <Select value={assessmentForm.type} onValueChange={(value: 'Internal' | 'External') => setAssessmentForm({ ...assessmentForm, type: value })}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Internal">Internal</SelectItem>
                          <SelectItem value="External">External</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="assessment-section">Section</Label>
                      <Select value={assessmentForm.sectionId} onValueChange={(value) => setAssessmentForm({ ...assessmentForm, sectionId: value })}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((section) => (
                            <SelectItem key={section.id} value={section.id}>
                              {section.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleCreateAssessment} disabled={!assessmentForm.name || !assessmentForm.sectionId}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create
                      </Button>
                    </div>
                  </div>

                  {/* Assessments List */}
                  <div className="space-y-2">
                    {assessments.map((assessment) => (
                      <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{assessment.name}</span>
                          <Badge variant="outline" className="ml-2">{assessment.type}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Manage Questions
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{assessment.name}"? This will also delete all questions and marks.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteAssessment(assessment.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CO-PO Mapping Tab */}
          <TabsContent value="co-po-mapping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  CO-PO Mapping
                </CardTitle>
                <CardDescription>
                  Map course outcomes to program outcomes with correlation levels (0-3)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">CO-PO mapping interface will be implemented here</p>
                  <p className="text-sm text-gray-400 mt-2">This will show a matrix of COs vs POs with dropdown selectors for correlation levels (0-3)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Faculty Assignment Tab */}
          <TabsContent value="faculty" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Faculty Assignment
                </CardTitle>
                <CardDescription>
                  Assign teachers to this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">Faculty assignment interface will be implemented here</p>
                  <p className="text-sm text-gray-400 mt-2">This will allow assigning single teacher or teachers by section</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}