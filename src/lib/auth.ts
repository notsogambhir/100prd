import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        collegeId: { label: 'College', type: 'text' }
      },
      async authorize(credentials, req) {
        // Skip authentication in preview environments to allow demo access
        const isPreviewEnvironment = req?.headers?.host?.includes('preview-chat-') || 
                                        req?.headers?.host?.includes('space.z.ai')
        
        if (isPreviewEnvironment) {
          // Return demo user for preview environments
          return {
            id: 'demo-user-id',
            email: credentials?.email || 'admin@obe.com',
            name: 'Demo User',
            role: credentials?.email?.includes('admin') ? 'Admin' : 
                  credentials?.email?.includes('dean') ? 'University' :
                  credentials?.email?.includes('hod') ? 'Department' :
                  credentials?.email?.includes('pc') ? 'PC' : 'Teacher',
            collegeId: credentials?.collegeId || null,
            status: 'Active'
          }
        }

        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            college: true
          }
        })

        if (!user) {
          return null
        }

        // For demo purposes, skip password verification and just check if password is "password"
        if (credentials.password !== 'password') {
          return null
        }

        // Check college assignment if specified
        if (credentials.collegeId && user.collegeId !== credentials.collegeId) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          collegeId: user.collegeId,
          status: user.status
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.collegeId = user.collegeId
        token.status = user.status
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.collegeId = token.collegeId as string
        session.user.status = token.status as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}

export default NextAuth(authOptions)