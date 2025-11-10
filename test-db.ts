import { db } from '@/lib/db'

export async function testConnection() {
  try {
    const count = await db.user.count()
    console.log('User count:', count)
    return count
  } catch (error) {
    console.error('Database connection error:', error)
    return 0
  }
}