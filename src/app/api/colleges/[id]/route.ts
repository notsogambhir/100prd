import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const college = await db.college.findUnique({
      where: { id: params.id },
      include: {
        programs: {
          include: {
            _count: {
              select: {
                batches: true,
                courses: true
              }
            }
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        }
      }
    })

    if (!college) {
      return NextResponse.json(
        { error: 'College not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(college)
  } catch (error) {
    console.error('Failed to fetch college:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college' },
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
    const { name, description } = body

    const college = await db.college.update({
      where: { id: params.id },
      data: {
        name,
        description
      }
    })

    return NextResponse.json(college)
  } catch (error) {
    console.error('Failed to update college:', error)
    return NextResponse.json(
      { error: 'Failed to update college' },
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
    await db.college.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'College deleted successfully' })
  } catch (error) {
    console.error('Failed to delete college:', error)
    return NextResponse.json(
      { error: 'Failed to delete college' },
      { status: 500 }
    )
  }
}