import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const sectionId = searchParams.get('sectionId')

    const assessments = await db.assessment.findMany({
      where: {
        ...(courseId && { courseId }),
        ...(sectionId && { sectionId })
      },
      include: {
        course: {
          select: {
            code: true,
            name: true
          }
        },
        section: {
          select: {
            name: true
          }
        },
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        questions: {
          include: {
            co: {
              select: {
                code: true,
                description: true
              }
            }
          }
        },
        _count: {
          select: {
            marks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(assessments)
  } catch (error) {
    console.error('Failed to fetch assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, courseId, sectionId, createdBy } = body

    if (!name || !type || !courseId || !sectionId || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify course exists and user has permission
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        program: true
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    const assessment = await db.assessment.create({
      data: {
        name,
        type,
        courseId,
        sectionId,
        createdBy
      },
      include: {
        course: {
          select: {
            code: true,
            name: true
          }
        },
        section: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(assessment, { status: 201 })
  } catch (error) {
    console.error('Failed to create assessment:', error)
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    )
  }
}