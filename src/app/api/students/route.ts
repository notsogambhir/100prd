import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('sectionId')
    const batchId = searchParams.get('batchId')
    const programId = searchParams.get('programId')
    const status = searchParams.get('status')

    const students = await db.student.findMany({
      where: {
        ...(sectionId && { sectionId }),
        ...(batchId && { section: { batchId } }),
        ...(programId && { section: { batch: { programId } } }),
        ...(status && { status })
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
        _count: {
          select: {
            enrollments: true,
            marks: true
          }
        }
      },
      orderBy: [
        { rollNumber: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Failed to fetch students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, rollNumber, sectionId, status = 'Active' } = body

    if (!name || !rollNumber) {
      return NextResponse.json(
        { error: 'Name and roll number are required' },
        { status: 400 }
      )
    }

    // Check for duplicate roll number
    const existingStudent = await db.student.findUnique({
      where: { rollNumber }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this roll number already exists' },
        { status: 400 }
      )
    }

    const student = await db.student.create({
      data: {
        name,
        email: email || null,
        rollNumber,
        sectionId: sectionId || null,
        status
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

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Failed to create student:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}