'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User, Building, Calendar, Grid3X3, BookOpen } from 'lucide-react'

export function Header() {
  const { user } = useAuth()

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'UNIVERSITY': return 'bg-purple-100 text-purple-800'
      case 'DEPARTMENT': return 'bg-blue-100 text-blue-800'
      case 'PC': return 'bg-green-100 text-green-800'
      case 'TEACHER': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator'
      case 'UNIVERSITY': return 'University'
      case 'DEPARTMENT': return 'Department Head'
      case 'PC': return 'Program Co-ordinator'
      case 'TEACHER': return 'Teacher'
      default: return role
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Program and Batch Context - will be dynamic */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {user?.college?.name || 'Engineering College'}
              </span>
            </div>
            
            {['PC', 'TEACHER'].includes(user?.role || '') && (
              <>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <Select defaultValue="be-ece">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="be-ece">BE ECE</SelectItem>
                      <SelectItem value="be-cse">BE CSE</SelectItem>
                      <SelectItem value="be-mech">BE MECH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <Select defaultValue="2025-2029">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-2029">2025-2029</SelectItem>
                      <SelectItem value="2024-2028">2024-2028</SelectItem>
                      <SelectItem value="2023-2027">2023-2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <Badge className={getRoleColor(user?.role || '')}>
                {getRoleLabel(user?.role || '')}
              </Badge>
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>

          {/* Program Selection Button - for PC and Teacher */}
          {['PC', 'TEACHER'].includes(user?.role || '') && (
            <Button variant="outline" size="sm">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Program Selection
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}