import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')
    const batchId = searchParams.get('batchId')
    const timeRange = searchParams.get('timeRange') || 'semester'

    // Get date range for filtering
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'semester':
        startDate.setMonth(now.getMonth() - 6)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setFullYear(now.getFullYear() - 2)
    }

    // Program Overview
    const courses = await db.course.findMany({
      where: {
        ...(programId && { programId }),
        ...(batchId && { batchId }),
        status: { in: ['Active', 'Completed'] }
      },
      include: {
        enrollments: {
          include: {
            student: {
              select: { id: true }
            }
          }
        },
        assessments: {
          include: {
            marks: {
              select: { id: true }
            }
          }
        }
      }
    })

    const totalStudents = new Set(courses.flatMap(c => c.enrollments.map(e => e.student.id))).size
    const totalAssessments = courses.reduce((sum, c) => sum + c.assessments.length, 0)

    // Calculate average attainment (simplified for demo)
    const averageAttainment = 2.3 // This would use the actual attainment calculation engine

    // PO Attainment
    const pos = await db.programOutcome.findMany({
      where: {
        ...(programId && { programId })
      },
      include: {
        coPoMappings: {
          include: {
            co: {
              include: {
                course: {
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    })

    const poAttainment = await Promise.all(
      pos.map(async (po) => {
        // Simplified PO attainment calculation
        const directAttainment = 2.1
        const indirectAttainment = po.indirectAttainment || 3.0
        const overallAttainment = (directAttainment * 0.7) + (indirectAttainment * 0.3)

        let status: 'needs-improvement'
        if (overallAttainment >= 2.5) status = 'excellent'
        else if (overallAttainment >= 2.0) status = 'good'
        else if (overallAttainment >= 1.5) status = 'satisfactory'

        return {
          id: po.id,
          code: po.code,
          description: po.description,
          directAttainment,
          indirectAttainment,
          overallAttainment,
          status
        }
      })
    )

    // Course Performance
    const coursePerformance = await Promise.all(
      courses.map(async (course) => {
        const totalMarks = course.assessments.reduce((sum, a) => {
          const assessmentMarks = a.marks.reduce((markSum, m) => markSum + (m.marks || 0), 0)
          return sum + assessmentMarks
        }, 0)

        const totalMaxMarks = course.assessments.reduce((sum, a) => {
          const assessmentMax = a.questions.reduce((maxSum, q) => maxSum + q.maxMarks, 0)
          return sum + assessmentMax
        }, 0)

        const averageScore = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0
        const attainmentRate = averageScore // Simplified calculation

        return {
          id: course.id,
          code: course.code,
          name: course.name,
          averageScore,
          attainmentRate,
          studentCount: course.enrollments.length,
          assessmentCount: course.assessments.length
        }
      })
    )

    // Trends Data (simplified for demo)
    const monthlyAttainment = [
      { month: 'Jan', averageAttainment: 2.1, studentCount: 120 },
      { month: 'Feb', averageAttainment: 2.3, studentCount: 125 },
      { month: 'Mar', averageAttainment: 2.2, studentCount: 122 },
      { month: 'Apr', averageAttainment: 2.4, studentCount: 128 },
      { month: 'May', averageAttainment: 2.5, studentCount: 130 },
      { month: 'Jun', averageAttainment: 2.3, studentCount: 132 }
    ]

    const assessmentDistribution = [
      { range: '0-40', count: Math.floor(totalStudents * 0.15), percentage: 15 },
      { range: '40-60', count: Math.floor(totalStudents * 0.35), percentage: 35 },
      { range: '60-80', count: Math.floor(totalStudents * 0.35), percentage: 35 },
      { range: '80-100', count: Math.floor(totalStudents * 0.15), percentage: 15 }
    ]

    const analyticsData = {
      programOverview: {
        totalCourses: courses.length,
        totalStudents,
        totalAssessments,
        averageAttainment,
        completionRate: 85.2 // Simplified calculation
      },
      poAttainment,
      coursePerformance,
      trends: {
        monthlyAttainment,
        assessmentDistribution
      }
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Failed to fetch analytics data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}