'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Users, 
  FileText,
  Download,
  Upload,
  Settings,
  Target,
  CheckSquare
} from 'lucide-react'
import { COPOMappingMatrix } from '@/components/course/COPOMappingMatrix'

interface Course {
  id: string
  code: string
  name: string
  credits: number
  status: string
  program: {
    name: string
  }
  batch: {
    name: string
  }
  courseOutcomes: Array<{
    id: string
    code: string
    description: string
  }>
  assessments: Array<{
    id: string
    name: string
    type: string
    section: {
      name: string
    }
    _count: {
      questions: number
    }
  }>
}

interface Section {
  id: string
  name: string
}

interface Assessment {
  id: string
  name: string
  type: string
  sectionId: string
  section: {
    name: string
  }
  questions: Array<{
    id: string
    questionName: string
    maxMarks: number
    co?: {
      code: string
    }
  }>
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Form states
  const [assessmentForm, setAssessmentForm] = useState({
    name: '',
    type: 'INTERNAL',
    sectionId: ''
  })
  const [questionForm, setQuestionForm] = useState({
    questionName: '',
    maxMarks: 10,
    coId: ''
  })

  // Dialog states
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false)
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  // Faculty Assignment states
  const [assignmentMode, setAssignmentMode] = useState<'single' | 'section'>('single')
  const [singleTeacherId, setSingleTeacherId] = useState('')
  const [sectionAssignments, setSectionAssignments] = useState<Record<string, string>>({})
  const [currentAssignments, setCurrentAssignments] = useState<any[]>([])
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([])
  const [sectionStudents, setSectionStudents] = useState<Record<string, number>>({})

  useEffect(() => {
    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      const [courseRes, sectionsRes, assessmentsRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch('/api/sections'),
        fetch(`/api/assessments?courseId=${courseId}`)
      ])

      if (courseRes.ok) {
        const courseData = await courseRes.json()
        setCourse(courseData)
      }
      if (sectionsRes.ok) {
        setSections(await sectionsRes.json())
      }
      if (assessmentsRes.ok) {
        setAssessments(await assessmentsRes.json())
      }
    } catch (error) {
      console.error('Error fetching course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssessment = async () => {
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assessmentForm,
          courseId
        })
      })

      if (response.ok) {
        setAssessmentDialogOpen(false)
        setAssessmentForm({ name: '', type: 'INTERNAL', sectionId: '' })
        fetchCourseData()
      }
    } catch (error) {
      console.error('Error creating assessment:', error)
    }
  }

  const handleCreateQuestion = async () => {
    if (!selectedAssessment) return

    try {
      const response = await fetch('/api/assessment-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...questionForm,
          assessmentId: selectedAssessment.id
        })
      })

      if (response.ok) {
        setQuestionDialogOpen(false)
        setQuestionForm({ questionName: '', maxMarks: 10, coId: '' })
        fetchCourseData()
      }
    } catch (error) {
      console.error('Error creating question:', error)
    }
  }

  const handleDeleteAssessment = async (id: string) => {
    try {
      const response = await fetch(`/api/assessments/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCourseData()
      }
    } catch (error) {
      console.error('Error deleting assessment:', error)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    try {
      const response = await fetch(`/api/assessment-questions/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCourseData()
      }
    } catch (error) {
      console.error('Error deleting question:', error)
    }
  }

  const handleDownloadTemplate = async (assessmentId: string) => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/template`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `assessment-template.xlsx`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading template:', error)
    }
  }

  const handleUploadMarks = async () => {
    if (!uploadFile || !selectedAssessment) return

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('assessmentId', selectedAssessment.id)

      const response = await fetch(`/api/assessments/${selectedAssessment.id}/upload-marks`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setUploadDialogOpen(false)
        setUploadFile(null)
        fetchCourseData()
      } else {
        alert('Error uploading marks. Please check the file format.')
      }
    } catch (error) {
      console.error('Error uploading marks:', error)
      alert('Error uploading marks. Please try again.')
    }
  }

  // Faculty Assignment Functions
  const handleSingleTeacherAssignment = async () => {
    if (!singleTeacherId) return

    try {
      const response = await fetch('/api/course-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          teacherId: singleTeacherId
        })
      })

      if (response.ok) {
        alert('Teacher assigned to course successfully!')
        fetchCourseData()
      }
    } catch (error) {
      console.error('Error assigning teacher:', error)
      alert('Failed to assign teacher. Please try again.')
    }
  }

  const handleSectionAssignment = (sectionId: string, teacherId: string) => {
    setSectionAssignments(prev => ({
      ...prev,
      [sectionId]: teacherId
    }))
  }

  const handleSectionAssignments = async () => {
    try {
      const assignments = Object.entries(sectionAssignments).map(([sectionId, teacherId]) => ({
        courseId,
        sectionId,
        teacherId
      }))

      const response = await fetch('/api/course-assignments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments })
      })

      if (response.ok) {
        alert('Faculty assignments saved successfully!')
        fetchCourseData()
        setSectionAssignments({})
      }
    } catch (error) {
      console.error('Error saving assignments:', error)
      alert('Failed to save assignments. Please try again.')
    }
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/course-assignments/${assignmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCourseData()
      }
    } catch (error) {
      console.error('Error removing assignment:', error)
      alert('Failed to remove assignment. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'FUTURE': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Course Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{course.name}</CardTitle>
                <CardDescription className="text-lg mt-1">
                  {course.code} • {course.credits} credits
                </CardDescription>
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="outline">{course.program.name}</Badge>
                  <Badge variant="outline">{course.batch.name}</Badge>
                  <Badge className={getStatusColor(course.status)}>
                    {course.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Course Details Tabs */}
        <Tabs defaultValue="assessments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="cos">Course Outcomes</TabsTrigger>
            <TabsTrigger value="copo">CO-PO Mapping</TabsTrigger>
            <TabsTrigger value="faculty">Faculty Assignment</TabsTrigger>
          </TabsList>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Assessments
                    </CardTitle>
                    <CardDescription>Manage course assessments and questions</CardDescription>
                  </div>
                  <Dialog open={assessmentDialogOpen} onOpenChange={setAssessmentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Assessment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Assessment</DialogTitle>
                        <DialogDescription>
                          Create a new assessment for this course
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="assessment-name">Assessment Name</Label>
                          <Input
                            id="assessment-name"
                            value={assessmentForm.name}
                            onChange={(e) => setAssessmentForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Mid-Term Examination"
                          />
                        </div>
                        <div>
                          <Label htmlFor="assessment-type">Type</Label>
                          <Select value={assessmentForm.type} onValueChange={(value) => setAssessmentForm(prev => ({ ...prev, type: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INTERNAL">Internal</SelectItem>
                              <SelectItem value="EXTERNAL">External</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="assessment-section">Section</Label>
                          <Select value={assessmentForm.sectionId} onValueChange={(value) => setAssessmentForm(prev => ({ ...prev, sectionId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select section" />
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
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateAssessment} disabled={!assessmentForm.name || !assessmentForm.sectionId}>
                          Create Assessment
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessments.map((assessment) => (
                    <div key={assessment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{assessment.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{assessment.type}</Badge>
                            <Badge variant="outline">{assessment.section.name}</Badge>
                            <span className="text-sm text-gray-600">
                              {assessment.questions.length} questions
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadTemplate(assessment.id)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Template
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAssessment(assessment)
                              setUploadDialogOpen(true)
                            }}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload Marks
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAssessment(assessment)
                              setQuestionDialogOpen(true)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Question
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {assessment.name}? This will also delete all questions and marks associated with this assessment.
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

                      {/* Questions */}
                      {assessment.questions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Questions:</h4>
                          {assessment.questions.map((question) => (
                            <div key={question.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{question.questionName}</span>
                                <span className="text-sm text-gray-600">Max: {question.maxMarks}</span>
                                {question.co && (
                                  <Badge variant="outline">{question.co.code}</Badge>
                                )}
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {question.questionName}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteQuestion(question.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Outcomes Tab */}
          <TabsContent value="cos">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Course Outcomes
                    </CardTitle>
                    <CardDescription>Define learning outcomes for this course</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add CO
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course.courseOutcomes.map((co) => (
                    <div key={co.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Badge variant="outline" className="mb-2">{co.code}</Badge>
                        <p className="text-sm">{co.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CO-PO Mapping Tab */}
          <TabsContent value="copo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  CO-PO Mapping Matrix
                </CardTitle>
                <CardDescription>Map course outcomes to program outcomes with correlation levels</CardDescription>
              </CardHeader>
              <CardContent>
                <COPOMappingMatrix courseId={courseId} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Faculty Assignment Tab */}
          <TabsContent value="faculty">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Faculty Assignment
                </CardTitle>
                <CardDescription>Assign teachers to course sections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Assignment Mode Toggle */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-medium">Assignment Mode:</span>
                    <div className="flex gap-2">
                      <Button
                        variant={assignmentMode === 'single' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAssignmentMode('single')}
                      >
                        Single Teacher
                      </Button>
                      <Button
                        variant={assignmentMode === 'section' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAssignmentMode('section')}
                      >
                        Assign by Section
                      </Button>
                    </div>
                  </div>

                  {/* Single Teacher Assignment */}
                  {assignmentMode === 'single' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Select Teacher</label>
                        <Select value={singleTeacherId} onValueChange={setSingleTeacherId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTeachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name} ({teacher.username})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleSingleTeacherAssignment} disabled={!singleTeacherId}>
                        Assign Teacher to Course
                      </Button>
                    </div>
                  )}

                  {/* Section-based Assignment */}
                  {assignmentMode === 'section' && (
                    <div className="space-y-4">
                      {sections.map((section) => (
                        <div key={section.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="flex-1">
                            <span className="font-medium">{section.name}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              {sectionStudents[section.id] || 0} students
                            </span>
                          </div>
                          <Select 
                            value={sectionAssignments[section.id] || ''} 
                            onValueChange={(value) => handleSectionAssignment(section.id, value)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTeachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {teacher.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      ))}
                      <div className="flex justify-end mt-4">
                        <Button onClick={handleSectionAssignments} disabled={Object.keys(sectionAssignments).length === 0}>
                          Save Assignments
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Current Assignments Display */}
                  {currentAssignments.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Current Assignments:</h4>
                      <div className="space-y-2">
                        {currentAssignments.map((assignment: any) => (
                          <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium">{assignment.teacher?.name}</span>
                              {assignment.section && (
                                <span className="text-sm text-gray-600 ml-2">
                                  ({assignment.section.name})
                                </span>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveAssignment(assignment.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Question Dialog */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Question</DialogTitle>
            <DialogDescription>
              Add a new question to {selectedAssessment?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="question-name">Question Name</Label>
              <Input
                id="question-name"
                value={questionForm.questionName}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, questionName: e.target.value }))}
                placeholder="e.g., Q1, Q2a"
              />
            </div>
            <div>
              <Label htmlFor="question-marks">Maximum Marks</Label>
              <Input
                id="question-marks"
                type="number"
                value={questionForm.maxMarks}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, maxMarks: parseInt(e.target.value) }))}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="question-co">Course Outcome</Label>
              <Select value={questionForm.coId} onValueChange={(value) => setQuestionForm(prev => ({ ...prev, coId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select CO (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {course?.courseOutcomes.map((co) => (
                    <SelectItem key={co.id} value={co.id}>
                      {co.code} - {co.description.substring(0, 50)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateQuestion} disabled={!questionForm.questionName}>
              Add Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Marks Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Student Marks</DialogTitle>
            <DialogDescription>
              Upload the completed Excel file with student marks for {selectedAssessment?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Excel File</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            {uploadFile && (
              <div className="text-sm text-gray-600">
                Selected file: {uploadFile.name}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleUploadMarks}
              disabled={!uploadFile}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Marks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}