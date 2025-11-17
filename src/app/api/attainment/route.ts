import { NextRequest, NextResponse } from 'next/server'
import { AttainmentCalculator } from '@/lib/attainment/calculator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const sectionId = searchParams.get('sectionId')
    const programId = searchParams.get('programId')
    const type = searchParams.get('type') || 'course'

    let result

    switch (type) {
      case 'course':
        if (!courseId) {
          return NextResponse.json(
            { message: 'Course ID is required for course attainment' },
            { status: 400 }
          )
        }
        result = await AttainmentCalculator.calculateAllCourseCOAttainments(
          courseId,
          sectionId || undefined
        )
        break

      case 'program':
        if (!programId) {
          return NextResponse.json(
            { message: 'Program ID is required for program attainment' },
            { status: 400 }
          )
        }
        result = await AttainmentCalculator.calculateAllPOAttainments(programId)
        break

      case 'report':
        if (!courseId) {
          return NextResponse.json(
            { message: 'Course ID is required for report generation' },
            { status: 400 }
          )
        }
        result = await AttainmentCalculator.generateCourseAttainmentReport(
          courseId,
          sectionId || undefined
        )
        break

      default:
        return NextResponse.json(
          { message: 'Invalid type. Use: course, program, or report' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error calculating attainment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}