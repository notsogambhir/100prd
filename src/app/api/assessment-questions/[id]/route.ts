import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const question = await db.assessmentQuestion.findUnique({
      where: { id: params.id },
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
            id: true,
            code: true,
            description: true
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
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error('Failed to fetch assessment question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessment question' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, maxMarks, coId } = body

    const question = await db.assessmentQuestion.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(maxMarks !== undefined && { maxMarks }),
        ...(coId !== undefined && { coId: coId || null })
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

    return NextResponse.json(question)
  } catch (error) {
    console.error('Failed to update assessment question:', error)
    return NextResponse.json(
      { error: 'Failed to update assessment question' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete will cascade to marks due to schema relationships
    await db.assessmentQuestion.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Question deleted successfully' })
  } catch (error) {
    console.error('Failed to delete assessment question:', error)
    return NextResponse.json(
      { error: 'Failed to delete assessment question' },
      { status: 500 }
    )
  }
}