import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Tier 1: Student-Level CO Attainment Calculation
async function calculateStudentCOAttainment(studentId: string, courseId: string, coId: string): Promise<number> {
  try {
    // Identify all AssessmentQuestions across all Assessments for the course that are mapped to the given CO ID
    const assessmentQuestions = await db.assessmentQuestion.findMany({
      where: {
        coId: coId,
        assessment: {
          courseId: courseId
        }
      },
      include: {
        assessment: {
          select: {
            type: true
          }
        }
      }
    })

    if (assessmentQuestions.length === 0) {
      return 0
    }

    // For the given Student ID, find all their MarkScores for the questions identified
    const questionIds = assessmentQuestions.map(q => q.id)
    const marks = await db.mark.findMany({
      where: {
        studentId: studentId,
        questionId: {
          in: questionIds
        }
      }
    })

    // Calculate TotalObtainedCoMarks: Sum the marks from all found MarkScores
    const totalObtainedCoMarks = marks.reduce((sum, mark) => sum + mark.marks, 0)

    // Calculate TotalMaxCoMarks: Sum the maxMarks from all AssessmentQuestions identified
    const totalMaxCoMarks = assessmentQuestions.reduce((sum, question) => sum + question.maxMarks, 0)

    // If TotalMaxCoMarks is 0, attainment is 0%
    if (totalMaxCoMarks === 0) {
      return 0
    }

    // Formula: (TotalObtainedCoMarks / TotalMaxCoMarks) * 100
    return (totalObtainedCoMarks / totalMaxCoMarks) * 100
  } catch (error) {
    console.error('Error calculating student CO attainment:', error)
    return 0
  }
}

// Tier 2: Course-Level CO Attainment Calculation
async function calculateCourseCOAttainment(courseId: string, coId: string): Promise<number> {
  try {
    // Get course details for target and attainment levels
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        target: true,
        attainmentLevel1: true,
        attainmentLevel2: true,
        attainmentLevel3: true
      }
    })

    if (!course) {
      throw new Error('Course not found')
    }

    // Get all students enrolled in the course
    const enrollments = await db.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true
          }
        }
      }
    })

    const students = enrollments.map(e => e.student)
    const totalStudents = students.length

    if (totalStudents === 0) {
      return 0
    }

    // For each Student in the scope, calculate their Student CO Attainment %
    let studentsMeetingTarget = 0
    for (const student of students) {
      const studentAttainment = await calculateStudentCOAttainment(student.id, courseId, coId)
      if (studentAttainment >= course.target) {
        studentsMeetingTarget++
      }
    }

    // Calculate the percentage of the class that met the target
    const percentageMeetingTarget = (studentsMeetingTarget / totalStudents) * 100

    // Final Level calculation based on course attainment levels
    if (percentageMeetingTarget >= course.attainmentLevel3) {
      return 3
    } else if (percentageMeetingTarget >= course.attainmentLevel2) {
      return 2
    } else if (percentageMeetingTarget >= course.attainmentLevel1) {
      return 1
    } else {
      return 0
    }
  } catch (error) {
    console.error('Error calculating course CO attainment:', error)
    return 0
  }
}

// Tier 3: Program-Level PO Attainment Calculation
async function calculateDirectPOAttainment(poId: string): Promise<number> {
  try {
    // Identify all CoPoMapping entries where poId matches the target PO ID
    const coPoMappings = await db.coPoMapping.findMany({
      where: { poId },
      include: {
        co: {
          include: {
            course: {
              select: {
                id: true,
                programId: true
              }
            }
          }
        }
      }
    })

    if (coPoMappings.length === 0) {
      return 0
    }

    // Initialize WeightedSum = 0 and TotalWeight = 0
    let weightedSum = 0
    let totalWeight = 0

    // For each mapping found:
    for (const mapping of coPoMappings) {
      // Get the Course CO Attainment Level for the coId in the mapping
      const courseCOAttainmentLevel = await calculateCourseCOAttainment(
        mapping.co.course.id, 
        mapping.coId
      )

      // Get the level (1, 2, or 3) from the mapping entry
      const mappingLevel = mapping.level

      // WeightedSum += (CO Attainment Level * Mapping Level)
      weightedSum += (courseCOAttainmentLevel * mappingLevel)
      // TotalWeight += Mapping Level
      totalWeight += mappingLevel
    }

    // If TotalWeight is 0, Direct PO Attainment is 0
    if (totalWeight === 0) {
      return 0
    }

    // Formula: WeightedSum / TotalWeight
    const directAttainment = weightedSum / totalWeight

    // Return rounded to two decimal places
    return Math.round(directAttainment * 100) / 100
  } catch (error) {
    console.error('Error calculating direct PO attainment:', error)
    return 0
  }
}

async function calculateOverallPOAttainment(poId: string): Promise<number> {
  try {
    // Get PO details including indirect attainment
    const po = await db.programOutcome.findUnique({
      where: { id: poId },
      select: {
        indirectAttainment: true
      }
    })

    if (!po) {
      throw new Error('Program Outcome not found')
    }

    // Calculate Direct PO Attainment
    const directAttainment = await calculateDirectPOAttainment(poId)

    // Get indirect attainment (defaults to 3.0 if not set)
    const indirectAttainment = po.indirectAttainment || 3.0

    // System settings for weights (can be made configurable)
    const directWeight = 70 // 70%
    const indirectWeight = 30 // 30%

    // Formula: (Direct PO Attainment * (Direct Weight / 100)) + (Indirect PO Attainment * (Indirect Weight / 100))
    const overallAttainment = (directAttainment * (directWeight / 100)) + (indirectAttainment * (indirectWeight / 100))

    // Return rounded to two decimal places
    return Math.round(overallAttainment * 100) / 100
  } catch (error) {
    console.error('Error calculating overall PO attainment:', error)
    return 0
  }
}

// API Routes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'student-co', 'course-co', 'direct-po', 'overall-po'
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')
    const coId = searchParams.get('coId')
    const poId = searchParams.get('poId')
    const programId = searchParams.get('programId')

    let result: any = {}

    switch (type) {
      case 'student-co':
        if (!studentId || !courseId || !coId) {
          return NextResponse.json(
            { error: 'Student ID, Course ID, and CO ID are required for student CO attainment' },
            { status: 400 }
          )
        }
        result = await calculateStudentCOAttainment(studentId, courseId, coId)
        break

      case 'course-co':
        if (!courseId || !coId) {
          return NextResponse.json(
            { error: 'Course ID and CO ID are required for course CO attainment' },
            { status: 400 }
          )
        }
        result = await calculateCourseCOAttainment(courseId, coId)
        break

      case 'direct-po':
        if (!poId) {
          return NextResponse.json(
            { error: 'PO ID is required for direct PO attainment' },
            { status: 400 }
          )
        }
        result = await calculateDirectPOAttainment(poId)
        break

      case 'overall-po':
        if (!poId) {
          return NextResponse.json(
            { error: 'PO ID is required for overall PO attainment' },
            { status: 400 }
          )
        }
        result = await calculateOverallPOAttainment(poId)
        break

      case 'program-summary':
        if (!programId) {
          return NextResponse.json(
            { error: 'Program ID is required for program summary' },
            { status: 400 }
          )
        }
        // Get all POs for the program and calculate their attainment
        const pos = await db.programOutcome.findMany({
          where: { programId },
          select: { id: true, code: true, description: true }
        })

        const poAttainments = await Promise.all(
          pos.map(async (po) => ({
            id: po.id,
            code: po.code,
            description: po.description,
            directAttainment: await calculateDirectPOAttainment(po.id),
            overallAttainment: await calculateOverallPOAttainment(po.id)
          }))
        )

        result = {
          programId,
          pos: poAttainments
        }
        break

      case 'course-summary':
        if (!courseId) {
          return NextResponse.json(
            { error: 'Course ID is required for course summary' },
            { status: 400 }
          )
        }
        // Get all COs for the course and calculate their attainment
        const cos = await db.courseOutcome.findMany({
          where: { courseId },
          select: { id: true, code: true, description: true }
        })

        const coAttainments = await Promise.all(
          cos.map(async (co) => ({
            id: co.id,
            code: co.code,
            description: co.description,
            attainmentLevel: await calculateCourseCOAttainment(courseId, co.id)
          }))
        )

        // Get all students in the course and their individual CO attainments
        const enrollments = await db.enrollment.findMany({
          where: { courseId },
          include: {
            student: {
              select: { id: true, name: true, rollNumber: true }
            }
          }
        })

        const studentAttainments = await Promise.all(
          enrollments.map(async (enrollment) => {
            const studentCOData: any = {}
            for (const co of cos) {
              const attainment = await calculateStudentCOAttainment(enrollment.student.id, courseId, co.id)
              studentCOData[co.id] = {
                percentage: Math.round(attainment * 100) / 100,
                meetsTarget: attainment >= 60 // Default target, should get from course
              }
            }
            return {
              student: enrollment.student,
              coData: studentCOData
            }
          })
        )

        result = {
          courseId,
          cos: coAttainments,
          students: studentAttainments
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid calculation type. Use: student-co, course-co, direct-po, overall-po, program-summary, or course-summary' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to calculate attainment:', error)
    return NextResponse.json(
      { error: 'Failed to calculate attainment' },
      { status: 500 }
    )
  }
}