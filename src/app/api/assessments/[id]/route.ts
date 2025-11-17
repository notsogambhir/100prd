import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id

    // Check if assessment exists
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      }
    })

    if (!assessment) {
      return NextResponse.json(
        { message: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Delete assessment (cascade will handle questions and marks)
    await db.assessment.delete({
      where: { id: assessmentId }
    })

    return NextResponse.json(
      { message: 'Assessment deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting assessment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}