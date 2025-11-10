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
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Loader2,
  TrendingUp,
  Link
} from 'lucide-react'

interface ProgramOutcome {
  id: string
  code: string
  description: string
  indirectAttainment: number
  programId: string
  createdAt: string
  updatedAt: string
  program: {
    name: string
    code: string
  }
  coPoMappings: Array<{
    co: {
      code: string
      description: string
      course: {
        name: string
        code: string
      }
    }
  }>
}

interface Program {
  id: string
  name: string
  code: string
}

export default function ProgramOutcomes() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [outcomes, setOutcomes] = useState<ProgramOutcome[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [filteredOutcomes, setFilteredOutcomes] = useState<ProgramOutcome[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOutcome, setEditingOutcome] = useState<ProgramOutcome | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [programFilter, setProgramFilter] = useState<string>('')
  const [selectedProgram, setSelectedProgram] = useState<string>('')

  // Form state
  const [outcomeForm, setOutcomeForm] = useState({
    code: '',
    description: '',
    indirectAttainment: 3.0,
    programId: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      const savedProgramId = localStorage.getItem('selectedProgramId')
      
      if (savedProgramId) setSelectedProgram(savedProgramId)
      
      fetchData(savedProgramId)
    }
  }, [session])

  useEffect(() => {
    // Apply filters
    let filtered = outcomes

    if (searchTerm) {
      filtered = filtered.filter(outcome => 
        outcome.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outcome.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (programFilter) {
      filtered = filtered.filter(outcome => outcome.programId === programFilter)
    }

    setFilteredOutcomes(filtered)
  }, [outcomes, searchTerm, programFilter])

  const fetchData = async (programId?: string) => {
    try {
      const [outcomesRes, programsRes] = await Promise.all([
        fetch(`/api/program-outcomes${programId ? `?programId=${programId}` : ''}`),
        fetch('/api/programs')
      ])

      if (outcomesRes.ok) {
        const outcomesData = await outcomesRes.json()
        setOutcomes(outcomesData)
      }

      if (programsRes.ok) {
        const programsData = await programsRes.json()
        setPrograms(programsData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateOutcome = async () => {
    try {
      const response = await fetch('/api/program-outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outcomeForm)
      })

      if (response.ok) {
        await fetchData(selectedProgram)
        setOutcomeForm({
          code: '',
          description: '',
          indirectAttainment: 3.0,
          programId: selectedProgram
        })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to create program outcome:', error)
    }
  }

  const handleUpdateOutcome = async () => {
    if (!editingOutcome) return

    try {
      const response = await fetch(`/api/program-outcomes/${editingOutcome.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outcomeForm)
      })

      if (response.ok) {
        await fetchData(selectedProgram)
        setEditingOutcome(null)
        setOutcomeForm({
          code: '',
          description: '',
          indirectAttainment: 3.0,
          programId: selectedProgram
        })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to update program outcome:', error)
    }
  }

  const handleDeleteOutcome = async (id: string) => {
    try {
      const response = await fetch(`/api/program-outcomes/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchData(selectedProgram)
      }
    } catch (error) {
      console.error('Failed to delete program outcome:', error)
    }
  }

  const openEditDialog = (outcome: ProgramOutcome) => {
    setEditingOutcome(outcome)
    setOutcomeForm({
      code: outcome.code,
      description: outcome.description,
      indirectAttainment: outcome.indirectAttainment,
      programId: outcome.programId
    })
    setIsDialogOpen(true)
  }

  const getAttainmentColor = (value: number) => {
    if (value >= 3.0) return 'bg-green-100 text-green-800'
    if (value >= 2.0) return 'bg-yellow-100 text-yellow-800'
    if (value >= 1.0) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getAttainmentLevel = (value: number) => {
    if (value >= 3.0) return 'Excellent'
    if (value >= 2.0) return 'Good'
    if (value >= 1.0) return 'Satisfactory'
    return 'Needs Improvement'
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
          <h1 className="text-3xl font-bold text-gray-900">Program Outcomes</h1>
          <p className="mt-2 text-gray-600">
            Define and manage program-level learning outcomes
          </p>
        </div>

        {/* Program Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Program Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="program-select">Program</Label>
                <Select value={selectedProgram} onValueChange={(value) => {
                  setSelectedProgram(value)
                  localStorage.setItem('selectedProgramId', value)
                  fetchData(value)
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
              <div className="flex items-end">
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open)
                  if (!open) {
                    setEditingOutcome(null)
                    setOutcomeForm({
                      code: '',
                      description: '',
                      indirectAttainment: 3.0,
                      programId: selectedProgram
                    })
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New PO
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingOutcome ? 'Edit Program Outcome' : 'Create New Program Outcome'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingOutcome ? 'Update program outcome information' : 'Add a new program outcome'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="po-code">PO Code</Label>
                        <Input
                          id="po-code"
                          value={outcomeForm.code}
                          onChange={(e) => setOutcomeForm({ ...outcomeForm, code: e.target.value })}
                          placeholder="e.g., PO1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="po-description">Description</Label>
                        <Textarea
                          id="po-description"
                          value={outcomeForm.description}
                          onChange={(e) => setOutcomeForm({ ...outcomeForm, description: e.target.value })}
                          placeholder="Enter program outcome description"
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="po-indirect">Indirect Attainment (0-3)</Label>
                        <Select value={outcomeForm.indirectAttainment.toString()} onValueChange={(value) => setOutcomeForm({ ...outcomeForm, indirectAttainment: parseFloat(value) })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0 - Not Achieved</SelectItem>
                            <SelectItem value="1">1 - Needs Improvement</SelectItem>
                            <SelectItem value="2">2 - Satisfactory</SelectItem>
                            <SelectItem value="3">3 - Excellent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={editingOutcome ? handleUpdateOutcome : handleCreateOutcome}>
                          {editingOutcome ? 'Update PO' : 'Create PO'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by code or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="program-filter">Program</Label>
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Programs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Programs</SelectItem>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Program Outcomes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Program Outcomes ({filteredOutcomes.length})
            </CardTitle>
            <CardDescription>
              All program outcomes for the selected program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOutcomes.map((outcome) => (
                <div key={outcome.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{outcome.code}</h3>
                      <p className="text-sm text-gray-500">{outcome.program.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(outcome)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Program Outcome</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{outcome.code}"? This will also delete all associated CO-PO mappings. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteOutcome(outcome.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{outcome.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Indirect Attainment</span>
                      <div className="flex items-center space-x-2">
                        <Badge className={getAttainmentColor(outcome.indirectAttainment)}>
                          {outcome.indirectAttainment.toFixed(1)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {getAttainmentLevel(outcome.indirectAttainment)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">CO Mappings</span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Link className="h-3 w-3 mr-1" />
                        {outcome.coPoMappings.length} CO(s) mapped
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredOutcomes.length === 0 && (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No program outcomes found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filters, or create a new program outcome
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}