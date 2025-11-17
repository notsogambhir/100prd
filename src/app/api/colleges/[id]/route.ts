import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collegeId = params.id

    // Check if college exists
    const college = await db.college.findUnique({
      where: { id: collegeId },
      include: {
        _count: {
          select: {
            programs: true
          }
        }
      }
    })

    if (!college) {
      return NextResponse.json(
        { message: 'College not found' },
        { status: 404 }
      )
    }

    // Delete the college (cascade will handle related records)
    await db.college.delete({
      where: { id: collegeId }
    })

    return NextResponse.json(
      { message: 'College deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting college:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}