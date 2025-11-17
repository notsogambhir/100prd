'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckSquare, Square, Save } from 'lucide-react'

interface COPOMappingMatrixProps {
  courseId: string
}

interface CourseOutcome {
  id: string
  code: string
  description: string
}

interface ProgramOutcome {
  id: string
  code: string
  description: string
}

interface Mapping {
  coId: string
  poId: string
  level: number
}

export function COPOMappingMatrix({ courseId }: COPOMappingMatrixProps) {
  const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcome[]>([])
  const [programOutcomes, setProgramOutcomes] = useState<ProgramOutcome[]>([])
  const [mappings, setMappings] = useState<Mapping[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [courseId])

  const fetchData = async () => {
    try {
      const [cosRes, posRes, mappingsRes] = await Promise.all([
        fetch(`/api/course-outcomes?courseId=${courseId}`),
        fetch('/api/program-outcomes'),
        fetch(`/api/co-po-mappings?courseId=${courseId}`)
      ])

      if (cosRes.ok) setCourseOutcomes(await cosRes.json())
      if (posRes.ok) setProgramOutcomes(await posRes.json())
      if (mappingsRes.ok) {
        const mappingsData = await mappingsRes.json()
        setMappings(mappingsData.map((m: any) => ({
          coId: m.coId,
          poId: m.poId,
          level: m.level
        })))
      }
    } catch (error) {
      console.error('Error fetching CO-PO mapping data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMappingChange = (coId: string, poId: string, level: number) => {
    const newMappings = [...mappings]
    const existingIndex = newMappings.findIndex(
      m => m.coId === coId && m.poId === poId
    )

    if (existingIndex >= 0) {
      if (level === 0) {
        // Remove mapping if level is 0
        newMappings.splice(existingIndex, 1)
      } else {
        // Update existing mapping
        newMappings[existingIndex].level = level
      }
    } else if (level > 0) {
      // Add new mapping
      newMappings.push({ coId, poId, level })
    }

    setMappings(newMappings)
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      // Save all mappings
      for (const mapping of mappings) {
        await fetch('/api/co-po-mappings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            coId: mapping.coId,
            poId: mapping.poId,
            level: mapping.level
          })
        })
      }

      setHasChanges(false)
    } catch (error) {
      console.error('Error saving mappings:', error)
    }
  }

  const getMappingLevel = (coId: string, poId: string): number => {
    const mapping = mappings.find(m => m.coId === coId && m.poId === poId)
    return mapping?.level || 0
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-yellow-100 text-yellow-800'
      case 2: return 'bg-orange-100 text-orange-800'
      case 3: return 'bg-red-100 text-red-800'
      default: return ''
    }
  }

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Low'
      case 2: return 'Medium'
      case 3: return 'High'
      default: return 'None'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CO-PO Mapping Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Select the correlation level between each Course Outcome (CO) and Program Outcome (PO)</p>
            <p>• <strong>Level 1:</strong> Low correlation</p>
            <p>• <strong>Level 2:</strong> Medium correlation</p>
            <p>• <strong>Level 3:</strong> High correlation</p>
            <p>• <strong>Level 0:</strong> No correlation (will remove mapping)</p>
          </div>
        </CardContent>
      </Card>

      {/* Mapping Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-50 p-2 text-left font-medium">
                CO \ PO
              </th>
              {programOutcomes.map((po) => (
                <th key={po.id} className="border border-gray-300 bg-gray-50 p-2 text-left">
                  <div className="text-xs font-medium">
                    <div>{po.code}</div>
                    <div className="text-gray-500 max-w-20 truncate">
                      {po.description.substring(0, 30)}...
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courseOutcomes.map((co) => (
              <tr key={co.id}>
                <td className="border border-gray-300 bg-gray-50 p-2 font-medium">
                  <div className="text-xs">
                    <div>{co.code}</div>
                    <div className="text-gray-500 max-w-20 truncate">
                      {co.description.substring(0, 30)}...
                    </div>
                  </div>
                </td>
                {programOutcomes.map((po) => {
                  const level = getMappingLevel(co.id, po.id)
                  return (
                    <td key={po.id} className="border border-gray-300 p-1">
                      <Select
                        value={level.toString()}
                        onValueChange={(value) => 
                          handleMappingChange(co.id, po.id, parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue>
                            <div className="flex items-center gap-1">
                              {level > 0 ? (
                                <CheckSquare className="h-3 w-3" />
                              ) : (
                                <Square className="h-3 w-3" />
                              )}
                              <span className="text-xs">{level}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">
                            <div className="flex items-center gap-2">
                              <Square className="h-3 w-3" />
                              <span>0 - None</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="1">
                            <div className="flex items-center gap-2">
                              <CheckSquare className="h-3 w-3" />
                              <span>1 - Low</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="2">
                            <div className="flex items-center gap-2">
                              <CheckSquare className="h-3 w-3" />
                              <span>2 - Medium</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="3">
                            <div className="flex items-center gap-2">
                              <CheckSquare className="h-3 w-3" />
                              <span>3 - High</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-center">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              <span className="text-sm">No Mapping</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="text-sm">Mapped</span>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800">
              Level 1 (Low)
            </Badge>
            <Badge className="bg-orange-100 text-orange-800">
              Level 2 (Medium)
            </Badge>
            <Badge className="bg-red-100 text-red-800">
              Level 3 (High)
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}