'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  BookOpen, 
  Calendar,
  Users
} from 'lucide-react'

interface College {
  id: string
  name: string
  code: string
  _count: {
    programs: number
  }
}

interface Program {
  id: string
  name: string
  code: string
  duration: number
  collegeId: string
  college: {
    name: string
  }
  _count: {
    batches: number
  }
}

interface Batch {
  id: string
  name: string
  startYear: number
  endYear: number
  programId: string
  program: {
    name: string
  }
}

export default function AcademicStructurePage() {
  const [colleges, setColleges] = useState<College[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Form states
  const [collegeForm, setCollegeForm] = useState({ name: '', code: '' })
  const [programForm, setProgramForm] = useState({ name: '', code: '', duration: 4, collegeId: '' })
  const [batchForm, setBatchForm] = useState({ startYear: new Date().getFullYear() })

  // Dialog states
  const [collegeDialogOpen, setCollegeDialogOpen] = useState(false)
  const [programDialogOpen, setProgramDialogOpen] = useState(false)
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [collegesRes, programsRes, batchesRes] = await Promise.all([
        fetch('/api/colleges'),
        fetch('/api/programs'),
        fetch('/api/batches')
      ])

      if (collegesRes.ok) setColleges(await collegesRes.json())
      if (programsRes.ok) setPrograms(await programsRes.json())
      if (batchesRes.ok) setBatches(await batchesRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCollege = async () => {
    try {
      const response = await fetch('/api/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collegeForm)
      })

      if (response.ok) {
        setCollegeDialogOpen(false)
        setCollegeForm({ name: '', code: '' })
        fetchData()
      }
    } catch (error) {
      console.error('Error adding college:', error)
    }
  }

  const handleAddProgram = async () => {
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programForm)
      })

      if (response.ok) {
        setProgramDialogOpen(false)
        setProgramForm({ name: '', code: '', duration: 4, collegeId: '' })
        fetchData()
      }
    } catch (error) {
      console.error('Error adding program:', error)
    }
  }

  const handleAddBatch = async () => {
    if (!selectedProgram) return

    try {
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...batchForm,
          programId: selectedProgram
        })
      })

      if (response.ok) {
        setBatchDialogOpen(false)
        setBatchForm({ startYear: new Date().getFullYear() })
        fetchData()
      }
    } catch (error) {
      console.error('Error adding batch:', error)
    }
  }

  const handleDeleteCollege = async (id: string) => {
    try {
      const response = await fetch(`/api/colleges/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting college:', error)
    }
  }

  const handleDeleteProgram = async (id: string) => {
    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting program:', error)
    }
  }

  const handleDeleteBatch = async (id: string) => {
    try {
      const response = await fetch(`/api/batches/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting batch:', error)
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Structure</h1>
          <p className="text-gray-600 mt-2">Manage colleges, programs, and batches</p>
        </div>

        {/* Colleges Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Manage Colleges
                </CardTitle>
                <CardDescription>Add and manage educational institutions</CardDescription>
              </div>
              <Dialog open={collegeDialogOpen} onOpenChange={setCollegeDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add College
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New College</DialogTitle>
                    <DialogDescription>
                      Create a new college in the system
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="college-name">College Name</Label>
                      <Input
                        id="college-name"
                        value={collegeForm.name}
                        onChange={(e) => setCollegeForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter college name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="college-code">College Code</Label>
                      <Input
                        id="college-code"
                        value={collegeForm.code}
                        onChange={(e) => setCollegeForm(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Enter college code"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddCollege}>Add College</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {colleges.map((college) => (
                <div key={college.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{college.name}</p>
                    <p className="text-sm text-gray-600">Code: {college.code}</p>
                    <Badge variant="secondary" className="mt-1">
                      {college._count.programs} programs
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
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
                          <AlertDialogTitle>Delete College</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {college.name}? This will also delete all associated programs, batches, and courses. This action cannot be undone.
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
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Programs Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Manage Programs
                </CardTitle>
                <CardDescription>Add and manage academic programs</CardDescription>
              </div>
              <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Program
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Program</DialogTitle>
                    <DialogDescription>
                      Create a new academic program
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="program-name">Program Name</Label>
                      <Input
                        id="program-name"
                        value={programForm.name}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter program name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="program-code">Program Code</Label>
                      <Input
                        id="program-code"
                        value={programForm.code}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Enter program code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="program-duration">Duration (years)</Label>
                      <Input
                        id="program-duration"
                        type="number"
                        value={programForm.duration}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="program-college">College</Label>
                      <select
                        id="program-college"
                        className="w-full p-2 border rounded-md"
                        value={programForm.collegeId}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, collegeId: e.target.value }))}
                      >
                        <option value="">Select a college</option>
                        {colleges.map((college) => (
                          <option key={college.id} value={college.id}>
                            {college.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddProgram}>Add Program</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {programs.map((program) => (
                <div key={program.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{program.name}</p>
                    <p className="text-sm text-gray-600">Code: {program.code} • {program.duration} years</p>
                    <p className="text-sm text-gray-600">{program.college.name}</p>
                    <Badge variant="secondary" className="mt-1">
                      {program._count.batches} batches
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
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
                          <AlertDialogTitle>Delete Program</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {program.name}? This will also delete all associated batches and courses. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteProgram(program.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Batches Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Manage Batches
                </CardTitle>
                <CardDescription>Add and manage student batches</CardDescription>
              </div>
              <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Batch
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Batch</DialogTitle>
                    <DialogDescription>
                      Create a new student batch
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="batch-program">Program</Label>
                      <select
                        id="batch-program"
                        className="w-full p-2 border rounded-md"
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                      >
                        <option value="">Select a program</option>
                        {programs.map((program) => (
                          <option key={program.id} value={program.id}>
                            {program.name} ({program.college.name})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="batch-start">Start Year</Label>
                      <Input
                        id="batch-start"
                        type="number"
                        value={batchForm.startYear}
                        onChange={(e) => setBatchForm(prev => ({ ...prev, startYear: parseInt(e.target.value) }))}
                        min="2020"
                        max="2030"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddBatch} disabled={!selectedProgram}>
                      Add Batch
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {batches.map((batch) => (
                <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{batch.name}</p>
                    <p className="text-sm text-gray-600">{batch.program.name}</p>
                    <p className="text-sm text-gray-600">{batch.startYear} - {batch.endYear}</p>
                  </div>
                  <div className="flex space-x-2">
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
                          <AlertDialogTitle>Delete Batch</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {batch.name}? This will also delete all associated sections and courses. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteBatch(batch.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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