import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('sectionId')
    const batchId = searchParams.get('batchId')
    const programId = searchParams.get('programId')
    const status = searchParams.get('status')

    const whereClause: any = {}

    if (sectionId) whereClause.sectionId = sectionId
    if (batchId) whereClause.batchId = batchId
    if (programId) whereClause.programId = programId
    if (status) whereClause.status = status

    const students = await db.student.findMany({
      where: whereClause,
      include: {
        section: {
          select: {
            name: true,
            batch: {
              name: true
            }
          }
        }
      },
      orderBy: {
        registerNo: 'asc'
      }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { registerNo, name, email, status, sectionId } = await request.json()

    if (!registerNo || !name) {
      return NextResponse.json(
        { message: 'Register number and name are required' },
        { status: 400 }
      )
    }

    const student = await db.student.create({
      data: {
        registerNo,
        name,
        email,
        status: status || 'ACTIVE',
        sectionId: sectionId || null
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const { registerNo, name, email, status, sectionId } = await request.json()

    if (!id) {
      return NextResponse.json(
        { message: 'Student ID is required' },
        { status: 400 }
      )
    }

    const student = await db.student.findUnique({
      where: { id }
    })

    if (!student) {
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      )
    }

    const updatedStudent = await db.student.update({
      where: { id },
      data: {
        registerNo,
        name,
        email,
        status,
        sectionId
      }
    })

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error('Error updating student:', error)
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

    // Check if student exists and has associated data
    const student = await db.student.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            marks: true
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      )
    }

    // Set sectionId to null for all students in this section
    await db.student.updateMany({
      where: {
        sectionId: student.sectionId
      },
      data: {
        sectionId: null
      }
    })

    // Delete the student (cascade will handle related data)
    await db.student.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Student deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}