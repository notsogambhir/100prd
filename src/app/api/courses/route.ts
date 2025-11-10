import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')
    const batchId = searchParams.get('batchId')
    const status = searchParams.get('status')

    const courses = await db.course.findMany({
      where: {
        ...(programId && { programId }),
        ...(batchId && { batchId }),
        ...(status && { status: status as any })
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
        cos: {
          select: {
            id: true,
            code: true,
            description: true
          }
        },
        assessments: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        enrollments: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Failed to fetch courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      code, 
      name, 
      description, 
      credits, 
      status, 
      target, 
      attainmentLevel1, 
      attainmentLevel2, 
      attainmentLevel3,
      programId, 
      batchId, 
      sectionId, 
      teacherId, 
      createdBy 
    } = body

    const course = await db.course.create({
      data: {
        code,
        name,
        description,
        credits,
        status,
        target: target || 60.0,
        attainmentLevel1: attainmentLevel1 || 40.0,
        attainmentLevel2: attainmentLevel2 || 60.0,
        attainmentLevel3: attainmentLevel3 || 80.0,
        programId,
        batchId,
        sectionId,
        teacherId,
        createdBy
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
    console.error('Failed to create course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}