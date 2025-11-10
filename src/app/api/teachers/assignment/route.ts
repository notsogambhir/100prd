import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collegeId = searchParams.get('collegeId')
    const pcId = searchParams.get('pcId')

    const teachers = await db.user.findMany({
      where: {
        role: 'Teacher',
        ...(collegeId && { collegeId })
      },
      include: {
        college: {
          select: {
            name: true
          }
        },
        teacherToPcs: {
          include: {
            pc: {
              select: {
                id: true,
                name: true,
                college: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Remove passwords from response
    const teachersWithoutPasswords = teachers.map(teacher => {
      const { password, ...teacherWithoutPassword } = teacher
      return teacherWithoutPassword
    })

    return NextResponse.json(teachersWithoutPasswords)
  } catch (error) {
    console.error('Failed to fetch teachers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, pcIds } = body

    // Delete existing assignments
    await db.teacherToPc.deleteMany({
      where: { teacherId }
    })

    // Create new assignments
    if (pcIds && pcIds.length > 0) {
      await db.teacherToPc.createMany({
        data: pcIds.map((pcId: string) => ({
          teacherId,
          pcId
        }))
      })
    }

    return NextResponse.json({ message: 'Teacher assignments updated successfully' })
  } catch (error) {
    console.error('Failed to update teacher assignments:', error)
    return NextResponse.json(
      { error: 'Failed to update teacher assignments' },
      { status: 500 }
    )
  }
}