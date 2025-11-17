import { PrismaClient, UserRole, CourseStatus, StudentStatus, AssessmentType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Colleges
  const engineeringCollege = await prisma.college.create({
    data: {
      name: 'Engineering College',
      code: 'ENG'
    }
  })

  const managementCollege = await prisma.college.create({
    data: {
      name: 'Management College', 
      code: 'MGT'
    }
  })

  // Create Users
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@obe.edu',
      password: await bcrypt.hash('password', 10),
      name: 'System Administrator',
      role: UserRole.ADMIN
    }
  })

  const dean = await prisma.user.create({
    data: {
      username: 'dean',
      email: 'dean@obe.edu',
      password: await bcrypt.hash('password', 10),
      name: 'Dean of Academics',
      role: UserRole.UNIVERSITY
    }
  })

  const hod = await prisma.user.create({
    data: {
      username: 'hod',
      email: 'hod@obe.edu',
      password: await bcrypt.hash('password', 10),
      name: 'Department Head',
      role: UserRole.DEPARTMENT,
      collegeId: engineeringCollege.id
    }
  })

  const pc = await prisma.user.create({
    data: {
      username: 'pc',
      email: 'pc@obe.edu',
      password: await bcrypt.hash('password', 10),
      name: 'Program Co-ordinator',
      role: UserRole.PC,
      collegeId: engineeringCollege.id
    }
  })

  const teacher = await prisma.user.create({
    data: {
      username: 'teacher',
      email: 'teacher@obe.edu',
      password: await bcrypt.hash('password', 10),
      name: 'Faculty Member',
      role: UserRole.TEACHER,
      collegeId: engineeringCollege.id
    }
  })

  // Create Programs
  const beProgram = await prisma.program.create({
    data: {
      name: 'Bachelor of Engineering',
      code: 'BE',
      duration: 4,
      collegeId: engineeringCollege.id,
      coordinatorId: pc.id
    }
  })

  // Create Batches
  const batch2025 = await prisma.batch.create({
    data: {
      name: '2025-2029',
      startYear: 2025,
      endYear: 2029,
      programId: beProgram.id
    }
  })

  // Create Sections
  const sectionA = await prisma.section.create({
    data: {
      name: 'A',
      batchId: batch2025.id
    }
  })

  const sectionB = await prisma.section.create({
    data: {
      name: 'B',
      batchId: batch2025.id
    }
  })

  // Create Program Outcomes
  const pos = []
  for (let i = 1; i <= 12; i++) {
    const po = await prisma.programOutcome.create({
      data: {
        code: `PO${i}`,
        description: `Program Outcome ${i}: Engineering knowledge and problem solving`,
        programId: beProgram.id
      }
    })
    pos.push(po)
  }

  // Create Courses
  const mathCourse = await prisma.course.create({
    data: {
      code: 'MA101',
      name: 'Mathematics I',
      credits: 4,
      programId: beProgram.id,
      batchId: batch2025.id,
      status: CourseStatus.ACTIVE
    }
  })

  const physicsCourse = await prisma.course.create({
    data: {
      code: 'PH101',
      name: 'Physics I',
      credits: 3,
      programId: beProgram.id,
      batchId: batch2025.id,
      status: CourseStatus.ACTIVE
    }
  })

  // Create Course Outcomes for Mathematics
  const mathCOs = []
  for (let i = 1; i <= 5; i++) {
    const co = await prisma.courseOutcome.create({
      data: {
        code: `CO${i}`,
        description: `Course Outcome ${i}: Apply mathematical concepts`,
        courseId: mathCourse.id
      }
    })
    mathCOs.push(co)
  }

  // Create CO-PO Mappings for Mathematics
  for (const co of mathCOs) {
    for (let i = 0; i < 3; i++) {
      await prisma.coPoMapping.create({
        data: {
          courseId: mathCourse.id,
          coId: co.id,
          poId: pos[i].id,
          level: Math.floor(Math.random() * 3) + 1
        }
      })
    }
  }

  // Create Sample Students
  const students = []
  for (let i = 1; i <= 20; i++) {
    const student = await prisma.student.create({
      data: {
        registerNo: `BE2025${String(i).padStart(3, '0')}`,
        name: `Student ${i}`,
        email: `student${i}@obe.edu`,
        status: StudentStatus.ACTIVE,
        sectionId: i <= 10 ? sectionA.id : sectionB.id
      }
    })
    students.push(student)

    // Enroll students in courses
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId: mathCourse.id
      }
    })
  }

  // Create Assessments
  const midtermAssessment = await prisma.assessment.create({
    data: {
      name: 'Mid-Term Examination',
      type: AssessmentType.INTERNAL,
      courseId: mathCourse.id,
      sectionId: sectionA.id
    }
  })

  // Create Assessment Questions
  const questions = []
  for (let i = 1; i <= 5; i++) {
    const question = await prisma.assessmentQuestion.create({
      data: {
        assessmentId: midtermAssessment.id,
        questionName: `Q${i}`,
        maxMarks: 20,
        coId: mathCOs[i - 1].id
      }
    })
    questions.push(question)
  }

  // Create Sample Marks
  for (const student of students.slice(0, 10)) {
    for (const question of questions) {
      await prisma.mark.create({
        data: {
          studentId: student.id,
          assessmentQuestionId: question.id,
          marks: Math.floor(Math.random() * 20) + 1
        }
      })
    }
  }

  // Assign teachers to courses
  await prisma.courseAssignment.create({
    data: {
      courseId: mathCourse.id,
      teacherId: teacher.id,
      sectionId: sectionA.id
    }
  })

  // Assign teacher to PC
  await prisma.teacherAssignment.create({
    data: {
      teacherId: teacher.id,
      pcId: pc.id
    }
  })

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