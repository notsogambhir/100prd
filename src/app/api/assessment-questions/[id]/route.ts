import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id

    // Check if question exists
    const question = await db.assessmentQuestion.findUnique({
      where: { id: questionId },
      include: {
        _count: {
          select: {
            marks: true
          }
        }
      }
    })

    if (!question) {
      return NextResponse.json(
        { message: 'Question not found' },
        { status: 404 }
      )
    }

    // Delete question (cascade will handle marks)
    await db.assessmentQuestion.delete({
      where: { id: questionId }
    })

    return NextResponse.json(
      { message: 'Question deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}