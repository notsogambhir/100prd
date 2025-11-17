'use client'

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
  FileText, 
  Download, 
  BarChart3,
  TrendingUp,
  Users,
  BookOpen
} from 'lucide-react'

export default function ReportsPage() {
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math101">Mathematics I</SelectItem>
                    <SelectItem value="phy101">Physics I</SelectItem>
                    <SelectItem value="cs101">Computer Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Scope</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">Overall Course</SelectItem>
                    <SelectItem value="section-a">Section A</SelectItem>
                    <SelectItem value="section-b">Section B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Batch</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-2029">2025-2029</SelectItem>
                    <SelectItem value="2024-2028">2024-2028</SelectItem>
                    <SelectItem value="2023-2027">2023-2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button size="lg" className="min-w-48">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
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
      </div>
    </DashboardLayout>
  )
}