'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Settings, 
  Save,
  Loader2,
  Database,
  Shield,
  Bell,
  Palette,
  Globe,
  Target
} from 'lucide-react'

interface SystemSettings {
  // General Settings
  institutionName: string
  institutionLogo: string
  academicYear: string
  semester: string
  
  // Attainment Settings
  defaultTargetPercentage: number
  defaultAttainmentLevel1: number
  defaultAttainmentLevel2: number
  defaultAttainmentLevel3: number
  
  // Report Settings
  directWeightPercentage: number
  indirectWeightPercentage: number
  
  // Notification Settings
  emailNotifications: boolean
  assessmentReminders: boolean
  deadlineReminders: boolean
  
  // System Settings
  maintenanceMode: boolean
  allowUserRegistration: boolean
  sessionTimeout: number
}

export default function AdminSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [settings, setSettings] = useState<SystemSettings>({
    // General Settings
    institutionName: 'NBA OBE Portal',
    institutionLogo: '',
    academicYear: '2025-2026',
    semester: 'Odd',
    
    // Attainment Settings
    defaultTargetPercentage: 60,
    defaultAttainmentLevel1: 40,
    defaultAttainmentLevel2: 60,
    defaultAttainmentLevel3: 80,
    
    // Report Settings
    directWeightPercentage: 70,
    indirectWeightPercentage: 30,
    
    // Notification Settings
    emailNotifications: true,
    assessmentReminders: true,
    deadlineReminders: true,
    
    // System Settings
    maintenanceMode: false,
    allowUserRegistration: false,
    sessionTimeout: 30
  })

  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchSettings()
    }
  }, [session])

  const fetchSettings = async () => {
    try {
      // In a real implementation, this would fetch from API
      // For now, we'll use default values
      console.log('Settings loaded')
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would save to API
      console.log('Saving settings:', settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure system-wide settings and preferences
          </p>
        </div>

        {/* Save Bar */}
        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-yellow-50 border-t border-yellow-200 p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <p className="text-yellow-800">You have unsaved changes</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  fetchSettings()
                  setHasChanges(false)
                }}>
                  Discard
                </Button>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic institution information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="institution-name">Institution Name</Label>
                <Input
                  id="institution-name"
                  value={settings.institutionName}
                  onChange={(e) => updateSetting('institutionName', e.target.value)}
                  placeholder="Enter institution name"
                />
              </div>
              
              <div>
                <Label htmlFor="academic-year">Academic Year</Label>
                <Input
                  id="academic-year"
                  value={settings.academicYear}
                  onChange={(e) => updateSetting('academicYear', e.target.value)}
                  placeholder="e.g., 2025-2026"
                />
              </div>
              
              <div>
                <Label htmlFor="semester">Current Semester</Label>
                <Select value={settings.semester} onValueChange={(value: 'Odd' | 'Even') => updateSetting('semester', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Odd">Odd Semester</SelectItem>
                    <SelectItem value="Even">Even Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Attainment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Attainment Settings
              </CardTitle>
              <CardDescription>
                Default values for CO/PO attainment calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="default-target">Default Target Percentage (%)</Label>
                <Input
                  id="default-target"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.defaultTargetPercentage}
                  onChange={(e) => updateSetting('defaultTargetPercentage', Number(e.target.value))}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="level1">Level 1 (%)</Label>
                  <Input
                    id="level1"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.defaultAttainmentLevel1}
                    onChange={(e) => updateSetting('defaultAttainmentLevel1', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="level2">Level 2 (%)</Label>
                  <Input
                    id="level2"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.defaultAttainmentLevel2}
                    onChange={(e) => updateSetting('defaultAttainmentLevel2', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="level3">Level 3 (%)</Label>
                  <Input
                    id="level3"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.defaultAttainmentLevel3}
                    onChange={(e) => updateSetting('defaultAttainmentLevel3', Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>• Level 1: Minimum percentage of students meeting target to achieve Level 1</p>
                <p>• Level 2: Minimum percentage for Level 2</p>
                <p>• Level 3: Minimum percentage for Level 3 (Excellent)</p>
              </div>
            </CardContent>
          </Card>

          {/* Report Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Report Settings
              </CardTitle>
              <CardDescription>
                Configure report generation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="direct-weight">Direct Attainment Weight (%)</Label>
                  <Input
                    id="direct-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.directWeightPercentage}
                    onChange={(e) => updateSetting('directWeightPercentage', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="indirect-weight">Indirect Attainment Weight (%)</Label>
                  <Input
                    id="indirect-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.indirectWeightPercentage}
                    onChange={(e) => updateSetting('indirectWeightPercentage', Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>These weights determine how direct and indirect attainment contribute to overall PO attainment.</p>
                <p>Total should equal 100%.</p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure system notifications and reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send email alerts for important events</p>
                  </div>
                  <input
                    id="email-notifications"
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="assessment-reminders">Assessment Reminders</Label>
                    <p className="text-sm text-gray-500">Remind teachers about upcoming assessments</p>
                  </div>
                  <input
                    id="assessment-reminders"
                    type="checkbox"
                    checked={settings.assessmentReminders}
                    onChange={(e) => updateSetting('assessmentReminders', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deadline-reminders">Deadline Reminders</Label>
                    <p className="text-sm text-gray-500">Notify about approaching deadlines</p>
                  </div>
                  <input
                    id="deadline-reminders"
                    type="checkbox"
                    checked={settings.deadlineReminders}
                    onChange={(e) => updateSetting('deadlineReminders', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                System Settings
              </CardTitle>
              <CardDescription>
                Security and system configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Temporarily disable user access</p>
                  </div>
                  <input
                    id="maintenance-mode"
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="user-registration">Allow User Registration</Label>
                    <p className="text-sm text-gray-500">Enable self-service user registration</p>
                  </div>
                  <input
                    id="user-registration"
                    type="checkbox"
                    checked={settings.allowUserRegistration}
                    onChange={(e) => updateSetting('allowUserRegistration', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    min="5"
                    max="480"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', Number(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">Automatically log out users after period of inactivity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}