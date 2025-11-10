import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const batches = await db.batch.findMany({
      include: {
        program: {
          include: {
            college: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            sections: true,
            courses: true
          }
        }
      },
      orderBy: {
        startYear: 'desc'
      }
    })

    return NextResponse.json(batches)
  } catch (error) {
    console.error('Failed to fetch batches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, startYear, endYear, programId, createdBy } = body

    const batch = await db.batch.create({
      data: {
        name,
        startYear,
        endYear,
        programId,
        createdBy
      },
      include: {
        program: {
          include: {
            college: true
          }
        }
      }
    })

    return NextResponse.json(batch)
  } catch (error) {
    console.error('Failed to create batch:', error)
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    )
  }
}