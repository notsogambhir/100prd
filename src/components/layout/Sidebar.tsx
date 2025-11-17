'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  LogOut,
  Menu,
  X,
  Building,
  UserCheck,
  FileText,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const getNavItems = () => {
    const items = []

    // Dashboard - available to all roles
    items.push({
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/',
      roles: ['ADMIN', 'UNIVERSITY', 'DEPARTMENT', 'PC', 'TEACHER']
    })

    // Admin specific items
    if (user?.role === 'ADMIN') {
      items.push({
        title: 'Academic Structure',
        icon: Building,
        href: '/admin/academic-structure',
        roles: ['ADMIN']
      })
      items.push({
        title: 'User Management',
        icon: Users,
        href: '/admin/users',
        roles: ['ADMIN']
      })
    }

    // Department Head specific items
    if (user?.role === 'DEPARTMENT') {
      items.push({
        title: 'Faculty Management',
        icon: UserCheck,
        href: '/department/faculty',
        roles: ['DEPARTMENT']
      })
      items.push({
        title: 'Student Management',
        icon: GraduationCap,
        href: '/department/students',
        roles: ['DEPARTMENT']
      })
    }

    // Program Co-ordinator specific items
    if (user?.role === 'PC') {
      items.push({
        title: 'Courses',
        icon: BookOpen,
        href: '/courses',
        roles: ['PC', 'TEACHER']
      })
      items.push({
        title: 'Program Outcomes',
        icon: FileText,
        href: '/program-outcomes',
        roles: ['PC']
      })
      items.push({
        title: 'Teachers',
        icon: Users,
        href: '/teachers',
        roles: ['PC', 'DEPARTMENT']
      })
    }

    // Teacher specific items
    if (user?.role === 'TEACHER') {
      items.push({
        title: 'My Courses',
        icon: BookOpen,
        href: '/courses',
        roles: ['PC', 'TEACHER']
      })
    }

    // Reports - available to PC and above
    if (['PC', 'DEPARTMENT', 'UNIVERSITY', 'ADMIN'].includes(user?.role || '')) {
      items.push({
        title: 'Reports',
        icon: BarChart3,
        href: '/reports',
        roles: ['PC', 'DEPARTMENT', 'UNIVERSITY', 'ADMIN']
      })
    }

    return items
  }

  const navItems = getNavItems().filter(item => 
    item.roles.includes(user?.role || '')
  )

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-800">NBA OBE Portal</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className="px-2 pb-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={`
              flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md transition-colors
              hover:bg-gray-100 text-gray-700 hover:text-gray-900
              ${isCollapsed ? 'justify-center' : ''}
            `}>
              <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && item.title}
            </div>
          </Link>
        ))}

        <div className="mt-auto pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-start text-gray-700 hover:text-gray-900 ${isCollapsed ? 'px-3' : 'px-3'}`}
          >
            <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && 'Logout'}
          </Button>
        </div>
      </nav>
    </div>
  )
}