import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const course = await db.course.findUnique({
      where: { id: params.id },
      include: {
        program: {
          select: {
            name: true,
            code: true
          }
        },
        batch: {
          select: {
            name: true,
            startYear: true,
            endYear: true
          }
        },
        section: {
          select: {
            name: true
          }
        },
        teacher: {
          select: {
            name: true,
            email: true
          }
        },
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        cos: {
          include: {
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
        },
        assessments: {
          include: {
            questions: {
              include: {
                co: {
                  select: {
                    code: true,
                    description: true
                  }
                }
              }
            }
          }
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                rollNumber: true
              }
            }
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Failed to fetch course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
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
    const { name, description, credits, status, target, teacherId, sectionId } = body

    const course = await db.course.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(credits !== undefined && { credits }),
        ...(status !== undefined && { status }),
        ...(target !== undefined && { target }),
        ...(teacherId !== undefined && { teacherId }),
        ...(sectionId !== undefined && { sectionId })
      },
      include: {
        program: {
          select: {
            name: true,
            code: true
          }
        },
        batch: {
          select: {
            name: true
          }
        },
        section: {
          select: {
            name: true
          }
        },
        teacher: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error('Failed to update course:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
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
    await db.course.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Failed to delete course:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}