'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  ArrowLeft
} from 'lucide-react'

interface Course {
  id: string
  code: string
  name: string
  program: {
    name: string
  }
  batch: {
    name: string
  }
  section?: {
    name: string
  }
}

interface Assessment {
  id: string
  name: string
  type: string
  course: {
    code: string
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

function TeacherReportsContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  const assessmentId = searchParams.get('assessmentId')

  const [courses, setCourses] = useState<Course[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '')
  const [selectedAssessment, setSelectedAssessment] = useState<string>(assessmentId || '')
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
      fetchTeacherData()
    }
  }, [session])

  const fetchTeacherData = async () => {
    try {
      const [coursesRes, assessmentsRes] = await Promise.all([
        fetch(`/api/courses?teacherId=${session?.user?.id}`),
        fetch(`/api/assessments?teacherId=${session?.user?.id}`)
      ])

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData)
      }

      if (assessmentsRes.ok) {
        const assessmentsData = await assessmentsRes.json()
        setAssessments(assessmentsData)
      }
    } catch (error) {
      console.error('Failed to fetch teacher data:', error)
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
        a.download = `teacher-${reportData.type}-report-${Date.now()}.pdf`
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== 'Teacher') {
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
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/teacher/assessments')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assessments
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="mt-2 text-gray-600">
            Generate and download reports for your assigned courses
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
                View CO attainment analysis for your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Student-wise CO performance</li>
                <li>• Target achievement metrics</li>
                <li>• Overall attainment levels</li>
                <li>• Detailed breakdown tables</li>
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
                Assessment Performance
              </CardTitle>
              <CardDescription>
                Compare student performance across assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Assessment-wise scores</li>
                <li>• Performance trends</li>
                <li>• Class statistics</li>
                <li>• Grade distributions</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Report Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>
              Select a course to generate your report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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
                Preview of your generated report. Download as PDF for sharing.
              </DialogDescription>
            </DialogHeader>

            {reportData && (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold">
                    {reportData.type === 'course-attainment' ? 'Course Attainment Summary' : 'Assessment Performance Report'}
                  </h2>
                  <div className="text-sm text-gray-600 mt-2">
                    <p>Course: {reportData.course.code} - {reportData.course.name}</p>
                    <p>Program: {reportData.course.program?.name}</p>
                    <p>Batch: {reportData.course.batch?.name}</p>
                    {reportData.course.section && <p>Section: {reportData.course.section.name}</p>}
                    <p>Generated: {new Date().toLocaleDateString()}</p>
                    <p>Generated by: {session?.user?.name}</p>
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
                        <h3 className="text-lg font-semibold mb-4">Student Performance Breakdown</h3>
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

export default function TeacherReports() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <TeacherReportsContent />
    </Suspense>
  )
}