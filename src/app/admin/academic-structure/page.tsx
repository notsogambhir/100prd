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
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  BookOpen,
  Loader2
} from 'lucide-react'

interface College {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  _count: {
    programs: number
    users: number
  }
}

interface Program {
  id: string
  name: string
  code?: string
  description?: string
  duration: number
  collegeId: string
  createdAt: string
  updatedAt: string
  _count: {
    batches: number
    courses: number
  }
}

interface Batch {
  id: string
  name: string
  startYear: number
  endYear: number
  programId: string
  createdAt: string
  updatedAt: string
}

export default function AcademicStructure() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [colleges, setColleges] = useState<College[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedCollege, setSelectedCollege] = useState<string>('')
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Form states
  const [collegeForm, setCollegeForm] = useState({ name: '', description: '' })
  const [programForm, setProgramForm] = useState({ 
    name: '', 
    code: '', 
    description: '', 
    duration: 4, 
    collegeId: '' 
  })
  const [batchForm, setBatchForm] = useState({ startYear: new Date().getFullYear() })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [collegesRes, programsRes, batchesRes] = await Promise.all([
        fetch('/api/colleges'),
        fetch('/api/programs'),
        fetch('/api/batches')
      ])

      if (collegesRes.ok) {
        const collegesData = await collegesRes.json()
        setColleges(collegesData)
      }

      if (programsRes.ok) {
        const programsData = await programsRes.json()
        setPrograms(programsData)
      }

      if (batchesRes.ok) {
        const batchesData = await batchesRes.json()
        setBatches(batchesData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCollege = async () => {
    try {
      const response = await fetch('/api/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...collegeForm,
          createdBy: session?.user?.id
        })
      })

      if (response.ok) {
        await fetchData()
        setCollegeForm({ name: '', description: '' })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to create college:', error)
    }
  }

  const handleCreateProgram = async () => {
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...programForm,
          createdBy: session?.user?.id
        })
      })

      if (response.ok) {
        await fetchData()
        setProgramForm({ name: '', code: '', description: '', duration: 4, collegeId: '' })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to create program:', error)
    }
  }

  const handleCreateBatch = async () => {
    if (!selectedProgram) return

    try {
      const program = programs.find(p => p.id === selectedProgram)
      const endYear = batchForm.startYear + (program?.duration || 4)

      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${batchForm.startYear}-${endYear}`,
          startYear: batchForm.startYear,
          endYear,
          programId: selectedProgram,
          createdBy: session?.user?.id
        })
      })

      if (response.ok) {
        await fetchData()
        setBatchForm({ startYear: new Date().getFullYear() })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to create batch:', error)
    }
  }

  const handleDeleteCollege = async (id: string) => {
    try {
      const response = await fetch(`/api/colleges/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to delete college:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== 'Admin') {
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
          <h1 className="text-3xl font-bold text-gray-900">Academic Structure</h1>
          <p className="mt-2 text-gray-600">
            Manage colleges, programs, and batches for the institution
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colleges Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <CardTitle>Colleges</CardTitle>
                </div>
                <Dialog open={isDialogOpen && editingItem?.type === 'college'} onOpenChange={(open) => {
                  setIsDialogOpen(open)
                  if (!open) {
                    setEditingItem(null)
                    setCollegeForm({ name: '', description: '' })
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      onClick={() => setEditingItem({ type: 'college' })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New College</DialogTitle>
                      <DialogDescription>
                        Add a new college to the institution
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="college-name">College Name</Label>
                        <Input
                          id="college-name"
                          value={collegeForm.name}
                          onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                          placeholder="Enter college name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="college-description">Description</Label>
                        <Textarea
                          id="college-description"
                          value={collegeForm.description}
                          onChange={(e) => setCollegeForm({ ...collegeForm, description: e.target.value })}
                          placeholder="Enter college description"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateCollege}>
                          Create College
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {colleges.map((college) => (
                  <div key={college.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{college.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {college._count.programs} programs
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            {college._count.users} users
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
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
                              <AlertDialogTitle>Delete College</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{college.name}"? This will also delete all associated programs, batches, courses, and data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCollege(college.id)}>
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

          {/* Programs Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <CardTitle>Programs</CardTitle>
                </div>
                <Dialog open={isDialogOpen && editingItem?.type === 'program'} onOpenChange={(open) => {
                  setIsDialogOpen(open)
                  if (!open) {
                    setEditingItem(null)
                    setProgramForm({ name: '', code: '', description: '', duration: 4, collegeId: '' })
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      onClick={() => setEditingItem({ type: 'program' })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Program</DialogTitle>
                      <DialogDescription>
                        Add a new academic program
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="program-name">Program Name</Label>
                        <Input
                          id="program-name"
                          value={programForm.name}
                          onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                          placeholder="Enter program name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="program-code">Program Code</Label>
                        <Input
                          id="program-code"
                          value={programForm.code}
                          onChange={(e) => setProgramForm({ ...programForm, code: e.target.value })}
                          placeholder="Enter program code"
                        />
                      </div>
                      <div>
                        <Label htmlFor="program-college">College</Label>
                        <select
                          id="program-college"
                          value={programForm.collegeId}
                          onChange={(e) => setProgramForm({ ...programForm, collegeId: e.target.value })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select a college</option>
                          {colleges.map((college) => (
                            <option key={college.id} value={college.id}>
                              {college.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="program-duration">Duration (years)</Label>
                        <Input
                          id="program-duration"
                          type="number"
                          value={programForm.duration}
                          onChange={(e) => setProgramForm({ ...programForm, duration: parseInt(e.target.value) })}
                          min="1"
                          max="10"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateProgram}>
                          Create Program
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {programs.map((program) => (
                  <div key={program.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{program.name}</h3>
                        {program.code && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {program.code}
                          </Badge>
                        )}
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {program._count.batches} batches
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            {program._count.courses} courses
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Batches Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <CardTitle>Batches</CardTitle>
                </div>
                <Dialog open={isDialogOpen && editingItem?.type === 'batch'} onOpenChange={(open) => {
                  setIsDialogOpen(open)
                  if (!open) {
                    setEditingItem(null)
                    setBatchForm({ startYear: new Date().getFullYear() })
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      onClick={() => setEditingItem({ type: 'batch' })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Batch</DialogTitle>
                      <DialogDescription>
                        Add a new academic batch
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="batch-program">Program</Label>
                        <select
                          id="batch-program"
                          value={selectedProgram}
                          onChange={(e) => setSelectedProgram(e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select a program</option>
                          {programs.map((program) => (
                            <option key={program.id} value={program.id}>
                              {program.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="batch-start-year">Start Year</Label>
                        <Input
                          id="batch-start-year"
                          type="number"
                          value={batchForm.startYear}
                          onChange={(e) => setBatchForm({ startYear: parseInt(e.target.value) })}
                          min="2020"
                          max="2030"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateBatch} disabled={!selectedProgram}>
                          Create Batch
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {batches.map((batch) => (
                  <div key={batch.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{batch.name}</h3>
                        <p className="text-sm text-gray-500">
                          {batch.startYear} - {batch.endYear}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}