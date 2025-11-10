'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, BookOpen, Users, Calendar } from 'lucide-react'
import { useMockSession } from '@/hooks/use-mock-session'

interface Program {
  id: string
  name: string
  code?: string
  description?: string
  college: {
    name: string
  }
  batches: Array<{
    id: string
    name: string
    startYear: number
    endYear: number
  }>
}

export default function ProgramSelection() {
  const { session, isLoading } = useMockSession()
  const [programsLoading, setProgramsLoading] = useState(true)
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [selectedBatch, setSelectedBatch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchPrograms()
    }
  }, [session])

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs')
      if (response.ok) {
        const data = await response.json()
        setPrograms(data)
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error)
    } finally {
      setProgramsLoading(false)
    }
  }

  const handleProgramSelect = (program: Program) => {
    setSelectedProgram(program)
    setIsDialogOpen(true)
  }

  const handleProceed = async () => {
    if (!selectedProgram || !selectedBatch) return

    try {
      // Store selection in localStorage or session storage
      localStorage.setItem('selectedProgramId', selectedProgram.id)
      localStorage.setItem('selectedBatchId', selectedBatch)
      
      router.push('/welcome')
    } catch (error) {
      console.error('Failed to save selection:', error)
    }
  }

  if (isLoading || programsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">Please sign in to access the portal.</p>
          <Button 
            className="mt-4"
            onClick={() => router.push('/auth/signin')}
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Select Your Program</h1>
          <p className="mt-2 text-gray-600">
            Choose the academic program you want to manage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card 
              key={program.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleProgramSelect(program)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <Badge variant="secondary">{program.college.name}</Badge>
                </div>
                <CardTitle className="text-lg">{program.name}</CardTitle>
                {program.code && (
                  <CardDescription>Code: {program.code}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {program.description && (
                  <p className="text-sm text-gray-600 mb-4">{program.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {program.batches.length} batches available
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {programs.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No programs available</h3>
            <p className="mt-1 text-sm text-gray-500">
              No programs have been assigned to your account yet.
            </p>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Batch</DialogTitle>
              <DialogDescription>
                Choose the academic batch for {selectedProgram?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Academic Batch</label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProgram?.batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {batch.name} ({batch.startYear}-{batch.endYear})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProceed} disabled={!selectedBatch}>
                  Proceed
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}