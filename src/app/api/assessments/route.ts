import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    const assessments = await db.assessment.findMany({
      where: courseId ? { courseId } : undefined,
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        },
        section: {
          select: {
            name: true
          }
        },
        questions: {
          include: {
            co: {
              select: {
                code: true
              }
            }
          },
          orderBy: {
            questionName: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(assessments)
  } catch (error) {
    console.error('Error fetching assessments:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, courseId, sectionId } = await request.json()

    if (!name || !type || !courseId || !sectionId) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    const assessment = await db.assessment.create({
      data: {
        name,
        type,
        courseId,
        sectionId
      },
      include: {
        course: {
          select: {
            name: true,
            code: true
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
    console.error('Error creating assessment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}