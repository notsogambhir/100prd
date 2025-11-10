import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collegeId = searchParams.get('collegeId')

    const programs = await db.program.findMany({
      where: collegeId ? { collegeId } : {},
      include: {
        college: {
          select: {
            name: true
          }
        },
        batches: {
          select: {
            id: true,
            name: true,
            startYear: true,
            endYear: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(programs)
  } catch (error) {
    console.error('Failed to fetch programs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code, description, duration, collegeId, createdBy } = body

    const program = await db.program.create({
      data: {
        name,
        code,
        description,
        duration,
        collegeId,
        createdBy
      },
      include: {
        college: true
      }
    })

    return NextResponse.json(program)
  } catch (error) {
    console.error('Failed to create program:', error)
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    )
  }
}