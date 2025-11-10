import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const coId = searchParams.get('coId')
    const poId = searchParams.get('poId')

    const where: any = {}
    if (courseId) {
      // Find all COs for this course, then get their mappings
      const cos = await db.courseOutcome.findMany({
        where: { courseId },
        select: { id: true }
      })
      where.coId = { in: cos.map(co => co.id) }
    }
    if (coId) where.coId = coId
    if (poId) where.poId = poId

    const mappings = await db.coPoMapping.findMany({
      where,
      include: {
        co: {
          select: {
            id: true,
            code: true,
            description: true
          }
        },
        po: {
          select: {
            id: true,
            code: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json(mappings)
  } catch (error) {
    console.error('Failed to fetch CO-PO mappings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CO-PO mappings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mappings } = body

    if (!mappings || !Array.isArray(mappings)) {
      return NextResponse.json(
        { error: 'Mappings array is required' },
        { status: 400 }
      )
    }

    // Delete existing mappings for the provided COs
    const coIds = [...new Set(mappings.map(m => m.coId))]
    await db.coPoMapping.deleteMany({
      where: {
        coId: { in: coIds }
      }
    })

    // Create new mappings
    const result = await db.coPoMapping.createMany({
      data: mappings.filter(m => m.level > 0), // Only create mappings with level > 0
      skipDuplicates: true
    })

    return NextResponse.json({ created: result.count })
  } catch (error) {
    console.error('Failed to create CO-PO mappings:', error)
    return NextResponse.json(
      { error: 'Failed to create CO-PO mappings' },
      { status: 500 }
    )
  }
}