'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  UserCheck, 
  Users, 
  Building, 
  BookOpen,
  Loader2,
  Save,
  Settings
} from 'lucide-react'

interface Program {
  id: string
  name: string
  code?: string
  college: {
    name: string
  }
  pc?: {
    id: string
    name: string
    email: string
  }
  _count: {
    courses: number
    batches: number
  }
}

interface Teacher {
  id: string
  name: string
  email: string
  college?: {
    name: string
  }
  teacherToPcs: Array<{
    pc: {
      id: string
      name: string
    }
  }>
}

interface College {
  id: string
  name: string
}

export default function FacultyManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [selectedCollege, setSelectedCollege] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedPCs, setSelectedPCs] = useState<string[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [pcAssignments, setPcAssignments] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session, selectedCollege])

  const fetchData = async () => {
    try {
      const [programsRes, teachersRes, collegesRes] = await Promise.all([
        fetch(`/api/programs${selectedCollege ? `?collegeId=${selectedCollege}` : ''}`),
        fetch(`/api/teachers/assignment${selectedCollege ? `?collegeId=${selectedCollege}` : ''}`),
        fetch('/api/colleges')
      ])

      if (programsRes.ok) {
        const programsData = await programsRes.json()
        setPrograms(programsData)
        
        // Initialize PC assignments
        const assignments: Record<string, string> = {}
        programsData.forEach((program: Program) => {
          if (program.pc) {
            assignments[program.id] = program.pc.id
          }
        })
        setPcAssignments(assignments)
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json()
        setTeachers(teachersData)
      }

      if (collegesRes.ok) {
        const collegesData = await collegesRes.json()
        setColleges(collegesData)
        
        // Auto-select user's college if Department Head
        if (session?.user?.role === 'Department' && session?.user?.collegeId) {
          setSelectedCollege(session.user.collegeId)
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePCAssignment = async (programId: string, pcId: string) => {
    try {
      const response = await fetch('/api/programs/assignment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, pcId })
      })

      if (response.ok) {
        await fetchData()
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      console.error('Failed to update PC assignment:', error)
    }
  }

  const handleTeacherAssignment = async () => {
    if (!selectedTeacher) return

    try {
      const response = await fetch('/api/teachers/assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacher.id,
          pcIds: selectedPCs
        })
      })

      if (response.ok) {
        await fetchData()
        setIsTeacherDialogOpen(false)
        setSelectedTeacher(null)
        setSelectedPCs([])
      }
    } catch (error) {
      console.error('Failed to update teacher assignments:', error)
    }
  }

  const openTeacherDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setSelectedPCs(teacher.teacherToPcs.map(tp => tp.pc.id))
    setIsTeacherDialogOpen(true)
  }

  const saveAllChanges = async () => {
    for (const [programId, pcId] of Object.entries(pcAssignments)) {
      await handlePCAssignment(programId, pcId)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || (session.user.role !== 'Department' && session.user.role !== 'Admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const availablePCs = teachers.filter(t => 
    t.teacherToPcs.some(tp => tp.pc.college.name === programs.find(p => p.id === Object.keys(pcAssignments)[0])?.college?.name)
  ).map(t => t.teacherToPcs.map(tp => tp.pc)).flat()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
          <p className="mt-2 text-gray-600">
            Manage program coordinators and teacher assignments
          </p>
        </div>

        {/* College Filter */}
        {(session.user.role === 'Admin' || session.user.role === 'University') && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                College Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select a college" />
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
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PC Assignments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Program Coordinator Assignments
                </CardTitle>
                {hasUnsavedChanges && (
                  <Button onClick={saveAllChanges} size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Save All
                  </Button>
                )}
              </div>
              <CardDescription>
                Assign Program Coordinators to each program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {programs.map((program) => (
                  <div key={program.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{program.name}</h3>
                        {program.code && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {program.code}
                          </Badge>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {program._count.courses} courses
                          </div>
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {program._count.batches} batches
                          </div>
                        </div>
                      </div>
                      <Select
                        value={pcAssignments[program.id] || ''}
                        onValueChange={(value) => {
                          setPcAssignments(prev => ({
                            ...prev,
                            [program.id]: value
                          }))
                          setHasUnsavedChanges(true)
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Assign PC" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No PC Assigned</SelectItem>
                          {teachers
                            .filter(t => t.role === 'Teacher' || t.role === 'PC')
                            .map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {program.pc && (
                      <div className="mt-2 text-sm text-green-600">
                        Currently assigned: {program.pc.name} ({program.pc.email})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Teacher Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Teacher Assignments
              </CardTitle>
              <CardDescription>
                Assign teachers to Program Coordinators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teachers
                  .filter(t => t.role === 'Teacher')
                  .map((teacher) => (
                  <div
                    key={teacher.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => openTeacherDialog(teacher)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{teacher.name}</h4>
                        <p className="text-sm text-gray-500">{teacher.email}</p>
                        {teacher.teacherToPcs.length > 0 && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              Assigned to {teacher.teacherToPcs.length} PC(s)
                            </Badge>
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Assignment Dialog */}
        <Dialog open={isTeacherDialogOpen} onOpenChange={setIsTeacherDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Teacher Assignments</DialogTitle>
              <DialogDescription>
                Assign {selectedTeacher?.name} to Program Coordinators
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {programs.map((program) => (
                  <div key={program.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={program.id}
                      checked={selectedPCs.includes(program.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPCs(prev => [...prev, program.id])
                        } else {
                          setSelectedPCs(prev => prev.filter(id => id !== program.id))
                        }
                      }}
                    />
                    <label htmlFor={program.id} className="text-sm font-medium">
                      {program.name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsTeacherDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTeacherAssignment}>
                  Save Assignments
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}