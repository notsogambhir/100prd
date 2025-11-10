import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportType, courseId, assessmentId } = body

    if (!reportType) {
      return NextResponse.json(
        { error: 'Report type is required' },
        { status: 400 }
      )
    }

    let reportData: any

    if (reportType === 'course-attainment' && courseId) {
      reportData = await generateCourseAttainmentReport(courseId)
    } else if (reportType === 'assessment-comparison' && courseId) {
      reportData = await generateAssessmentComparisonReport(courseId)
    } else {
      return NextResponse.json(
        { error: 'Invalid report parameters' },
        { status: 400 }
      )
    }

    // Generate PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Generate PDF content
    await generatePDFContent(pdf, reportData, reportType)

    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${reportType}-report-${Date.now()}.pdf"`
      }
    })

  } catch (error) {
    console.error('Failed to generate PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

async function generateCourseAttainmentReport(courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      program: {
        select: {
          name: true,
          code: true
        }
      },
      batch: {
        select: {
          name: true,
          startYear: true,
          endYear: true
        }
      },
      section: {
        select: {
          name: true
        }
      },
      teacher: {
        select: {
          name: true,
          email: true
        }
      },
      cos: {
        include: {
          assessmentQuestions: {
            include: {
              assessment: {
                select: {
                  type: true
                }
              }
            }
          }
        }
      },
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              rollNumber: true
            }
          }
        }
      }
    }
  })

  if (!course) {
    throw new Error('Course not found')
  }

  // Simplified CO attainment calculation
  const coSummary = course.cos.map((co) => ({
    coCode: co.code,
    description: co.description,
    percentageMeetingTarget: 85.0, // Placeholder
    attainmentLevel: 2, // Placeholder
    studentsMeetingTarget: 20, // Placeholder
    totalStudents: course.enrollments.length
  }))

  const studentBreakdown = course.enrollments.map((enrollment) => {
    const student = enrollment.student
    const coData: any = {}
    
    course.cos.forEach((co) => {
      coData[co.code] = {
        percentage: 90.0, // Placeholder
        meetsTarget: true
      }
    })

    return {
      student,
      coData
    }
  })

  return {
    type: 'course-attainment',
    course: {
      code: course.code,
      name: course.name,
      program: course.program,
      batch: course.batch,
      section: course.section,
      teacher: course.teacher
    },
    coSummary,
    studentBreakdown
  }
}

async function generateAssessmentComparisonReport(courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      program: {
        select: {
          name: true,
          code: true
        }
      },
      batch: {
        select: {
          name: true,
          startYear: true,
          endYear: true
        }
      },
      section: {
        select: {
          name: true
        }
      },
      assessments: {
        include: {
          questions: {
            include: {
              marks: {
                include: {
                  student: {
                    select: {
                      id: true,
                      name: true,
                      rollNumber: true
                    }
                  }
                }
              }
            }
          }
        }
      },
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              rollNumber: true
            }
          }
        }
      }
    }
  })

  if (!course) {
    throw new Error('Course not found')
  }

  const studentScores = course.enrollments.map((enrollment) => {
    const student = enrollment.student
    const assessmentScores: any = {}
    
    course.assessments.forEach((assessment) => {
      let totalObtained = 0
      let totalMax = 0

      assessment.questions.forEach((question) => {
        const studentMark = question.marks.find(mark => mark.studentId === student.id)
        if (studentMark) {
          totalObtained += studentMark.marks
          totalMax += question.maxMarks
        }
      })

      assessmentScores[assessment.id] = {
        name: assessment.name,
        type: assessment.type,
        percentage: totalMax > 0 ? (totalObtained / totalMax) * 100 : 0,
        obtained: totalObtained,
        maxMarks: totalMax
      }
    })

    return {
      student,
      assessmentScores
    }
  })

  return {
    type: 'assessment-comparison',
    course: {
      code: course.code,
      name: course.name,
      program: course.program,
      batch: course.batch,
      section: course.section
    },
    assessments: course.assessments.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      totalQuestions: a.questions.length,
      totalMarks: a.questions.reduce((sum, q) => sum + q.maxMarks, 0)
    })),
    studentScores
  }
}

async function generatePDFContent(pdf: any, reportData: any, reportType: string) {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Add title
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  const title = reportData.type === 'course-attainment' ? 'Course Attainment Summary' : 'Assessment Comparison Report'
  pdf.text(title, margin, yPosition)
  yPosition += 15

  // Add course info
  pdf.setFontSize(12)
  pdf.text(`Course: ${reportData.course.code} - ${reportData.course.name}`, margin, yPosition)
  yPosition += 8
  pdf.text(`Program: ${reportData.course.program?.name}`, margin, yPosition)
  yPosition += 8
  if (reportData.course.section) {
    pdf.text(`Section: ${reportData.course.section.name}`, margin, yPosition)
  }
  yPosition += 8
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition)
  yPosition += 15

  // Add summary
  pdf.setFontSize(14)
  pdf.text('Summary:', margin, yPosition)
  yPosition += 8

  if (reportType === 'course-attainment') {
    reportData.coSummary.forEach((co: any) => {
      pdf.text(`${co.coCode}: ${co.description}`, margin, yPosition)
      yPosition += 6
      pdf.text(`Students Meeting Target: ${co.studentsMeetingTarget}/${co.totalStudents} (${co.percentageMeetingTarget.toFixed(1)}%)`, margin, yPosition)
      yPosition += 6
      pdf.text(`Attainment Level: ${getAttainmentLevelText(co.attainmentLevel)}`, margin, yPosition)
      yPosition += 10
    })
  } else {
    reportData.assessments.forEach((assessment: any) => {
      pdf.text(`${assessment.name} (${assessment.type})`, margin, yPosition)
      yPosition += 8
    })
  }

  yPosition += 15
  pdf.text('End of Report', margin, yPosition)
}

function getAttainmentLevelText(level: number): string {
  switch (level) {
    case 3: return 'Excellent'
    case 2: return 'Good'
    case 1: return 'Satisfactory'
    default: return 'Needs Improvement'
  }
}