'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
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
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Loader2,
  Users,
  Target,
  CheckCircle,
  Clock,
  User
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
  programId: string
  batchId: string
  sectionId?: string
  teacherId?: string
  createdAt: string
  updatedAt: string
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

interface Program {
  id: string
  name: string
  code: string
}

interface Batch {
  id: string
  name: string
  startYear: number
  endYear: number
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

export default function Courses() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [programFilter, setProgramFilter] = useState<string>('')
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [selectedBatch, setSelectedBatch] = useState<string>('')

  // Form state
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    description: '',
    credits: 3,
    status: 'Future' as Course['status'],
    target: 60.0,
    attainmentLevel1: 40.0,
    attainmentLevel2: 60.0,
    attainmentLevel3: 80.0,
    programId: '',
    batchId: '',
    sectionId: '',
    teacherId: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      const savedProgramId = localStorage.getItem('selectedProgramId')
      const savedBatchId = localStorage.getItem('selectedBatchId')
      
      if (savedProgramId) setSelectedProgram(savedProgramId)
      if (savedBatchId) setSelectedBatch(savedBatchId)
      
      fetchData(savedProgramId, savedBatchId)
    }
  }, [session])

  useEffect(() => {
    // Apply filters
    let filtered = courses

    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(course => course.status === statusFilter)
    }

    if (programFilter) {
      filtered = filtered.filter(course => course.programId === programFilter)
    }

    setFilteredCourses(filtered)
  }, [courses, searchTerm, statusFilter, programFilter])

  const fetchData = async (programId?: string, batchId?: string) => {
    try {
      const [coursesRes, programsRes, batchesRes, sectionsRes, teachersRes] = await Promise.all([
        fetch(`/api/courses${programId ? `?programId=${programId}` : ''}${batchId ? `&batchId=${batchId}` : ''}`),
        fetch('/api/programs'),
        fetch('/api/batches'),
        fetch('/api/sections'),
        fetch('/api/users?role=Teacher')
      ])

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData)
      }

      if (programsRes.ok) {
        const programsData = await programsRes.json()
        setPrograms(programsData)
      }

      if (batchesRes.ok) {
        const batchesData = await batchesRes.json()
        setBatches(batchesData)
      }

      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json()
        setSections(sectionsData)
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json()
        setTeachers(teachersData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCourse = async () => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...courseForm,
          createdBy: session?.user?.id
        })
      })

      if (response.ok) {
        await fetchData(selectedProgram, selectedBatch)
        setCourseForm({
          code: '',
          name: '',
          description: '',
          credits: 3,
          status: 'Future',
          target: 60.0,
          attainmentLevel1: 40.0,
          attainmentLevel2: 60.0,
          attainmentLevel3: 80.0,
          programId: '',
          batchId: '',
          sectionId: '',
          teacherId: ''
        })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to create course:', error)
    }
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse) return

    try {
      const response = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      })

      if (response.ok) {
        await fetchData(selectedProgram, selectedBatch)
        setEditingCourse(null)
        setCourseForm({
          code: '',
          name: '',
          description: '',
          credits: 3,
          status: 'Future',
          target: 60.0,
          attainmentLevel1: 40.0,
          attainmentLevel2: 60.0,
          attainmentLevel3: 80.0,
          programId: '',
          batchId: '',
          sectionId: '',
          teacherId: ''
        })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to update course:', error)
    }
  }

  const handleStatusChange = async (courseId: string, newStatus: Course['status']) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchData(selectedProgram, selectedBatch)
      }
    } catch (error) {
      console.error('Failed to update course status:', error)
    }
  }

  const handleDeleteCourse = async (id: string) => {
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchData(selectedProgram, selectedBatch)
      }
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  const openEditDialog = (course: Course) => {
    setEditingCourse(course)
    setCourseForm({
      code: course.code,
      name: course.name,
      description: course.description || '',
      credits: course.credits,
      status: course.status,
      target: course.target,
      attainmentLevel1: course.attainmentLevel1,
      attainmentLevel2: course.attainmentLevel2,
      attainmentLevel3: course.attainmentLevel3,
      programId: course.programId,
      batchId: course.batchId,
      sectionId: course.sectionId || '',
      teacherId: course.teacherId || ''
    })
    setIsDialogOpen(true)
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

  if (!session || (session.user.role !== 'PC' && session.user.role !== 'Admin')) {
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
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="mt-2 text-gray-600">
            Manage courses and their outcomes
          </p>
        </div>

        {/* Program and Batch Filters */}
        {(session.user.role === 'PC' || session.user.role === 'Admin') && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Program & Batch Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="program-select">Program</Label>
                  <Select value={selectedProgram} onValueChange={(value) => {
                    setSelectedProgram(value)
                    localStorage.setItem('selectedProgramId', value)
                    fetchData(value, selectedBatch)
                  }}>
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
                  <Label htmlFor="batch-select">Batch</Label>
                  <Select value={selectedBatch} onValueChange={(value) => {
                    setSelectedBatch(value)
                    localStorage.setItem('selectedBatchId', value)
                    fetchData(selectedProgram, value)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches
                        .filter(batch => batch.programId === selectedProgram)
                        .map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name} ({batch.startYear}-{batch.endYear})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, code, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="Future">Future</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open)
                  if (!open) {
                    setEditingCourse(null)
                    setCourseForm({
                      code: '',
                      name: '',
                      description: '',
                      credits: 3,
                      status: 'Future',
                      target: 60.0,
                      attainmentLevel1: 40.0,
                      attainmentLevel2: 60.0,
                      attainmentLevel3: 80.0,
                      programId: selectedProgram,
                      batchId: selectedBatch,
                      sectionId: '',
                      teacherId: ''
                    })
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCourse ? 'Edit Course' : 'Create New Course'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCourse ? 'Update course information' : 'Add a new course to the program'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="course-code">Course Code</Label>
                          <Input
                            id="course-code"
                            value={courseForm.code}
                            onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                            placeholder="e.g., CS101"
                          />
                        </div>
                        <div>
                          <Label htmlFor="course-name">Course Name</Label>
                          <Input
                            id="course-name"
                            value={courseForm.name}
                            onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                            placeholder="Enter course name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="course-description">Description</Label>
                        <Textarea
                          id="course-description"
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                          placeholder="Enter course description"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="course-credits">Credits</Label>
                          <Input
                            id="course-credits"
                            type="number"
                            value={courseForm.credits}
                            onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })}
                            min="1"
                            max="10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="course-status">Status</Label>
                          <Select value={courseForm.status} onValueChange={(value) => setCourseForm({ ...courseForm, status: value as Course['status'] })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Future">Future</SelectItem>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="course-target">Target (%)</Label>
                          <Input
                            id="course-target"
                            type="number"
                            value={courseForm.target}
                            onChange={(e) => setCourseForm({ ...courseForm, target: parseFloat(e.target.value) })}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="level1">Level 1 Threshold (%)</Label>
                          <Input
                            id="level1"
                            type="number"
                            value={courseForm.attainmentLevel1}
                            onChange={(e) => setCourseForm({ ...courseForm, attainmentLevel1: parseFloat(e.target.value) })}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="level2">Level 2 Threshold (%)</Label>
                          <Input
                            id="level2"
                            type="number"
                            value={courseForm.attainmentLevel2}
                            onChange={(e) => setCourseForm({ ...courseForm, attainmentLevel2: parseFloat(e.target.value) })}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="level3">Level 3 Threshold (%)</Label>
                          <Input
                            id="level3"
                            type="number"
                            value={courseForm.attainmentLevel3}
                            onChange={(e) => setCourseForm({ ...courseForm, attainmentLevel3: parseFloat(e.target.value) })}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="course-section">Section</Label>
                          <Select value={courseForm.sectionId} onValueChange={(value) => setCourseForm({ ...courseForm, sectionId: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No Section</SelectItem>
                              {sections
                                .filter(section => {
                                  const batch = batches.find(b => b.id === selectedBatch)
                                  return batch && section.batchId === batch.id
                                })
                                .map((section) => (
                                  <SelectItem key={section.id} value={section.id}>
                                    {section.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="course-teacher">Teacher</Label>
                          <Select value={courseForm.teacherId} onValueChange={(value) => setCourseForm({ ...courseForm, teacherId: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No Teacher</SelectItem>
                              {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {teacher.name} ({teacher.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}>
                          {editingCourse ? 'Update Course' : 'Create Course'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Courses ({filteredCourses.length})
            </CardTitle>
            <CardDescription>
              All courses in the selected program and batch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Credits</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Teacher</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Students</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">COs</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Assessments</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{course.name}</div>
                          <div className="text-sm text-gray-500">{course.code}</div>
                          {course.description && (
                            <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                              {course.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{course.credits}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(course.status)}>
                          {getStatusIcon(course.status)}
                          <span className="ml-1">{course.status}</span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {course.teacher ? (
                          <div className="flex items-center text-sm">
                            <User className="h-3 w-3 mr-1" />
                            {course.teacher.name}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not Assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-sm">
                          <Users className="h-3 w-3 mr-1" />
                          {course.enrollments.length}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-sm">
                          <Target className="h-3 w-3 mr-1" />
                          {course.cos.length}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-sm">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {course.assessments.length}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Select
                            value={course.status}
                            onValueChange={(value) => handleStatusChange(course.id, value as Course['status'])}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Future">Future</SelectItem>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{course.name}"? This will also delete all associated outcomes, assessments, and enrollment data. This action cannot be undone.
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredCourses.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filters, or create a new course
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}