import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    const cos = await db.courseOutcome.findMany({
      where: courseId ? { courseId } : {},
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        },
        coPoMappings: {
          include: {
            po: {
              select: {
                code: true,
                description: true
              }
            }
          }
        },
        assessmentQuestions: {
          select: {
            id: true,
            assessment: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    })

    return NextResponse.json(cos)
  } catch (error) {
    console.error('Failed to fetch course outcomes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course outcomes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, description, courseId } = body

    const co = await db.courseOutcome.create({
      data: {
        code,
        description,
        courseId
      },
      include: {
        course: true
      }
    })

    return NextResponse.json(co)
  } catch (error) {
    console.error('Failed to create course outcome:', error)
    return NextResponse.json(
      { error: 'Failed to create course outcome' },
      { status: 500 }
    )
  }
}