import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    const mappings = await db.coPoMapping.findMany({
      where: courseId ? { courseId } : undefined,
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        },
        co: {
          select: {
            code: true,
            description: true
          }
        },
        po: {
          select: {
            code: true,
            description: true
          }
        }
      },
      orderBy: [
        { co: { code: 'asc' } },
        { po: { code: 'asc' } }
      ]
    })

    return NextResponse.json(mappings)
  } catch (error) {
    console.error('Error fetching CO-PO mappings:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { courseId, coId, poId, level } = await request.json()

    if (!courseId || !coId || !poId || level === undefined) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (level < 0 || level > 3) {
      return NextResponse.json(
        { message: 'Level must be between 0 and 3' },
        { status: 400 }
      )
    }

    // Check if mapping already exists
    const existingMapping = await db.coPoMapping.findUnique({
      where: {
        courseId_coId_poId: {
          courseId,
          coId,
          poId
        }
      }
    })

    if (existingMapping) {
      // Update existing mapping
      const updatedMapping = await db.coPoMapping.update({
        where: { id: existingMapping.id },
        data: { level },
        include: {
          course: {
            select: {
              name: true,
              code: true
            }
          },
          co: {
            select: {
              code: true,
              description: true
            }
          },
          po: {
            select: {
              code: true,
              description: true
            }
          }
        }
      })

      return NextResponse.json(updatedMapping)
    } else {
      // Create new mapping
      const mapping = await db.coPoMapping.create({
        data: {
          courseId,
          coId,
          poId,
          level
        },
        include: {
          course: {
            select: {
              name: true,
              code: true
            }
          },
          co: {
            select: {
              code: true,
              description: true
            }
          },
          po: {
            select: {
              code: true,
              description: true
            }
          }
        }
      })

      return NextResponse.json(mapping, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating CO-PO mapping:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const coId = searchParams.get('coId')
    const poId = searchParams.get('poId')

    if (!courseId || !coId || !poId) {
      return NextResponse.json(
        { message: 'Course ID, CO ID, and PO ID are required' },
        { status: 400 }
      )
    }

    // Find and delete mapping
    const existingMapping = await db.coPoMapping.findUnique({
      where: {
        courseId_coId_poId: {
          courseId,
          coId,
          poId
        }
      }
    })

    if (!existingMapping) {
      return NextResponse.json(
        { message: 'Mapping not found' },
        { status: 404 }
      )
    }

    await db.coPoMapping.delete({
      where: { id: existingMapping.id }
    })

    return NextResponse.json(
      { message: 'CO-PO mapping deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting CO-PO mapping:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}