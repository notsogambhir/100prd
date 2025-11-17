import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const { username, email, name, role, collegeId, password } = await request.json()

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if username or email is taken by another user
    if (username !== existingUser.username || email !== existingUser.email) {
      const duplicateUser = await db.user.findFirst({
        where: {
          OR: [
            { username },
            { email }
          ],
          NOT: {
            id: userId
          }
        }
      })

      if (duplicateUser) {
        return NextResponse.json(
          { message: 'Username or email already exists' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      username,
      email,
      name,
      role,
      collegeId: collegeId || null
    }

    // Add password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        college: {
          select: {
            name: true
          }
        }
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Delete the user (cascade will handle related records)
    await db.user.delete({
      where: { id: userId }
    })

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}