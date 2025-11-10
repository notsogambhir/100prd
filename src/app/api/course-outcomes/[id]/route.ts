import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const co = await db.courseOutcome.findUnique({
      where: { id: params.id },
      include: {
        course: {
          select: {
            code: true,
            name: true
          }
        },
        assessmentQuestions: {
          include: {
            assessment: {
              select: {
                name: true,
                type: true
              }
            }
          }
        }
      }
    })

    if (!co) {
      return NextResponse.json(
        { error: 'Course Outcome not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(co)
  } catch (error) {
    console.error('Failed to fetch course outcome:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course outcome' },
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
    const { code, description } = body

    const co = await db.courseOutcome.update({
      where: { id: params.id },
      data: {
        ...(code !== undefined && { code }),
        ...(description !== undefined && { description })
      },
      include: {
        course: {
          select: {
            code: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(co)
  } catch (error) {
    console.error('Failed to update course outcome:', error)
    return NextResponse.json(
      { error: 'Failed to update course outcome' },
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
    await db.courseOutcome.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Course Outcome deleted successfully' })
  } catch (error) {
    console.error('Failed to delete course outcome:', error)
    return NextResponse.json(
      { error: 'Failed to delete course outcome' },
      { status: 500 }
    )
  }
}