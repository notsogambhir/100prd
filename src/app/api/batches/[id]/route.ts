import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const batchId = params.id

    // Check if batch exists
    const batch = await db.batch.findUnique({
      where: { id: batchId },
      include: {
        _count: {
          select: {
            sections: true,
            courses: true
          }
        }
      }
    })

    if (!batch) {
      return NextResponse.json(
        { message: 'Batch not found' },
        { status: 404 }
      )
    }

    // Delete the batch (cascade will handle related records)
    await db.batch.delete({
      where: { id: batchId }
    })

    return NextResponse.json(
      { message: 'Batch deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting batch:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}