import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const colleges = await db.college.findMany({
      include: {
        _count: {
          select: {
            programs: true,
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(colleges)
  } catch (error) {
    console.error('Failed to fetch colleges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch colleges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, createdBy } = body

    const college = await db.college.create({
      data: {
        name,
        description,
        createdBy
      }
    })

    return NextResponse.json(college)
  } catch (error) {
    console.error('Failed to create college:', error)
    return NextResponse.json(
      { error: 'Failed to create college' },
      { status: 500 }
    )
  }
}