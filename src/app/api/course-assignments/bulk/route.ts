import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { assignments } = await request.json()

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { message: 'Assignments array is required' },
        { status: 400 }
      )
    }

    // Use transaction to ensure all or nothing
    await db.$transaction(async (tx) => {
      for (const assignment of assignments) {
        const { courseId, sectionId, teacherId } = assignment

        // Delete existing assignment for this section if any
        await tx.courseAssignment.deleteMany({
          where: {
            courseId,
            sectionId
          }
        })

        // Create new assignment
        if (teacherId) {
          await tx.courseAssignment.create({
            data: {
              courseId,
              sectionId,
              teacherId
            }
          })
        }
      }
    })

    return NextResponse.json(
      { message: 'Assignments saved successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving bulk assignments:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}