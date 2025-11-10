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
        pc: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            courses: true,
            batches: true
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { programId, pcId } = body

    const program = await db.program.update({
      where: { id: programId },
      data: { pcId },
      include: {
        pc: true
      }
    })

    return NextResponse.json(program)
  } catch (error) {
    console.error('Failed to update program PC:', error)
    return NextResponse.json(
      { error: 'Failed to update program PC' },
      { status: 500 }
    )
  }
}