import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const co = await db.courseOutcome.findUnique({
      where: { id: params.id },
      include: {
        course: true,
        coPoMappings: {
          include: {
            po: true
          }
        },
        assessmentQuestions: {
          include: {
            assessment: true
          }
        }
      }
    })

    if (!co) {
      return NextResponse.json(
        { error: 'Course outcome not found' },
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { code, description } = body

    const co = await db.courseOutcome.update({
      where: { id: params.id },
      data: {
        code,
        description
      },
      include: {
        course: true
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
  { params }: { params: { id: string } }
) {
  try {
    await db.courseOutcome.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Course outcome deleted successfully' })
  } catch (error) {
    console.error('Failed to delete course outcome:', error)
    return NextResponse.json(
      { error: 'Failed to delete course outcome' },
      { status: 500 }
    )
  }
}