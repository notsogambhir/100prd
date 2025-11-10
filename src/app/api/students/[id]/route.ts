import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const student = await db.student.findUnique({
      where: { id: params.id },
      include: {
        section: {
          select: {
            name: true,
            batch: {
              select: {
                name: true,
                program: {
                  select: {
                    name: true,
                    code: true
                  }
                }
              }
            }
          }
        },
        enrollments: {
          include: {
            course: {
              select: {
                code: true,
                name: true,
                status: true
              }
            }
          }
        },
        marks: {
          include: {
            assessment: {
              select: {
                name: true,
                type: true
              }
            },
            question: {
              select: {
                name: true,
                maxMarks: true
              }
            }
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Failed to fetch student:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student' },
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
    const { name, email, rollNumber, status, sectionId } = body

    const student = await db.student.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(rollNumber !== undefined && { rollNumber }),
        ...(status !== undefined && { status }),
        ...(sectionId !== undefined && { sectionId })
      },
      include: {
        section: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Failed to update student:', error)
    return NextResponse.json(
      { error: 'Failed to update student' },
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
    await db.student.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Failed to delete student:', error)
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}