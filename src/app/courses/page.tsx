'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  BookOpen, 
  Users, 
  Calendar,
  Edit,
  Trash2,
  Play,
  Pause,
  Check,
  Upload
} from 'lucide-react'

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
  _count: {
    courseOutcomes: number
    assessments: number
  }
}

interface Program {
  id: string
  name: string
  code: string
  college: {
    name: string
  }
}

interface Batch {
  id: string
  name: string
  programId: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    credits: 3,
    programId: '',
    batchId: ''
  })

  // Dialog states
  const [courseDialogOpen, setCourseDialogOpen] = useState(false)

  useEffect(() => {
    fetchCourses()
    fetchPrograms()
    fetchBatches()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        setCourses(await response.json())
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs')
      if (response.ok) {
        setPrograms(await response.json())
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
    }
  }

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches')
      if (response.ok) {
        setBatches(await response.json())
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
  }

  const handleAddCourse = async () => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      })

      if (response.ok) {
        setCourseDialogOpen(false)
        setCourseForm({ name: '', code: '', credits: 3, programId: '', batchId: '' })
        fetchCourses()
      }
    } catch (error) {
      console.error('Error adding course:', error)
    }
  }

  const handleDeleteCourse = async (id: string) => {
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCourses()
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchCourses()
      }
    } catch (error) {
      console.error('Error changing course status:', error)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Play className="h-3 w-3" />
      case 'FUTURE': return <Calendar className="h-3 w-3" />
      case 'COMPLETED': return <Check className="h-3 w-3" />
      default: return null
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600 mt-2">Manage academic courses and curriculum</p>
          </div>
          <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>
                  Create a new academic course
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course-name">Course Name</Label>
                  <Input
                    id="course-name"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter course name"
                  />
                </div>
                <div>
                  <Label htmlFor="course-code">Course Code</Label>
                  <Input
                    id="course-code"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Enter course code"
                  />
                </div>
                <div>
                  <Label htmlFor="course-credits">Credits</Label>
                  <Input
                    id="course-credits"
                    type="number"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <Label htmlFor="course-program">Program</Label>
                  <Select value={courseForm.programId} onValueChange={(value) => setCourseForm(prev => ({ ...prev, programId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name} ({program.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="course-batch">Batch</Label>
                  <Select value={courseForm.batchId} onValueChange={(value) => setCourseForm(prev => ({ ...prev, batchId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches
                        .filter(batch => !courseForm.programId || batch.programId === courseForm.programId)
                        .map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddCourse} disabled={!courseForm.name || !courseForm.code || !courseForm.programId || !courseForm.batchId}>
                  Add Course
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Course Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.filter(c => c.status === 'ACTIVE').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Future</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.filter(c => c.status === 'FUTURE').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.filter(c => c.status === 'COMPLETED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              All Courses
            </CardTitle>
            <CardDescription>Manage course information and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{course.name}</h3>
                        <Badge variant="outline">{course.code}</Badge>
                        <Badge className={getStatusColor(course.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(course.status)}
                            {course.status}
                          </span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Credits:</span> {course.credits}
                        </div>
                        <div>
                          <span className="font-medium">Program:</span> {course.program.name}
                        </div>
                        <div>
                          <span className="font-medium">Batch:</span> {course.batch.name}
                        </div>
                        <div>
                          <span className="font-medium">COs:</span> {course._count.courseOutcomes}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {course._count.assessments} assessments
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Select value={course.status} onValueChange={(value) => handleStatusChange(course.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FUTURE">Future</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Course</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {course.name}? This will also delete all associated assessments, outcomes, and marks. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}