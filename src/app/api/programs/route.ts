import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const programs = await db.program.findMany({
      include: {
        college: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
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
    console.error('Error fetching programs:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, code, duration, collegeId } = await request.json()

    if (!name || !code || !duration || !collegeId) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if program with same code exists in the same college
    const existingProgram = await db.program.findFirst({
      where: {
        code,
        collegeId
      }
    })

    if (existingProgram) {
      return NextResponse.json(
        { message: 'Program with this code already exists in this college' },
        { status: 409 }
      )
    }

    const program = await db.program.create({
      data: {
        name,
        code,
        duration: parseInt(duration),
        collegeId
      }
    })

    return NextResponse.json(program, { status: 201 })
  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}