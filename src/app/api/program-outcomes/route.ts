import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')

    const pos = await db.programOutcome.findMany({
      where: programId ? { programId } : {},
      include: {
        program: {
          select: {
            name: true,
            code: true
          }
        },
        coPoMappings: {
          include: {
            co: {
              select: {
                code: true,
                description: true,
                course: {
                  select: {
                    name: true,
                    code: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    })

    return NextResponse.json(pos)
  } catch (error) {
    console.error('Failed to fetch program outcomes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch program outcomes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, description, programId, indirectAttainment } = body

    const po = await db.programOutcome.create({
      data: {
        code,
        description,
        programId,
        indirectAttainment: indirectAttainment || 3.0
      },
      include: {
        program: true
      }
    })

    return NextResponse.json(po)
  } catch (error) {
    console.error('Failed to create program outcome:', error)
    return NextResponse.json(
      { error: 'Failed to create program outcome' },
      { status: 500 }
    )
  }
}