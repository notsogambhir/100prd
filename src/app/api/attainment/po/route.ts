import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const poId = searchParams.get('poId')
    const programId = searchParams.get('programId')

    if (!poId && !programId) {
      return NextResponse.json(
        { error: 'PO ID or Program ID is required' },
        { status: 400 }
      )
    }

    // Get PO with basic info
    const po = await db.programOutcome.findFirst({
      where: {
        poId: poId || undefined,
        programId: programId || undefined
      },
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
                description: true
              }
            }
          }
        }
      }
    })

    if (!po) {
      return NextResponse.json(
        { error: 'Program Outcome not found' },
        { status: 404 }
      )
    }

    // Get indirect attainment from database
    const indirectAttainment = po.indirectAttainment || 3.0

    // Calculate direct PO attainment (simplified version)
    const directAttainment = 2.5 // Placeholder value

    // Get system settings for weights
    const directWeight = 70
    const indirectWeight = 30

    // Calculate overall PO attainment
    const overallAttainment = (directAttainment * (directWeight / 100)) + (indirectAttainment * (indirectWeight / 100))

    return NextResponse.json({
      po: {
        id: po.id,
        code: po.code,
        description: po.description,
        program: po.program,
        indirectAttainment
      },
      calculations: {
        directAttainment: parseFloat(directAttainment.toFixed(2)),
        indirectAttainment: parseFloat(indirectAttainment.toFixed(2)),
        directWeight,
        indirectWeight,
        overallAttainment: parseFloat(overallAttainment.toFixed(2))
      },
      details: {
        coPoMappings: po.coPoMappings
      }
    })

  } catch (error) {
    console.error('Failed to calculate PO attainment:', error)
    return NextResponse.json(
      { error: 'Failed to calculate PO attainment' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { poId, indirectAttainment } = body

    if (!poId || indirectAttainment === undefined) {
      return NextResponse.json(
        { error: 'PO ID and indirect attainment are required' },
        { status: 400 }
      )
    }

    // Validate indirect attainment
    if (indirectAttainment < 0 || indirectAttainment > 3) {
      return NextResponse.json(
        { error: 'Indirect attainment must be between 0 and 3' },
        { status: 400 }
      )
    }

    // Update PO with new indirect attainment
    const updatedPo = await db.programOutcome.update({
      where: { id: poId },
      data: {
        indirectAttainment
      }
    })

    return NextResponse.json({
      message: 'Indirectainment updated successfully',
      po: updatedPo
    })

  } catch (error) {
    console.error('Failed to update indirect attainment:', error)
    return NextResponse.json(
      { error: 'Failed to update indirect attainment' },
      { status: 500 }
    )
  }
}