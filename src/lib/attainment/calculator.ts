import { db } from '@/lib/db'

export interface StudentCOAttainment {
  studentId: string
  coId: string
  attainmentPercentage: number
}

export interface CourseCOAttainment {
  coId: string
  attainmentLevel: number
  percentageMeetingTarget: number
}

export interface POAttainment {
  poId: string
  directAttainment: number
  overallAttainment: number
}

export class AttainmentCalculator {
  /**
   * Tier 1: Calculate Student CO Attainment
   * Formula: (TotalObtainedCoMarks / TotalMaxCoMarks) * 100
   */
  static async calculateStudentCOAttainment(studentId: string, coId: string): Promise<number> {
    try {
      // Get all assessment questions mapped to this CO
      const assessmentQuestions = await db.assessmentQuestion.findMany({
        where: {
          coId: coId
        },
        include: {
          assessment: {
            include: {
              course: true
            }
          }
        }
      })

      if (assessmentQuestions.length === 0) {
        return 0
      }

      // Get marks for this student for these questions
      const marks = await db.mark.findMany({
        where: {
          studentId: studentId,
          assessmentQuestionId: {
            in: assessmentQuestions.map(q => q.id)
          }
        }
      })

      let totalObtainedMarks = 0
      let totalMaxMarks = 0

      assessmentQuestions.forEach((question) => {
        const mark = marks.find(m => m.assessmentQuestionId === question.id)
        if (mark) {
          totalObtainedMarks += mark.marks
          totalMaxMarks += question.maxMarks
        }
      })

      if (totalMaxMarks === 0) {
        return 0
      }

      return (totalObtainedMarks / totalMaxMarks) * 100
    } catch (error) {
      console.error('Error calculating student CO attainment:', error)
      return 0
    }
  }

  /**
   * Tier 2: Calculate Course CO Attainment
   * First calculate percentage meeting target, then determine attainment level
   */
  static async calculateCourseCOAttainment(
    coId: string, 
    courseId: string, 
    sectionId?: string
  ): Promise<CourseCOAttainment> {
    try {
      // Get course details for target and thresholds
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: {
          target: true,
          level1: true,
          level2: true,
          level3: true
        }
      })

      if (!course) {
        throw new Error('Course not found')
      }

      // Get students in scope
      let students
      if (sectionId) {
        const section = await db.section.findUnique({
          where: { id: sectionId },
          include: {
            students: {
              where: { status: 'ACTIVE' }
            }
          }
        })
        students = section?.students || []
      } else {
        // Get all students enrolled in the course
        const enrollments = await db.enrollment.findMany({
          where: { courseId },
          include: {
            student: {
              where: { status: 'ACTIVE' }
            }
          }
        })
        students = enrollments.map(e => e.student).filter(Boolean)
      }

      if (students.length === 0) {
        return {
          coId,
          attainmentLevel: 0,
          percentageMeetingTarget: 0
        }
      }

      // Calculate CO attainment for each student
      let studentsMeetingTarget = 0
      for (const student of students) {
        const attainmentPercentage = await this.calculateStudentCOAttainment(student.id, coId)
        if (attainmentPercentage >= course.target) {
          studentsMeetingTarget++
        }
      }

      const percentageMeetingTarget = (studentsMeetingTarget / students.length) * 100

      // Determine attainment level based on thresholds
      let attainmentLevel = 0
      if (percentageMeetingTarget >= course.level3) {
        attainmentLevel = 3
      } else if (percentageMeetingTarget >= course.level2) {
        attainmentLevel = 2
      } else if (percentageMeetingTarget >= course.level1) {
        attainmentLevel = 1
      }

      return {
        coId,
        attainmentLevel,
        percentageMeetingTarget
      }
    } catch (error) {
      console.error('Error calculating course CO attainment:', error)
      return {
        coId,
        attainmentLevel: 0,
        percentageMeetingTarget: 0
      }
    }
  }

  /**
   * Tier 3: Calculate Program Outcome Attainment
   * Direct Attainment: WeightedSum / TotalWeight
   * Overall Attainment: (Direct * DirectWeight/100) + (Indirect * IndirectWeight/100)
   */
  static async calculatePOAttainment(
    poId: string, 
    programId: string,
    directWeight: number = 0.8,
    indirectWeight: number = 0.2
  ): Promise<POAttainment> {
    try {
      // Get all CO-PO mappings for this PO
      const coPoMappings = await db.coPoMapping.findMany({
        where: { poId },
        include: {
          co: {
            include: {
              course: {
                select: {
                  id: true,
                  target: true,
                  level1: true,
                  level2: true,
                  level3: true
                }
              }
            }
          }
        }
      })

      if (coPoMappings.length === 0) {
        return {
          poId,
          directAttainment: 0,
          overallAttainment: 0
        }
      }

      let weightedSum = 0
      let totalWeight = 0

      // Calculate weighted sum based on CO attainment levels
      for (const mapping of coPoMappings) {
        const coAttainment = await this.calculateCourseCOAttainment(
          mapping.coId,
          mapping.co.course.id
        )
        
        weightedSum += coAttainment.attainmentLevel * mapping.level
        totalWeight += mapping.level
      }

      const directAttainment = totalWeight > 0 ? weightedSum / totalWeight : 0

      // Get indirect attainment for the PO
      const po = await db.programOutcome.findUnique({
        where: { id: poId },
        select: { indirectAttainment: true }
      })

      const indirectAttainment = po?.indirectAttainment || 3.0 // Default to 3.0 as per PRD

      // Calculate overall attainment
      const overallAttainment = 
        (directAttainment * (directWeight / 100)) + 
        (indirectAttainment * (indirectWeight / 100))

      return {
        poId,
        directAttainment: Math.round(directAttainment * 100) / 100, // Round to 2 decimal places
        overallAttainment: Math.round(overallAttainment * 100) / 100
      }
    } catch (error) {
      console.error('Error calculating PO attainment:', error)
      return {
        poId,
        directAttainment: 0,
        overallAttainment: 0
      }
    }
  }

  /**
   * Calculate all CO attainments for a course
   */
  static async calculateAllCourseCOAttainments(
    courseId: string, 
    sectionId?: string
  ): Promise<CourseCOAttainment[]> {
    try {
      // Get all COs for the course
      const courseOutcomes = await db.courseOutcome.findMany({
        where: { courseId }
      })

      const attainments: CourseCOAttainment[] = []

      for (const co of courseOutcomes) {
        const attainment = await this.calculateCourseCOAttainment(co.id, courseId, sectionId)
        attainments.push(attainment)
      }

      return attainments
    } catch (error) {
      console.error('Error calculating all course CO attainments:', error)
      return []
    }
  }

  /**
   * Calculate all PO attainments for a program
   */
  static async calculateAllPOAttainments(
    programId: string,
    directWeight: number = 0.8,
    indirectWeight: number = 0.2
  ): Promise<POAttainment[]> {
    try {
      // Get all POs for the program
      const programOutcomes = await db.programOutcome.findMany({
        where: { programId }
      })

      const attainments: POAttainment[] = []

      for (const po of programOutcomes) {
        const attainment = await this.calculatePOAttainment(
          po.id, 
          programId, 
          directWeight, 
          indirectWeight
        )
        attainments.push(attainment)
      }

      return attainments
    } catch (error) {
      console.error('Error calculating all PO attainments:', error)
      return []
    }
  }

  /**
   * Generate comprehensive course attainment report
   */
  static async generateCourseAttainmentReport(
    courseId: string, 
    sectionId?: string
  ) {
    try {
      const course = await db.course.findUnique({
        where: { id: courseId },
        include: {
          program: {
            select: {
              name: true
            }
          },
          batch: {
            select: {
              name: true
            }
          },
          courseOutcomes: {
            orderBy: {
              code: 'asc'
            }
          }
        }
      })

      if (!course) {
        throw new Error('Course not found')
      }

      // Get CO attainments
      const coAttainments = await this.calculateAllCourseCOAttainments(courseId, sectionId)

      // Get student-wise breakdown
      let students
      if (sectionId) {
        const section = await db.section.findUnique({
          where: { id: sectionId },
          include: {
            students: {
              where: { status: 'ACTIVE' }
            }
          }
        })
        students = section?.students || []
      } else {
        const enrollments = await db.enrollment.findMany({
          where: { courseId },
          include: {
            student: {
              where: { status: 'ACTIVE' }
            }
          }
        })
        students = enrollments.map(e => e.student).filter(Boolean)
      }

      const studentBreakdown = []
      for (const student of students) {
        const studentData: any = {
          studentId: student.id,
          registerNo: student.registerNo,
          name: student.name
        }

        // Calculate CO attainment for each CO
        for (const co of course.courseOutcomes) {
          const attainmentPercentage = await this.calculateStudentCOAttainment(student.id, co.id)
          studentData[co.code] = attainmentPercentage
        }

        studentBreakdown.push(studentData)
      }

      return {
        course,
        coAttainments,
        studentBreakdown,
        sectionId
      }
    } catch (error) {
      console.error('Error generating course attainment report:', error)
      throw error
    }
  }
}