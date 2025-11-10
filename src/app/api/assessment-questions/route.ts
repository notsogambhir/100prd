import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('assessmentId')
    const coId = searchParams.get('coId')

    const questions = await db.assessmentQuestion.findMany({
      where: {
        ...(assessmentId && { assessmentId }),
        ...(coId && { coId })
      },
      include: {
        assessment: {
          select: {
            name: true,
            course: {
              select: {
                code: true,
                name: true
              }
            }
          }
        },
        co: {
          select: {
            code: true,
            description: true
          }
        },
        _count: {
          select: {
            marks: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Failed to fetch assessment questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessment questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, maxMarks, assessmentId, coId } = body

    if (!name || !maxMarks || !assessmentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify assessment exists
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId }
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    const question = await db.assessmentQuestion.create({
      data: {
        name,
        maxMarks,
        assessmentId,
        coId: coId || null
      },
      include: {
        assessment: {
          select: {
            name: true,
            course: {
              select: {
                code: true,
                name: true
              }
            }
          }
        },
        co: {
          select: {
            code: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('Failed to create assessment question:', error)
    return NextResponse.json(
      { error: 'Failed to create assessment question' },
      { status: 500 }
    )
  }
}