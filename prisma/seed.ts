import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // First create the admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@obe.com' },
    update: {},
    create: {
      email: 'admin@obe.com',
      password: 'password', // Plain text for demo purposes
      name: 'System Administrator',
      role: 'Admin',
      status: 'Active'
    }
  })

  // Create colleges
  const engineeringCollege = await prisma.college.upsert({
    where: { name: 'Engineering College' },
    update: {},
    create: {
      name: 'Engineering College',
      description: 'College of Engineering and Technology',
      createdBy: admin.id
    }
  })

  const managementCollege = await prisma.college.upsert({
    where: { name: 'Management College' },
    update: {},
    create: {
      name: 'Management College',
      description: 'College of Business Administration',
      createdBy: admin.id
    }
  })

  // Create other users
  const dean = await prisma.user.upsert({
    where: { email: 'dean@obe.com' },
    update: {},
    create: {
      email: 'dean@obe.com',
      password: 'password',
      name: 'University Dean',
      role: 'University',
      status: 'Active'
    }
  })

  const hod = await prisma.user.upsert({
    where: { email: 'hod@obe.com' },
    update: {},
    create: {
      email: 'hod@obe.com',
      password: 'password',
      name: 'Department Head',
      role: 'Department',
      status: 'Active',
      collegeId: engineeringCollege.id
    }
  })

  const pc = await prisma.user.upsert({
    where: { email: 'pc@obe.com' },
    update: {},
    create: {
      email: 'pc@obe.com',
      password: 'password',
      name: 'Program Coordinator',
      role: 'PC',
      status: 'Active',
      collegeId: engineeringCollege.id
    }
  })

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@obe.com' },
    update: {},
    create: {
      email: 'teacher@obe.com',
      password: 'password',
      name: 'Teacher',
      role: 'Teacher',
      status: 'Active',
      collegeId: engineeringCollege.id
    }
  })

  // Create programs
  const beProgram = await prisma.program.upsert({
    where: { code: 'BE-CSE' },
    update: {},
    create: {
      name: 'Bachelor of Engineering - Computer Science',
      code: 'BE-CSE',
      description: 'Computer Science and Engineering Program',
      duration: 4,
      collegeId: engineeringCollege.id,
      pcId: pc.id,
      createdBy: admin.id
    }
  })

  const mbaProgram = await prisma.program.upsert({
    where: { code: 'MBA' },
    update: {},
    create: {
      name: 'Master of Business Administration',
      code: 'MBA',
      description: 'Business Administration Program',
      duration: 2,
      collegeId: managementCollege.id,
      createdBy: admin.id
    }
  })

  // Create batches
  const currentBatch = await prisma.batch.create({
    data: {
      name: '2025-2029',
      startYear: 2025,
      endYear: 2029,
      programId: beProgram.id,
      createdBy: admin.id
    }
  })

  const previousBatch = await prisma.batch.create({
    data: {
      name: '2024-2028',
      startYear: 2024,
      endYear: 2028,
      programId: beProgram.id,
      createdBy: admin.id
    }
  })

  // Create sections
  const sectionA = await prisma.section.create({
    data: {
      name: 'A',
      batchId: currentBatch.id
    }
  })

  const sectionB = await prisma.section.create({
    data: {
      name: 'B',
      batchId: currentBatch.id
    }
  })

  // Create some sample courses
  const course1 = await prisma.course.create({
    data: {
      code: 'CS101',
      name: 'Introduction to Programming',
      description: 'Basic programming concepts',
      credits: 4,
      status: 'Active',
      programId: beProgram.id,
      batchId: currentBatch.id,
      sectionId: sectionA.id,
      teacherId: teacher.id,
      createdBy: pc.id
    }
  })

  const course2 = await prisma.course.create({
    data: {
      code: 'CS201',
      name: 'Data Structures',
      description: 'Advanced data structures and algorithms',
      credits: 4,
      status: 'Active',
      programId: beProgram.id,
      batchId: currentBatch.id,
      sectionId: sectionA.id,
      teacherId: teacher.id,
      createdBy: pc.id
    }
  })

  // Create some sample students
  for (let i = 1; i <= 10; i++) {
    await prisma.student.upsert({
      where: { rollNumber: `BE25CS${i.toString().padStart(3, '0')}` },
      update: {},
      create: {
        name: `Student ${i}`,
        email: `student${i}@obe.com`,
        rollNumber: `BE25CS${i.toString().padStart(3, '0')}`,
        status: 'Active',
        sectionId: sectionA.id
      }
    })
  }

  // Create program outcomes
  for (let i = 1; i <= 12; i++) {
    await prisma.programOutcome.create({
      data: {
        code: `PO${i}`,
        description: `Program Outcome ${i}: Engineering knowledge and problem solving`,
        programId: beProgram.id
      }
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })