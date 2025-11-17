const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function checkDatabase() {
  try {
    console.log('Checking database...')
    
    // Check colleges
    const colleges = await prisma.college.findMany()
    console.log('Colleges found:', colleges.length)
    colleges.forEach(college => {
      console.log(`- ${college.name} (${college.code})`)
    })
    
    // Check users
    const users = await prisma.user.findMany()
    console.log('Users found:', users.length)
    users.forEach(user => {
      console.log(`- ${user.name} (${user.username}) - ${user.role}`)
    })
    
    // Check if demo users exist
    const adminUser = users.find(u => u.username === 'admin')
    const teacherUser = users.find(u => u.username === 'teacher')
    const pcUser = users.find(u => u.username === 'pc')
    
    console.log('\nDemo Users Status:')
    console.log('Admin user exists:', !!adminUser)
    console.log('Teacher user exists:', !!teacherUser)
    console.log('PC user exists:', !!pcUser)
    
  } catch (error) {
    console.error('Database check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()