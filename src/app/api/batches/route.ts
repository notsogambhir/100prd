import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const batches = await db.batch.findMany({
      include: {
        program: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        startYear: 'desc'
      }
    })

    return NextResponse.json(batches)
  } catch (error) {
    console.error('Error fetching batches:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { programId, startYear } = await request.json()

    if (!programId || !startYear) {
      return NextResponse.json(
        { message: 'Program and start year are required' },
        { status: 400 }
      )
    }

    // Get program to calculate duration
    const program = await db.program.findUnique({
      where: { id: programId }
    })

    if (!program) {
      return NextResponse.json(
        { message: 'Program not found' },
        { status: 404 }
      )
    }

    const endYear = startYear + program.duration
    const batchName = `${startYear}-${endYear}`

    // Check if batch already exists
    const existingBatch = await db.batch.findFirst({
      where: {
        programId,
        name: batchName
      }
    })

    if (existingBatch) {
      return NextResponse.json(
        { message: 'Batch already exists for this program and year' },
        { status: 409 }
      )
    }

    const batch = await db.batch.create({
      data: {
        name: batchName,
        startYear: parseInt(startYear),
        endYear,
        programId
      }
    })

    return NextResponse.json(batch, { status: 201 })
  } catch (error) {
    console.error('Error creating batch:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}