'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  FileText, 
  Download,
  BarChart3,
  Target,
  TrendingUp,
  Loader2,
  Eye,
  Table
} from 'lucide-react'

interface Course {
  id: string
  code: string
  name: string
  program: {
    name: string
    code: string
  }
  batch: {
    name: string
  }
}

interface ReportData {
  type: 'course-attainment' | 'assessment-comparison'
  course: any
  coSummary?: any[]
  studentBreakdown?: any[]
  assessments?: any[]
  studentScores?: any[]
}

export default function Reports() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedReportType, setSelectedReportType] = useState<'course-attainment' | 'assessment-comparison'>('course-attainment')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchCourses()
    }
  }, [session])

  const fetchCourses = async () => {
    try {
      let url = '/api/courses'
      
      if (session?.user?.role === 'Teacher') {
        url += `?teacherId=${session.user.id}`
      } else if (session?.user?.role === 'PC') {
        const savedProgramId = localStorage.getItem('selectedProgramId')
        const savedBatchId = localStorage.getItem('selectedBatchId')
        if (savedProgramId) url += `?programId=${savedProgramId}`
        if (savedBatchId) url += `${savedProgramId ? '&' : ''}batchId=${savedBatchId}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const coursesData = await response.json()
        setCourses(coursesData)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = async () => {
    if (!selectedCourse || !selectedReportType) return

    setIsGenerating(true)
    try {
      const response = await fetch(`/api/reports?type=${selectedReportType}&courseId=${selectedCourse}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
        setShowPreview(true)
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = async () => {
    if (!reportData) return

    try {
      const response = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: reportData.type,
          courseId: reportData.course.id
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${reportData.type}-report-${Date.now()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }

  const getAttainmentLevelColor = (level: number) => {
    switch (level) {
      case 3: return 'bg-green-100 text-green-800'
      case 2: return 'bg-blue-100 text-blue-800'
      case 1: return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  const getAttainmentLevelText = (level: number) => {
    switch (level) {
      case 3: return 'Excellent'
      case 2: return 'Good'
      case 1: return 'Satisfactory'
      default: return 'Needs Improvement'
    }
  }

  if (status === 'loading' || isLoading) {
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
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-gray-600">
            Generate and download comprehensive attainment reports
          </p>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all ${
              selectedReportType === 'course-attainment' 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedReportType('course-attainment')}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Course Attainment Summary
              </CardTitle>
              <CardDescription>
                Comprehensive CO attainment analysis with student-wise breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Overall CO attainment levels</li>
                <li>• Student-wise performance</li>
                <li>• Target achievement metrics</li>
                <li>• Visual indicators and charts</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              selectedReportType === 'assessment-comparison' 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedReportType('assessment-comparison')}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Assessment Comparison Report
              </CardTitle>
              <CardDescription>
                Compare student performance across different assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Assessment-wise scores</li>
                <li>• Performance trends</li>
                <li>• Comparative analysis</li>
                <li>• Statistical summaries</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Report Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>
              Select the course and generate your report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-gray-700">Select Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Report Type</label>
                <Select value={selectedReportType} onValueChange={(value: any) => setSelectedReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course-attainment">Course Attainment Summary</SelectItem>
                    <SelectItem value="assessment-comparison">Assessment Comparison</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button 
                  onClick={generateReport}
                  disabled={!selectedCourse || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Report Preview</span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </DialogTitle>
              <DialogDescription>
                Preview of the generated report. Download as PDF for sharing.
              </DialogDescription>
            </DialogHeader>

            {reportData && (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold">
                    {reportData.type === 'course-attainment' ? 'Course Attainment Summary' : 'Assessment Comparison Report'}
                  </h2>
                  <div className="text-sm text-gray-600 mt-2">
                    <p>Course: {reportData.course.code} - {reportData.course.name}</p>
                    <p>Program: {reportData.course.program?.name}</p>
                    <p>Batch: {reportData.course.batch?.name}</p>
                    {reportData.course.section && <p>Section: {reportData.course.section.name}</p>}
                    <p>Generated: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Course Attainment Report Content */}
                {reportData.type === 'course-attainment' && reportData.coSummary && (
                  <>
                    {/* CO Attainment Summary */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Overall CO Attainment</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 px-4 py-2 text-left">CO Code</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                              <th className="border border-gray-300 px-4 py-2 text-center">Students Meeting Target</th>
                              <th className="border border-gray-300 px-4 py-2 text-center">Percentage</th>
                              <th className="border border-gray-300 px-4 py-2 text-center">Attainment Level</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.coSummary.map((co: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2 font-medium">{co.coCode}</td>
                                <td className="border border-gray-300 px-4 py-2">{co.description}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                  {co.studentsMeetingTarget}/{co.totalStudents}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                  {co.percentageMeetingTarget.toFixed(1)}%
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs ${getAttainmentLevelColor(co.attainmentLevel)}`}>
                                    {getAttainmentLevelText(co.attainmentLevel)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Student Breakdown */}
                    {reportData.studentBreakdown && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Student-wise Breakdown</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-4 py-2 text-left">Roll Number</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Student Name</th>
                                {reportData.coSummary?.map((co: any) => (
                                  <th key={co.coCode} className="border border-gray-300 px-4 py-2 text-center">
                                    {co.coCode}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.studentBreakdown.map((student: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 px-4 py-2">{student.rollNumber}</td>
                                  <td className="border border-gray-300 px-4 py-2">{student.studentName}</td>
                                  {reportData.coSummary?.map((co: any) => {
                                    const coData = student.coData[co.coCode]
                                    return (
                                      <td 
                                        key={co.coCode} 
                                        className={`border border-gray-300 px-4 py-2 text-center ${
                                          coData?.meetsTarget ? 'bg-green-50' : 'bg-red-50'
                                        }`}
                                      >
                                        {coData?.percentage.toFixed(1)}%
                                      </td>
                                    )
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Assessment Comparison Report Content */}
                {reportData.type === 'assessment-comparison' && reportData.studentScores && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Assessment Performance Comparison</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left">Roll Number</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Student Name</th>
                            {reportData.assessments?.map((assessment: any) => (
                              <th key={assessment.id} className="border border-gray-300 px-4 py-2 text-center">
                                {assessment.name}
                                <br />
                                <span className="text-xs text-gray-500">({assessment.type})</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.studentScores.map((student: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2">{student.rollNumber}</td>
                              <td className="border border-gray-300 px-4 py-2">{student.studentName}</td>
                              {reportData.assessments?.map((assessment: any) => {
                                const assessmentData = student.assessments[assessment.id]
                                return (
                                  <td key={assessment.id} className="border border-gray-300 px-4 py-2 text-center">
                                    {assessmentData ? (
                                      <>
                                        {assessmentData.percentage.toFixed(1)}%
                                        <br />
                                        <span className="text-xs text-gray-500">
                                          {assessmentData.obtained}/{assessmentData.maxMarks}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}