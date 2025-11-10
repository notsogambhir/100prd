import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await db.course.findUnique({
      where: { id: params.id },
      include: {
        program: {
          include: {
            college: true
          }
        },
        batch: true,
        section: true,
        teacher: true,
        cos: {
          orderBy: {
            code: 'asc'
          }
        },
        assessments: {
          include: {
            questions: {
              include: {
                co: true
              }
            },
            marks: {
              include: {
                student: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        enrollments: {
          include: {
            student: true
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      credits, 
      status, 
      target, 
      attainmentLevel1, 
      attainmentLevel2, 
      attainmentLevel3,
      sectionId, 
      teacherId 
    } = body

    const course = await db.course.update({
      where: { id: params.id },
      data: {
        name,
        description,
        credits,
        status,
        target,
        attainmentLevel1,
        attainmentLevel2,
        attainmentLevel3,
        sectionId,
        teacherId
      },
      include: {
        program: true,
        batch: true,
        section: true,
        teacher: true
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
  { params }: { params: { id: string } }
) {
  try {
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