import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
                id: true,
                code: true,
                name: true,
                credits: true,
                status: true,
                teacher: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        marks: {
          include: {
            assessment: {
              select: {
                name: true,
                type: true,
                course: {
                  select: {
                    code: true,
                    name: true
                  }
                }
              }
            },
            question: {
              select: {
                name: true,
                maxMarks: true,
                co: {
                  select: {
                    code: true,
                    description: true
                  }
                }
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, rollNumber, sectionId, status } = body

    // Check for duplicate roll number (excluding current student)
    if (rollNumber) {
      const existingStudent = await db.student.findFirst({
        where: {
          rollNumber,
          id: { not: params.id }
        }
      })

      if (existingStudent) {
        return NextResponse.json(
          { error: 'Student with this roll number already exists' },
          { status: 400 }
        )
      }
    }

    const student = await db.student.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email: email || null }),
        ...(rollNumber !== undefined && { rollNumber }),
        ...(sectionId !== undefined && { sectionId: sectionId || null }),
        ...(status !== undefined && { status })
      },
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
  { params }: { params: { id: string } }
) {
  try {
    // Delete will cascade to enrollments and marks
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