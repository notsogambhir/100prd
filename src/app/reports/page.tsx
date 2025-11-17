'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  FileText, 
  Download, 
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Loader2,
  Eye
} from 'lucide-react'
import { PDFGenerator } from '@/lib/pdf-generator'
import { AttainmentCalculator } from '@/lib/attainment/calculator'

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedScope, setSelectedScope] = useState('overall')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedProgram, setSelectedProgram] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDropdownData()
  }, [])

  const fetchDropdownData = async () => {
    try {
      const [coursesRes, programsRes, batchesRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/programs'),
        fetch('/api/batches')
      ])

      if (coursesRes.ok) setCourses(await coursesRes.json())
      if (programsRes.ok) setPrograms(await programsRes.json())
      if (batchesRes.ok) setBatches(await batchesRes.json())
    } catch (error) {
      console.error('Error fetching dropdown data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!selectedReport || (!selectedCourse && selectedReport !== 'po-attainment')) {
      alert('Please select required fields')
      return
    }

    setIsGenerating(true)
    try {
      let data = null

      switch (selectedReport) {
        case 'course-attainment':
          data = await AttainmentCalculator.generateCourseAttainmentReport(
            selectedCourse,
            selectedScope === 'overall' ? undefined : selectedScope
          )
          break
        case 'po-attainment':
          data = await AttainmentCalculator.generateAllPOAttainments(selectedProgram)
          break
        case 'assessment-comparison':
          // Implementation for assessment comparison
          break
        case 'student-performance':
          // Implementation for student performance
          break
      }

      setReportData(data)
      setShowPreview(true)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!reportData) return

    try {
      switch (selectedReport) {
        case 'course-attainment':
          await PDFGenerator.generateCourseAttainmentReport(reportData)
          break
        case 'po-attainment':
          await PDFGenerator.generatePOAttainmentReport(reportData)
          break
        default:
          alert('PDF generation not available for this report type')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }
  const reportTypes = [
    {
      id: 'course-attainment',
      title: 'Course Attainment Summary',
      description: 'View CO attainment levels for individual courses',
      icon: BookOpen,
      filters: ['course', 'scope']
    },
    {
      id: 'assessment-comparison',
      title: 'Assessment Comparison Report',
      description: 'Compare student performance across different assessments',
      icon: BarChart3,
      filters: ['course']
    },
    {
      id: 'po-attainment',
      title: 'Program Outcome Attainment',
      description: 'Overall PO attainment levels for the program',
      icon: TrendingUp,
      filters: ['program', 'batch']
    },
    {
      id: 'student-performance',
      title: 'Student Performance Report',
      description: 'Individual student performance analysis',
      icon: Users,
      filters: ['student', 'course']
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and download various attainment reports</p>
        </div>

        {/* Report Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Select Report Type
            </CardTitle>
            <CardDescription>Choose the type of report you want to generate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((report) => (
                <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <report.icon className="h-5 w-5" />
                      {report.title}
                    </CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {report.filters.map((filter) => (
                        <span key={filter} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          {filter}
                        </span>
                      ))}
                    </div>
                    <Button className="w-full">
                      Select Report
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Generation Area */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>Configure your report parameters and generate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Scope</label>
                <Select value={selectedScope} onValueChange={setSelectedScope}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">Overall Course</SelectItem>
                    {batches
                      .filter(batch => {
                        const course = courses.find(c => c.id === selectedCourse)
                        return course && course.batchId === batch.id
                      })
                      .map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Batch</label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="min-w-48"
                onClick={handleGenerateReport}
                disabled={isGenerating || !selectedReport || (!selectedCourse && selectedReport !== 'po-attainment')}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Previously generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Course Attainment - Mathematics I</p>
                  <p className="text-sm text-gray-600">Generated on Nov 15, 2024 • Section A</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">PO Attainment - BE ECE</p>
                  <p className="text-sm text-gray-600">Generated on Nov 14, 2024 • 2025-2029</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Assessment Comparison - Physics I</p>
                  <p className="text-sm text-gray-600">Generated on Nov 13, 2024 • Overall</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <div>
                  <DialogTitle>Report Preview</DialogTitle>
                  <DialogDescription>
                    Review your generated report before downloading
                  </DialogDescription>
                </div>
                <Button onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </DialogHeader>
            <div className="mt-4">
              {reportData && (
                <div className="space-y-6">
                  {selectedReport === 'course-attainment' && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-4">CO Attainment Summary</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-300 p-2 text-left">CO Code</th>
                                <th className="border border-gray-300 p-2 text-left">CO Description</th>
                                <th className="border border-gray-300 p-2 text-center">Target %</th>
                                <th className="border border-gray-300 p-2 text-center">Students Meeting Target</th>
                                <th className="border border-gray-300 p-2 text-center">Attainment %</th>
                                <th className="border border-gray-300 p-2 text-center">Attainment Level</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.coAttainments?.map((co: any) => (
                                <tr key={co.id}>
                                  <td className="border border-gray-300 p-2 font-medium">{co.code}</td>
                                  <td className="border border-gray-300 p-2">{co.description}</td>
                                  <td className="border border-gray-300 p-2 text-center">{co.target}%</td>
                                  <td className="border border-gray-300 p-2 text-center">{co.studentsMeetingTarget}</td>
                                  <td className="border border-gray-300 p-2 text-center font-bold">{co.percentageMeetingTarget.toFixed(1)}%</td>
                                  <td className="border border-gray-300 p-2 text-center font-bold">
                                    <span className={`px-2 py-1 rounded text-white text-sm ${
                                      co.attainmentLevel === 3 ? 'bg-red-600' :
                                      co.attainmentLevel === 2 ? 'bg-orange-600' :
                                      co.attainmentLevel === 1 ? 'bg-yellow-600' : 'bg-gray-600'
                                    }`}>
                                      Level {co.attainmentLevel}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}