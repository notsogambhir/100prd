import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const assessmentId = searchParams.get('assessmentId')
    const reportType = searchParams.get('type') // 'course-attainment' or 'assessment-comparison'

    if (reportType === 'course-attainment' && courseId) {
      return await generateCourseAttainmentReport(courseId)
    } else if (reportType === 'assessment-comparison' && courseId) {
      return await generateAssessmentComparisonReport(courseId)
    } else {
      return NextResponse.json(
        { error: 'Invalid report parameters' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to generate report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

async function generateCourseAttainmentReport(courseId: string) {
  // Get course details with COs and enrollments
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
              },
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
    return NextResponse.json(
      { error: 'Course not found' },
      { status: 404 }
    )
  }

  // Calculate CO attainment for each student
  const studentCoAttainment: any[] = []
  
  for (const enrollment of course.enrollments) {
    const student = enrollment.student
    const coAttainment: any = {
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      coData: {}
    }

    for (const co of course.cos) {
      let totalObtained = 0
      let totalMax = 0

      for (const question of co.assessmentQuestions) {
        const studentMark = question.marks.find(mark => mark.studentId === student.id)
        if (studentMark) {
          totalObtained += studentMark.marks
          totalMax += question.maxMarks
        }
      }

      const attainmentPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0
      const meetsTarget = attainmentPercentage >= course.target
      
      coAttainment.coData[co.code] = {
        percentage: attainmentPercentage,
        meetsTarget,
        obtained: totalObtained,
        maxMarks: totalMax
      }
    }

    studentCoAttainment.push(coAttainment)
  }

  // Calculate overall CO attainment levels
  const coSummary: any[] = []
  
  for (const co of course.cos) {
    let studentsMeetingTarget = 0
    
    for (const student of studentCoAttainment) {
      if (student.coData[co.code]?.meetsTarget) {
        studentsMeetingTarget++
      }
    }
    
    const percentageMeetingTarget = course.enrollments.length > 0 
      ? (studentsMeetingTarget / course.enrollments.length) * 100 
      : 0
    
    let attainmentLevel = 0
    if (percentageMeetingTarget >= course.attainmentLevel3) attainmentLevel = 3
    else if (percentageMeetingTarget >= course.attainmentLevel2) attainmentLevel = 2
    else if (percentageMeetingTarget >= course.attainmentLevel1) attainmentLevel = 1
    
    coSummary.push({
      coCode: co.code,
      description: co.description,
      percentageMeetingTarget,
      attainmentLevel,
      studentsMeetingTarget,
      totalStudents: course.enrollments.length
    })
  }

  return NextResponse.json({
    type: 'course-attainment',
    course: {
      code: course.code,
      name: course.name,
      program: course.program,
      batch: course.batch,
      section: course.section,
      teacher: course.teacher,
      target: course.target,
      attainmentLevels: {
        level1: course.attainmentLevel1,
        level2: course.attainmentLevel2,
        level3: course.attainmentLevel3
      }
    },
    coSummary,
    studentBreakdown: studentCoAttainment
  })
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
          name: true
        }
      },
      section: {
        select: {
          name: true
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
      }
    }
  })

  if (!course) {
    return NextResponse.json(
      { error: 'Course not found' },
      { status: 404 }
    )
  }

  // Calculate assessment scores for each student
  const studentAssessmentScores: any[] = []
  
  for (const enrollment of course.enrollments) {
    const student = enrollment.student
    const assessmentScores: any = {
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      assessments: {}
    }

    for (const assessment of course.assessments) {
      let totalObtained = 0
      let totalMax = 0

      for (const question of assessment.questions) {
        const studentMark = question.marks.find(mark => mark.studentId === student.id)
        if (studentMark) {
          totalObtained += studentMark.marks
          totalMax += question.maxMarks
        }
      }

      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0
      
      assessmentScores.assessments[assessment.id] = {
        name: assessment.name,
        type: assessment.type,
        percentage,
        obtained: totalObtained,
        maxMarks: totalMax
      }
    }

    studentAssessmentScores.push(assessmentScores)
  }

  return NextResponse.json({
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
    studentScores: studentAssessmentScores
  })
}