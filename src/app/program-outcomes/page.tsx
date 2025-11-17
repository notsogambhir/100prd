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
  Target,
  Upload
} from 'lucide-react'

interface ProgramOutcome {
  id: string
  code: string
  description: string
  program: {
    name: string
  }
  indirectAttainment: number
}

export default function ProgramOutcomesPage() {
  const [programOutcomes, setProgramOutcomes] = useState<ProgramOutcome[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [poForm, setPoForm] = useState({
    code: '',
    description: '',
    programId: ''
  })
  const [editingPO, setEditingPO] = useState<ProgramOutcome | null>(null)

  // Dialog states
  const [poDialogOpen, setPoDialogOpen] = useState(false)

  useEffect(() => {
    fetchProgramOutcomes()
  }, [])

  const fetchProgramOutcomes = async () => {
    try {
      const response = await fetch('/api/program-outcomes')
      if (response.ok) {
        setProgramOutcomes(await response.json())
      }
    } catch (error) {
      console.error('Error fetching program outcomes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPO = async () => {
    try {
      const response = await fetch('/api/program-outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poForm)
      })

      if (response.ok) {
        setPoDialogOpen(false)
        resetForm()
        fetchProgramOutcomes()
      }
    } catch (error) {
      console.error('Error adding program outcome:', error)
    }
  }

  const handleEditPO = (po: ProgramOutcome) => {
    setEditingPO(po)
    setPoForm({
      code: po.code,
      description: po.description,
      programId: po.program.name // This should be programId, but for demo we use name
    })
    setPoDialogOpen(true)
  }

  const handleUpdatePO = async () => {
    if (!editingPO) return

    try {
      // For now, we'll just show a message - update API would need to be implemented
      alert('Update functionality would be implemented here')
      setPoDialogOpen(false)
      resetForm()
      setEditingPO(null)
    } catch (error) {
      console.error('Error updating program outcome:', error)
    }
  }

  const handleDeletePO = async (id: string) => {
    try {
      // For now, we'll just show a message - delete API would need to be implemented
      alert('Delete functionality would be implemented here')
    } catch (error) {
      console.error('Error deleting program outcome:', error)
    }
  }

  const resetForm = () => {
    setPoForm({
      code: '',
      description: '',
      programId: ''
    })
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
            <h1 className="text-3xl font-bold text-gray-900">Program Outcomes</h1>
            <p className="text-gray-600 mt-2">Define program-level learning outcomes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setEditingPO(null); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add PO
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPO ? 'Edit Program Outcome' : 'Add New Program Outcome'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPO ? 'Update program outcome information' : 'Define a new program outcome'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="po-code">PO Code</Label>
                    <Input
                      id="po-code"
                      value={poForm.code}
                      onChange={(e) => setPoForm(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="e.g., PO1"
                      disabled={!!editingPO}
                    />
                  </div>
                  <div>
                    <Label htmlFor="po-description">Description</Label>
                    <textarea
                      id="po-description"
                      className="w-full p-2 border rounded-md min-h-24"
                      value={poForm.description}
                      onChange={(e) => setPoForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the program outcome in detail..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="po-program">Program</Label>
                    <select
                      id="po-program"
                      className="w-full p-2 border rounded-md"
                      value={poForm.programId}
                      onChange={(e) => setPoForm(prev => ({ ...prev, programId: e.target.value }))}
                      disabled={!!editingPO}
                    >
                      <option value="">Select a program</option>
                      <option value="be-ece">BE ECE</option>
                      <option value="be-cse">BE CSE</option>
                      <option value="be-mech">BE MECH</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={editingPO ? handleUpdatePO : handleAddPO}>
                    {editingPO ? 'Update PO' : 'Add PO'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* PO Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total POs</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{programOutcomes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Indirect Data</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {programOutcomes.filter(po => po.indirectAttainment !== null).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Indirect Attainment</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {programOutcomes.length > 0 
                  ? (programOutcomes.reduce((sum, po) => sum + (po.indirectAttainment || 0), 0) / programOutcomes.length).toFixed(1)
                  : '0.0'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Program Outcomes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              All Program Outcomes
            </CardTitle>
            <CardDescription>Manage program-level learning outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {programOutcomes.map((po) => (
                <div key={po.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-sm font-mono">
                        {po.code}
                      </Badge>
                      <span className="text-sm text-gray-600">{po.program.name}</span>
                      {po.indirectAttainment !== null && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Indirect: {po.indirectAttainment}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{po.description}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPO(po)}
                    >
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
                          <AlertDialogTitle>Delete Program Outcome</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {po.code}? This will also remove all CO-PO mappings associated with this outcome.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePO(po.id)}>
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