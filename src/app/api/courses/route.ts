import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const courses = await db.course.findMany({
      include: {
        program: {
          select: {
            name: true
          }
        },
        batch: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            courseOutcomes: true,
            assessments: true
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, name, credits, programId, batchId } = await request.json()

    if (!code || !name || !credits || !programId || !batchId) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if course with same code exists in the same program
    const existingCourse = await db.course.findFirst({
      where: {
        code,
        programId
      }
    })

    if (existingCourse) {
      return NextResponse.json(
        { message: 'Course with this code already exists in this program' },
        { status: 409 }
      )
    }

    const course = await db.course.create({
      data: {
        code,
        name,
        credits: parseInt(credits),
        programId,
        batchId
      },
      include: {
        program: {
          select: {
            name: true
          }
        },
        batch: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            courseOutcomes: true,
            assessments: true
          }
        }
      }
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}