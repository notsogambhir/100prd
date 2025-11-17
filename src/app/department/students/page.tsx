'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  GraduationCap,
  Search,
  Filter,
  Upload,
  Download
} from 'lucide-react'

interface Student {
  id: string
  registerNo: string
  name: string
  email?: string
  status: string
  sectionId?: string
  section?: {
    name: string
    batch: {
      name: string
    }
  }
  createdAt: string
}

interface Section {
  id: string
  name: string
  batchId: string
  batch: {
    name: string
  }
}

interface Batch {
  id: string
  name: string
  startYear: number
  endYear: number
}

interface Program {
  id: string
  name: string
  code: string
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [selectedBatch, setSelectedBatch] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')

  // Form states
  const [studentForm, setStudentForm] = useState({
    registerNo: '',
    name: '',
    email: '',
    status: 'ACTIVE',
    sectionId: ''
  })
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [sectionForm, setSectionForm] = useState({ name: '' })
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsRes, sectionsRes, batchesRes, programsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/sections'),
        fetch('/api/batches'),
        fetch('/api/programs')
      ])

      if (studentsRes.ok) setStudents(await studentsRes.json())
      if (sectionsRes.ok) setSections(await sectionsRes.json())
      if (batchesRes.ok) setBatches(await batchesRes.json())
      if (programsRes.ok) setPrograms(await programsRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async () => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      })

      if (response.ok) {
        setStudentDialogOpen(false)
        resetStudentForm()
        fetchData()
      }
    } catch (error) {
      console.error('Error adding student:', error)
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setStudentForm({
      registerNo: student.registerNo,
      name: student.name,
      email: student.email || '',
      status: student.status,
      sectionId: student.sectionId || ''
    })
    setStudentDialogOpen(true)
  }

  const handleUpdateStudent = async () => {
    if (!editingStudent) return

    try {
      const response = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      })

      if (response.ok) {
        setStudentDialogOpen(false)
        resetStudentForm()
        setEditingStudent(null)
        fetchData()
      }
    } catch (error) {
      console.error('Error updating student:', error)
    }
  }

  const handleDeleteStudent = async (id: string) => {
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting student:', error)
    }
  }

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/students/bulk-upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setUploadDialogOpen(false)
        fetchData()
        alert('Students uploaded successfully!')
      } else {
        alert('Upload failed. Please check the file format.')
      }
    } catch (error) {
      console.error('Error uploading students:', error)
      alert('Upload failed. Please try again.')
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/students/template')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'student-template.xlsx'
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading template:', error)
      alert('Failed to download template')
    }
  }

  const handleAddSection = async () => {
    if (!sectionForm.name || !selectedBatch) return

    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sectionForm.name,
          batchId: selectedBatch
        })
      })

      if (response.ok) {
        setSectionDialogOpen(false)
        setSectionForm({ name: '' })
        fetchData()
      }
    } catch (error) {
      console.error('Error adding section:', error)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting section:', error)
    }
  }

  const resetStudentForm = () => {
    setStudentForm({
      registerNo: '',
      name: '',
      email: '',
      status: 'ACTIVE',
      sectionId: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      case 'GRADUATED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Active'
      case 'INACTIVE': return 'Inactive'
      case 'GRADUATED': return 'Graduated'
      default: return status
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.registerNo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    const matchesProgram = !selectedProgram || student.section?.batch?.programId === selectedProgram
    const matchesBatch = !selectedBatch || student.section?.batchId === selectedBatch
    const matchesSection = !selectedSection || student.sectionId === selectedSection
    return matchesSearch && matchesStatus && matchesProgram && matchesBatch && matchesSection
  })

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
            <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600 mt-2">Manage student enrollment and sections</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Program</label>
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
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
              <div>
                <label className="text-sm font-medium">Batch</label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Batches</SelectItem>
                    {batches
                      .filter(batch => !selectedProgram || batch.programId === selectedProgram)
                      .map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Section</label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sections</SelectItem>
                    {sections
                      .filter(section => !selectedProgram || !selectedBatch || section.batchId === selectedBatch)
                      .map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="GRADUATED">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Management */}
        {selectedBatch && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Sections</CardTitle>
                <Button onClick={() => setSectionDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sections
                  .filter(section => section.batchId === selectedBatch)
                  .map((section) => (
                    <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{section.name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Students ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Register No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.registerNo}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(student.status)}>
                        {getStatusLabel(student.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.section?.name || 'N/A'}</TableCell>
                    <TableCell>{student.section?.batch?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
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
                              <AlertDialogTitle>Delete Student</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {student.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteStudent(student.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Student Dialog */}
        <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </DialogTitle>
              <DialogDescription>
                {editingStudent ? 'Update student information' : 'Add a new student to the system'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Register No</label>
                <Input
                  value={studentForm.registerNo}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, registerNo: e.target.value }))}
                  disabled={!!editingStudent}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={studentForm.name}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={studentForm.status} onValueChange={(value) => setStudentForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="GRADUATED">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Section</label>
                <Select value={studentForm.sectionId} onValueChange={(value) => setStudentForm(prev => ({ ...prev, sectionId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sections</SelectItem>
                    {sections
                      .filter(section => !selectedProgram || !selectedBatch || section.batchId === selectedBatch)
                      .map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={editingStudent ? handleUpdateStudent : handleAddStudent}>
                {editingStudent ? 'Update Student' : 'Add Student'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Upload Students</DialogTitle>
              <DialogDescription>
                Upload student data from an Excel file
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Excel File</label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      console.log('Selected file:', file.name)
                    }
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="text-sm text-gray-600">
                Upload a file with columns: Register No, Name, Email, Status, Section
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkUpload}>
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Section Dialog */}
        <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
              <DialogDescription>
                Create a new section for the selected batch
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Section Name</label>
                <Input
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter section name (e.g., A, B, C)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddSection} disabled={!sectionForm.name}>
                Add Section
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}