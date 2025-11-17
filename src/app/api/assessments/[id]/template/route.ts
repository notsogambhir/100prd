import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id

    // Get assessment with questions and students
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        section: {
          include: {
            students: {
              where: {
                status: 'ACTIVE'
              },
              orderBy: {
                registerNo: 'asc'
              }
            }
          }
        },
        questions: {
          orderBy: {
            questionName: 'asc'
          }
        }
      }
    })

    if (!assessment) {
      return NextResponse.json(
        { message: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Create worksheet data
    const worksheetData: any[] = []

    // Header row
    const headerRow: any = {
      'Register No': '',
      'Student Name': '',
    }

    // Add question columns
    assessment.questions.forEach((question) => {
      headerRow[question.questionName] = ''
    })

    worksheetData.push(headerRow)

    // Student rows
    assessment.section.students.forEach((student) => {
      const studentRow: any = {
        'Register No': student.registerNo,
        'Student Name': student.name,
      }

      // Add empty columns for each question
      assessment.questions.forEach((question) => {
        studentRow[question.questionName] = ''
      })

      worksheetData.push(studentRow)
    })

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Marks Template')

    // Convert to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${assessment.name.replace(/[^a-zA-Z0-9]/g, '_')}_template.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}