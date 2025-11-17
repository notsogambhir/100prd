import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { questionName, maxMarks, assessmentId, coId } = await request.json()

    if (!questionName || !maxMarks || !assessmentId) {
      return NextResponse.json(
        { message: 'Question name, max marks, and assessment ID are required' },
        { status: 400 }
      )
    }

    const question = await db.assessmentQuestion.create({
      data: {
        questionName,
        maxMarks: parseFloat(maxMarks),
        assessmentId,
        coId: coId || null
      },
      include: {
        assessment: {
          select: {
            name: true
          }
        },
        co: {
          select: {
            code: true
          }
        }
      }
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}