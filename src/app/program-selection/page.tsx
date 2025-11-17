'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BookOpen, 
  ArrowRight,
  Building
} from 'lucide-react'

interface Program {
  id: string
  name: string
  code: string
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
}

export default function ProgramSelectionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [selectedBatch, setSelectedBatch] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showBatchDialog, setShowBatchDialog] = useState(false)

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs')
      if (response.ok) {
        const data = await response.json()
        // Filter programs based on user role and college
        const filteredPrograms = data.filter((program: Program) => {
          if (user?.role === 'ADMIN' || user?.role === 'UNIVERSITY') {
            return true
          }
          if (user?.role === 'DEPARTMENT' || user?.role === 'PC' || user?.role === 'TEACHER') {
            return program.college.id === user.collegeId
          }
          return false
        })
        setPrograms(filteredPrograms)
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBatches = async (programId: string) => {
    try {
      const response = await fetch(`/api/batches?programId=${programId}`)
      if (response.ok) {
        setBatches(await response.json())
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
  }

  const handleProgramSelect = (programId: string) => {
    setSelectedProgram(programId)
    fetchBatches(programId)
    setShowBatchDialog(true)
  }

  const handleProceed = () => {
    if (selectedProgram && selectedBatch) {
      // Store selection in localStorage
      localStorage.setItem('selectedProgram', selectedProgram)
      localStorage.setItem('selectedBatch', selectedBatch)
      router.push('/')
    }
  }

  // Skip selection for admin and university roles
  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'UNIVERSITY' || user?.role === 'DEPARTMENT') {
      router.push('/')
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Select Your Program & Batch
          </h1>
          <p className="text-lg text-gray-600">
            Choose the program and batch you want to manage for this session
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card 
              key={program.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleProgramSelect(program.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {program.name}
                </CardTitle>
                <CardDescription>
                  {program.code} • {program.college.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Available Batches</span>
                    <span className="font-semibold">{program._count.batches}</span>
                  </div>
                  <Button className="w-full">
                    Select Program
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Batch Selection Dialog */}
        <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Batch</DialogTitle>
              <DialogDescription>
                Choose the batch you want to work with
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Batch</label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name} ({batch.startYear}-{batch.endYear})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleProceed} 
                disabled={!selectedBatch}
                className="w-full"
              >
                Proceed to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}