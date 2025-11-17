import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { message: 'Course ID is required' },
        { status: 400 }
      )
    }

    const assignments = await db.courseAssignment.findMany({
      where: { courseId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true
          }
        },
        section: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { section: { name: 'asc' } }
      ]
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching course assignments:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { courseId, teacherId, sectionId } = await request.json()

    if (!courseId || !teacherId) {
      return NextResponse.json(
        { message: 'Course ID and Teacher ID are required' },
        { status: 400 }
      )
    }

    // Check if assignment already exists
    const existingAssignment = await db.courseAssignment.findFirst({
      where: {
        courseId,
        teacherId,
        sectionId: sectionId || null
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { message: 'Assignment already exists' },
        { status: 409 }
      )
    }

    const assignment = await db.courseAssignment.create({
      data: {
        courseId,
        teacherId,
        sectionId: sectionId || null
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error creating course assignment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    await db.courseAssignment.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Assignment deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting course assignment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}