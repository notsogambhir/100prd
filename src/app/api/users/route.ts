import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const collegeId = searchParams.get('collegeId')

    const users = await db.user.findMany({
      where: {
        ...(role && { role }),
        ...(collegeId && { collegeId })
      },
      include: {
        college: {
          select: {
            name: true
          }
        },
        managedPrograms: {
          select: {
            id: true,
            name: true
          }
        },
        assignedCourses: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return NextResponse.json(usersWithoutPasswords)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, role, collegeId, status } = body

    // For demo purposes, use plain text password
    const user = await db.user.create({
      data: {
        email,
        password: 'password', // Default password for demo
        name,
        role,
        collegeId,
        status: status || 'Active'
      },
      include: {
        college: true
      }
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}