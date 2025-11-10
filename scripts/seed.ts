import { db } from '@/lib/db'

export async function seedDatabase() {
  try {
    // Create a default college
    const college = await db.college.create({
      data: {
        name: 'Engineering College',
        description: 'Main engineering college'
      }
    })

    // Create admin user
    const adminUser = await db.user.create({
      data: {
        email: 'admin@obe.com',
        password: 'password',
        name: 'Admin User',
        role: 'Admin',
        collegeId: college.id,
        status: 'Active'
      }
    })

    // Create demo teacher
    const teacherUser = await db.user.create({
      data: {
        email: 'teacher@obe.com',
        password: 'password',
        name: 'Teacher User',
        role: 'Teacher',
        collegeId: college.id,
        status: 'Active'
      }
    })

    console.log('Database seeded successfully')
    return { college, adminUser, teacherUser }
  } catch (error) {
    console.error('Failed to seed database:', error)
    throw error
  }
}