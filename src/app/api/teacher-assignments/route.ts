import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const assignments = await db.teacherAssignment.findMany({
      include: {
        teacher: {
          select: {
            name: true,
            username: true,
            role: true
          }
        },
        pc: {
          select: {
            name: true,
            username: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching teacher assignments:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { teacherId, pcId } = await request.json()

    if (!teacherId || !pcId) {
      return NextResponse.json(
        { message: 'Teacher ID and PC ID are required' },
        { status: 400 }
      )
    }

    // Check if assignment already exists
    const existingAssignment = await db.teacherAssignment.findFirst({
      where: {
        teacherId,
        pcId
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { message: 'Assignment already exists' },
        { status: 409 }
      )
    }

    const assignment = await db.teacherAssignment.create({
      data: {
        teacherId,
        pcId
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error creating teacher assignment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    const assignment = await db.teacherAssignment.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            name: true,
            username: true,
            role: true
          }
        },
        pc: {
          select: {
            name: true,
            username: true,
            role: true
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { message: 'Assignment not found' },
        { status: 404 }
      )
    }

    await db.teacherAssignment.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Assignment deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting teacher assignment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}