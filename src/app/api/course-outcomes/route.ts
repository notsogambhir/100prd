import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    const courseOutcomes = await db.courseOutcome.findMany({
      where: courseId ? { courseId } : undefined,
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    })

    return NextResponse.json(courseOutcomes)
  } catch (error) {
    console.error('Error fetching course outcomes:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, description, courseId } = await request.json()

    if (!code || !description || !courseId) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if CO with same code exists in this course
    const existingCO = await db.courseOutcome.findFirst({
      where: {
        code,
        courseId
      }
    })

    if (existingCO) {
      return NextResponse.json(
        { message: 'Course outcome with this code already exists in this course' },
        { status: 409 }
      )
    }

    const courseOutcome = await db.courseOutcome.create({
      data: {
        code,
        description,
        courseId
      },
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json(courseOutcome, { status: 201 })
  } catch (error) {
    console.error('Error creating course outcome:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}