import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const colleges = await db.college.findMany({
      include: {
        _count: {
          select: {
            programs: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(colleges)
  } catch (error) {
    console.error('Error fetching colleges:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, code } = await request.json()

    if (!name || !code) {
      return NextResponse.json(
        { message: 'Name and code are required' },
        { status: 400 }
      )
    }

    // Check if college with same code already exists
    const existingCollege = await db.college.findUnique({
      where: { code }
    })

    if (existingCollege) {
      return NextResponse.json(
        { message: 'College with this code already exists' },
        { status: 409 }
      )
    }

    const college = await db.college.create({
      data: {
        name,
        code
      }
    })

    return NextResponse.json(college, { status: 201 })
  } catch (error) {
    console.error('Error creating college:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}