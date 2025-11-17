import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const programId = params.id

    // Check if program exists
    const program = await db.program.findUnique({
      where: { id: programId },
      include: {
        _count: {
          select: {
            batches: true,
            courses: true
          }
        }
      }
    })

    if (!program) {
      return NextResponse.json(
        { message: 'Program not found' },
        { status: 404 }
      )
    }

    // Delete the program (cascade will handle related records)
    await db.program.delete({
      where: { id: programId }
    })

    return NextResponse.json(
      { message: 'Program deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting program:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}