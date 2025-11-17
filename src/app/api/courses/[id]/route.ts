import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id

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
        },
        assessments: {
          include: {
            section: {
              select: {
                name: true
              }
            },
            _count: {
              select: {
                questions: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}