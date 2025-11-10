'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
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
  Target,
  Save,
  ArrowLeft,
  Loader2,
  Upload,
  Download
} from 'lucide-react'

interface Assessment {
  id: string
  name: string
  type: 'Internal' | 'External'
  courseId: string
  sectionId: string
  course: {
    code: string
    name: string
  }
  section: {
    name: string
  }
  _count: {
    marks: number
  }
}

interface Question {
  id: string
  name: string
  maxMarks: number
  assessmentId: string
  coId?: string
  co?: {
    id: string
    code: string
    description: string
  }
}

interface CourseOutcome {
  id: string
  code: string
  description: string
  courseId: string
}

interface Section {
  id: string
  name: string
}

export default function AssessmentQuestions() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const assessmentId = params.id as string

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [cos, setCos] = useState<CourseOutcome[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  // Form state
  const [questionForm, setQuestionForm] = useState({
    name: '',
    maxMarks: 1,
    coIds: [] as string[]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user && assessmentId) {
      fetchData()
    }
  }, [session, assessmentId])

  const fetchData = async () => {
    try {
      const [assessmentRes, questionsRes, cosRes, sectionsRes] = await Promise.all([
        fetch(`/api/assessments/${assessmentId}`),
        fetch(`/api/assessment-questions?assessmentId=${assessmentId}`),
        fetch('/api/course-outcomes'),
        fetch('/api/sections')
      ])

      if (assessmentRes.ok) {
        const assessmentData = await assessmentRes.json()
        setAssessment(assessmentData)
      }

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json()
        setQuestions(questionsData)
      }

      if (cosRes.ok) {
        const cosData = await cosRes.json()
        setCos(cosData)
      }

      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json()
        setSections(sectionsData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateQuestion = async () => {
    try {
      const response = await fetch('/api/assessment-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: questionForm.name,
          maxMarks: questionForm.maxMarks,
          assessmentId,
          coId: questionForm.coIds.length > 0 ? questionForm.coIds[0] : null,
          createdBy: session?.user?.id
        })
      })

      if (response.ok) {
        const questionsRes = await fetch(`/api/assessment-questions?assessmentId=${assessmentId}`)
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json()
          setQuestions(questionsData)
        }
        setQuestionForm({ name: '', maxMarks: 1, coIds: [] })
        setIsDialogOpen(false)
        setHasUnsavedChanges(true)
      }
    } catch (error) {
      console.error('Failed to create question:', error)
    }
  }

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return

    try {
      const response = await fetch(`/api/assessment-questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: questionForm.name,
          maxMarks: questionForm.maxMarks,
          coId: questionForm.coIds.length > 0 ? questionForm.coIds[0] : null
        })
      })

      if (response.ok) {
        const questionsRes = await fetch(`/api/assessment-questions?assessmentId=${assessmentId}`)
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json()
          setQuestions(questionsData)
        }
        setEditingQuestion(null)
        setQuestionForm({ name: '', maxMarks: 1, coIds: [] })
        setIsDialogOpen(false)
        setHasUnsavedChanges(true)
      }
    } catch (error) {
      console.error('Failed to update question:', error)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/assessment-questions/${questionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setQuestions(questions.filter(q => q.id !== questionId))
        setHasUnsavedChanges(true)
      }
    } catch (error) {
      console.error('Failed to delete question:', error)
    }
  }

  const handleSaveChanges = async () => {
    try {
      // Save all question changes
      const response = await fetch(`/api/assessment-questions/batch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions })
      })

      if (response.ok) {
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      console.error('Failed to save changes:', error)
    }
  }

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question)
    setQuestionForm({
      name: question.name,
      maxMarks: question.maxMarks,
      coIds: question.coId ? [question.coId] : []
    })
    setIsDialogOpen(true)
  }

  const downloadTemplate = () => {
    // Create Excel template with student list and question columns
    const csvContent = [
      ['Roll Number', 'Student Name', ...questions.map(q => q.name)].join(','),
      ...['Sample data here'] // This would be populated with actual students
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${assessment?.name || 'assessment'}-template.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const uploadMarks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('assessmentId', assessmentId)

    fetch('/api/marks/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Marks uploaded successfully!')
        } else {
          alert('Error uploading marks: ' + data.error)
        }
      })
      .catch(error => {
        console.error('Error uploading marks:', error)
        alert('Error uploading marks')
      })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || !assessment) {
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
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assessment
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{assessment.name}</h1>
              <p className="text-gray-600 mt-1">
                {assessment.course.code} - {assessment.course.name} • {assessment.section.name}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">{assessment.type}</Badge>
                <span className="text-sm text-gray-500">
                  {assessment._count.marks} marks uploaded
                </span>
              </div>
            </div>
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
                  fetchData()
                }}>
                  Discard
                </Button>
                <Button onClick={handleSaveChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button variant="outline" onClick={() => document.getElementById('marks-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Marks
              </Button>
              <input
                id="marks-upload"
                type="file"
                accept=".csv,.xlsx"
                onChange={uploadMarks}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Assessment Questions
                </CardTitle>
                <CardDescription>
                  Manage questions and map them to course outcomes
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) {
                  setEditingQuestion(null)
                  setQuestionForm({ name: '', maxMarks: 1, coIds: [] })
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuestion ? 'Edit Question' : 'Create New Question'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingQuestion ? 'Edit the question details below.' : 'Add a new question to this assessment.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="question-name">Question Name</Label>
                      <Input
                        id="question-name"
                        placeholder="e.g., Q1, Q2a"
                        value={questionForm.name}
                        onChange={(e) => setQuestionForm({ ...questionForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-marks">Maximum Marks</Label>
                      <Input
                        id="max-marks"
                        type="number"
                        min="1"
                        value={questionForm.maxMarks}
                        onChange={(e) => setQuestionForm({ ...questionForm, maxMarks: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Course Outcome (Optional)</Label>
                      <Select value={questionForm.coIds[0] || ''} onValueChange={(value) => setQuestionForm({ ...questionForm, coIds: value ? [value] : [] })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select CO (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No CO mapping</SelectItem>
                          {cos.map((co) => (
                            <SelectItem key={co.id} value={co.id}>
                              {co.code}: {co.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
                        disabled={!questionForm.name || questionForm.maxMarks < 1}
                      >
                        {editingQuestion ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No questions added yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Add your first question to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((question) => (
                    <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{question.name}</span>
                          <Badge variant="outline">{question.maxMarks} marks</Badge>
                          {question.co && (
                            <Badge variant="secondary">
                              {question.co.code}
                            </Badge>
                          )}
                        </div>
                        {question.co && (
                          <p className="text-sm text-gray-600 mt-1">
                            Mapped to: {question.co.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(question)}>
                          <Edit className="h-3 w-3" />
                        </Button>
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
                                Are you sure you want to delete "{question.name}"? This will also delete all associated marks.
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}