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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { 
  TrendingUp, 
  Target, 
  Activity, 
  BarChart3,
  PieChart,
  Users,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react'

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [selectedBatch, setSelectedBatch] = useState<string>('')
  const [timeRange, setTimeRange] = useState<string>('semester')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchAnalyticsData()
    }
  }, [session, selectedProgram, selectedBatch, timeRange])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        programId: selectedProgram,
        batchId: selectedBatch,
        timeRange
      })

      const response = await fetch(`/api/analytics/dashboard?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAttainmentStatus = (value: number) => {
    if (value >= 2.5) return { status: 'excellent', color: '#10b981', icon: Award }
    if (value >= 2.0) return { status: 'good', color: '#3b82f6', icon: CheckCircle }
    if (value >= 1.5) return { status: 'satisfactory', color: '#f59e0b', icon: Clock }
    return { status: 'needs-improvement', color: '#ef4444', icon: AlertTriangle }
  }

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return '#10b981'
    if (value >= 60) return '#3b82f6'
    if (value >= 40) return '#f59e0b'
    return '#ef4444'
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || !analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Loading Analytics...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive insights and attainment analytics
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Program</label>
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Programs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Programs</SelectItem>
                    {/* Programs would be populated from API */}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Batch</label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Batches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Batches</SelectItem>
                    {/* Batches would be populated from API */}
                  </SelectContent>
                </SelectContent>
              </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Time Range</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="semester">This Semester</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </SelectContent>
              </SelectTrigger>
              </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={fetchAnalyticsData}>
                  <Activity className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.programOverview?.totalCourses || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.programOverview?.totalStudents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-500">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Attainment</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.programOverview?.averageAttainment?.toFixed(1) || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-500">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.programOverview?.completionRate?.toFixed(1) || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* PO Attainment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                PO Attainment Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={analyticsData?.poAttainment?.map(po => ({
                      name: po.code,
                      value: po.overallAttainment,
                      fill: getAttainmentStatus(po.overallAttainment).color
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Tooltip />
                  </PieChart>
                </RePieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {analyticsData?.poAttainment?.map((po, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: getAttainmentStatus(po.overallAttainment).color }}></div>
                      <span className="text-sm">{po.code}</span>
                    </div>
                    <span className="text-sm font-medium">{po.overallAttainment.toFixed(2)}</span>
                  </div>
                ))}
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Course Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Course Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData?.coursePerformance?.map(course => ({
                  name: course.code,
                  averageScore: course.averageScore,
                  attainmentRate: course.attainmentRate
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="averageScore" fill="#8884d8" name="Avg Score" />
                  <Bar dataKey="attainmentRate" fill="#82ca9d" name="Attainment %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Trends Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Attainment Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Attainment Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analyticsData?.trends?.monthlyAttainment || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="averageAttainment" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            </CardContent>
          </Card>

          {/* Assessment Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={[
                  { range: '0-40', count: Math.floor(totalStudents * 0.15), percentage: 15 },
                  { range: '40-60', count: Math.floor(totalStudents * 0.35), percentage: 35 },
                  { range: '60-80', count: Math.floor(totalStudents * 0.35), percentage: 35 },
                  { range: '80-100', count: Math.floor(totalStudents * 0.15), percentage: 15 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip formatter={(value: any, name: any) => [value, 'Students']} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3} 
                  </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PO Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>PO Attainment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">PO Code</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Direct</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Indirect</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Overall</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  </thead>
                  <tbody>
                    {analyticsData?.poAttainment?.map((po, index) => {
                      const status = getAttainmentStatus(po.overallAttainment)
                      const StatusIcon = status.icon
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-medium">{po.code}</td>
                          <td className="border border-gray-300 px-4 py-2 text-left">Description</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">Direct</th>
                              <td className="border border-gray-300 px-4 py-2 text-center">{po.directAttainment.toFixed(2)}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{po.indirectAttainment.toFixed(2)}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-medium">{po.overallAttainment.toFixed(2)}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${status.color === '#10b981' ? 'bg-green-100 text-green-800' : status.color === '#3b82f6' ? 'bg-blue-100 text-blue-800' : status.color === '#f59e0b' ? 'bg-yellow-100 text-yellow-800' : status.color === '#ef4444' ? 'bg-red-100 text-red-800' }}
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Course Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Course Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Course</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Avg Score</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Attainment Rate</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Students</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Assessments</th>
                    </tr>
                  </thead>
                  </thead>
                  <tbody>
                    {analyticsData?.coursePerformance?.map((course, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">{course.code}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <span className={`font-medium`} style={{ color: getPerformanceColor(course.averageScore) }}>
                            {course.averageScore.toFixed(1)}%
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <span className={`font-medium`} style={{ color: getPerformanceColor(course.attainmentRate) }}>
                            {course.attainmentRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">{course.studentCount}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">{course.assessmentCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}