import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')

    const sections = await db.section.findMany({
      where: batchId ? { batchId } : {},
      include: {
        batch: {
          select: {
            name: true,
            startYear: true,
            endYear: true
          }
        },
        students: {
          select: {
            id: true
          }
        },
        courses: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error('Failed to fetch sections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, batchId } = body

    const section = await db.section.create({
      data: {
        name,
        batchId
      },
      include: {
        batch: true
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Failed to create section:', error)
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    )
  }
}