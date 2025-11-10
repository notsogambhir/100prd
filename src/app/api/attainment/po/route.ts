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

    if (programId) {
      // Get all POs for the program and calculate their attainment
      const pos = await db.programOutcome.findMany({
        where: { programId },
        select: { id: true, code: true, description: true, indirectAttainment: true },
        include: {
          program: {
            select: {
              name: true,
              code: true
            }
          }
        }
      })

      // Calculate attainment for each PO using the new engine
      const poAttainments = await Promise.all(
        pos.map(async (po) => {
          // Call the calculation engine
          const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/attainment/calculate?type=overall-po&poId=${po.id}`)
          const data = await response.json()
          
          return {
            id: po.id,
            code: po.code,
            description: po.description,
            indirectAttainment: po.indirectAttainment || 3.0,
            overallAttainment: data
          }
        })
      )

      return NextResponse.json({
        program: {
          id: programId,
          pos: poAttainments
        }
      })
    } else {
      // Get single PO with attainment
      const po = await db.programOutcome.findUnique({
        where: { id: poId },
        select: {
          id: true,
          code: true,
          description: true,
          indirectAttainment: true,
          program: {
            select: {
              name: true,
              code: true
            }
          }
        },
        include: {
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

      // Calculate attainment using the new engine
      const [directAttainment, overallAttainment] = await Promise.all([
        (await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/attainment/calculate?type=direct-po&poId=${poId}`)).json(),
        (await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/attainment/calculate?type=overall-po&poId=${poId}`)).json()
      ])

      return NextResponse.json({
        po: {
          id: po.id,
          code: po.code,
          description: po.description,
          program: po.program,
          indirectAttainment: po.indirectAttainment || 3.0
        },
        calculations: {
          directAttainment: parseFloat(directAttainment.toFixed(2)),
          indirectAttainment: parseFloat((po.indirectAttainment || 3.0).toFixed(2)),
          directWeight: 70,
          indirectWeight: 30,
          overallAttainment: parseFloat(overallAttainment.toFixed(2))
        },
        details: {
          coPoMappings: po.coPoMappings
        }
      })
    }

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