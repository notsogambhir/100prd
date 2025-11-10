import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const assessment = await db.assessment.findUnique({
      where: { id: params.id },
      include: {
        course: {
          select: {
            code: true,
            name: true,
            program: {
              select: {
                name: true
              }
            }
          }
        },
        batch: {
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
                id: true,
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
        },
        marks: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                rollNumber: true
              }
            },
            question: {
              select: {
                id: true,
                name: true,
                maxMarks: true
              }
            }
          }
        }
      }
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('Failed to fetch assessment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const body = await request.json()
    const { name, type } = body

    const assessment = await db.assessment.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(type && { type })
      },
      include: {
        course: {
          select: {
            code: true,
            name: true
          }
        },
        batch: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('Failed to update assessment:', error)
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    // Delete will cascade to questions and marks due to schema relationships
    await db.assessment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Assessment deleted successfully' })
  } catch (error) {
    console.error('Failed to delete assessment:', error)
    return NextResponse.json(
      { error: 'Failed to delete assessment' },
      { status: 500 }
    )
  }
}