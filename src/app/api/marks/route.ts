import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('assessmentId')
    const studentId = searchParams.get('studentId')
    const questionId = searchParams.get('questionId')

    const marks = await db.mark.findMany({
      where: {
        ...(assessmentId && { assessmentId }),
        ...(studentId && { studentId }),
        ...(questionId && { questionId })
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true
          }
        },
        assessment: {
          select: {
            name: true,
            type: true,
            course: {
              select: {
                code: true,
                name: true
              }
            }
          }
        },
        question: {
          select: {
            name: true,
            maxMarks: true,
            co: {
              select: {
                code: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: {
        student: {
          rollNumber: 'asc'
        }
      }
    })

    return NextResponse.json(marks)
  } catch (error) {
    console.error('Failed to fetch marks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { marks: marksData } = body

    if (!Array.isArray(marksData)) {
      return NextResponse.json(
        { error: 'Marks data must be an array' },
        { status: 400 }
      )
    }

    // Process marks in a transaction
    const results = []
    
    for (const markData of marksData) {
      const { studentId, assessmentId, questionId, marks } = markData

      if (!studentId || !assessmentId || !questionId || marks === undefined) {
        return NextResponse.json(
          { error: 'Missing required fields for mark entry' },
          { status: 400 }
        )
      }

      // Validate that the student, assessment, and question exist
      const [student, assessment, question] = await Promise.all([
        db.student.findUnique({ where: { id: studentId } }),
        db.assessment.findUnique({ where: { id: assessmentId } }),
        db.assessmentQuestion.findUnique({ where: { id: questionId } })
      ])

      if (!student || !assessment || !question) {
        return NextResponse.json(
          { error: 'Invalid student, assessment, or question ID' },
          { status: 400 }
        )
      }

      // Validate marks don't exceed max marks
      if (marks > question.maxMarks) {
        return NextResponse.json(
          { error: `Marks cannot exceed maximum marks (${question.maxMarks})` },
          { status: 400 }
        )
      }

      // Upsert the mark (create or update)
      const mark = await db.mark.upsert({
        where: {
          studentId_assessmentId_questionId: {
            studentId,
            assessmentId,
            questionId
          }
        },
        update: {
          marks
        },
        create: {
          studentId,
          assessmentId,
          questionId,
          marks
        }
      })

      results.push(mark)
    }

    return NextResponse.json({ 
      message: 'Marks saved successfully',
      count: results.length 
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to save marks:', error)
    return NextResponse.json(
      { error: 'Failed to save marks' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, assessmentId, questionId, marks } = body

    if (!studentId || !assessmentId || !questionId || marks === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const mark = await db.mark.update({
      where: {
        studentId_assessmentId_questionId: {
          studentId,
          assessmentId,
          questionId
        }
      },
      data: {
        marks
      }
    })

    return NextResponse.json(mark)
  } catch (error) {
    console.error('Failed to update mark:', error)
    return NextResponse.json(
      { error: 'Failed to update mark' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const assessmentId = searchParams.get('assessmentId')
    const questionId = searchParams.get('questionId')

    if (!studentId || !assessmentId || !questionId) {
      return NextResponse.json(
        { error: 'Student ID, Assessment ID, and Question ID are required' },
        { status: 400 }
      )
    }

    await db.mark.delete({
      where: {
        studentId_assessmentId_questionId: {
          studentId,
          assessmentId,
          questionId
        }
      }
    })

    return NextResponse.json({ message: 'Mark deleted successfully' })
  } catch (error) {
    console.error('Failed to delete mark:', error)
    return NextResponse.json(
      { error: 'Failed to delete mark' },
      { status: 500 }
    )
  }
}