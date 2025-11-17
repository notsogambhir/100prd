import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')

    const programOutcomes = await db.programOutcome.findMany({
      where: programId ? { programId } : undefined,
      include: {
        program: {
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

    return NextResponse.json(programOutcomes)
  } catch (error) {
    console.error('Error fetching program outcomes:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, description, programId } = await request.json()

    if (!code || !description || !programId) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if PO with same code exists in this program
    const existingPO = await db.programOutcome.findFirst({
      where: {
        code,
        programId
      }
    })

    if (existingPO) {
      return NextResponse.json(
        { message: 'Program outcome with this code already exists in this program' },
        { status: 409 }
      )
    }

    const programOutcome = await db.programOutcome.create({
      data: {
        code,
        description,
        programId
      },
      include: {
        program: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json(programOutcome, { status: 201 })
  } catch (error) {
    console.error('Error creating program outcome:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}