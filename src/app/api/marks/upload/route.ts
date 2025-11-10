import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const assessmentId = formData.get('assessmentId') as string
    
    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      )
    }

    // Read the Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    // Verify assessment exists
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          include: {
            co: {
              select: {
                id: true,
                code: true
              }
            }
          }
        }
      }
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Process marks data
    const marksToSave: any[] = []
    const errors: any[] = []

    for (const row of data as any[]) {
      try {
        const rollNumber = row['Roll Number'] || row['rollNumber']
        
        if (!rollNumber) {
          errors.push({ row, error: 'Missing Roll Number' })
          continue
        }

        // Find student by roll number
        const student = await db.student.findFirst({
          where: { 
            rollNumber: rollNumber.toString()
          }
        })

        if (!student) {
          errors.push({ row, error: `Student with roll number ${rollNumber} not found` })
          continue
        }

        // Process each question column
        for (const question of assessment.questions) {
          const questionName = question.name
          const marks = row[questionName]

          if (marks !== undefined && marks !== null && marks !== '') {
            const marksValue = parseFloat(marks.toString())
            
            if (isNaN(marksValue)) {
              errors.push({ 
                row, 
                error: `Invalid marks value for ${questionName}: ${marks}` 
              })
              continue
            }

            if (marksValue > question.maxMarks) {
              errors.push({ 
                row, 
                error: `Marks ${marksValue} exceed maximum marks (${question.maxMarks}) for ${questionName}` 
              })
              continue
            }

            marksToSave.push({
              studentId: student.id,
              assessmentId,
              questionId: question.id,
              marks: marksValue
            })
          }
        }
      } catch (error) {
        errors.push({ row, error: `Processing error: ${error}` })
      }
    }

    // Save marks
    const results = []
    for (const markData of marksToSave) {
      const mark = await db.mark.upsert({
        where: {
          studentId_assessmentId_questionId: {
            studentId: markData.studentId,
            assessmentId: markData.assessmentId,
            questionId: markData.questionId
          }
        },
        update: {
          marks: markData.marks
        },
        create: {
          studentId: markData.studentId,
          assessmentId: markData.assessmentId,
          questionId: markData.questionId,
          marks: markData.marks
        }
      })
      results.push(mark)
    }

    return NextResponse.json({
      message: 'Marks uploaded successfully',
      totalProcessed: data.length,
      successfulUploads: results.length,
      errors: errors.length,
      errorDetails: errors,
      savedMarks: results.length
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to process Excel upload:', error)
    return NextResponse.json(
      { error: 'Failed to process Excel file' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('assessmentId')

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      )
    }

    // Get assessment details for template
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          include: {
            co: {
              select: {
                code: true,
                description: true
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        },
        course: {
          select: {
            code: true,
            name: true
          }
        },
        section: {
          select: {
            name: true
          }
        }
      }
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Get students for this assessment's section
    const students = await db.student.findMany({
      where: {
        sectionId: assessment.sectionId,
        status: 'Active'
      },
      orderBy: {
        rollNumber: 'asc'
      },
      select: {
        id: true,
        name: true,
        rollNumber: true
      }
    })

    // Create template data
    const templateData: any[] = []
    
    // Header row
    const headerRow: any = {
      'Roll Number': 'Roll Number'
    }
    
    // Add question columns
    assessment.questions.forEach((question) => {
      headerRow[question.name] = `${question.name} (Max: ${question.maxMarks})`
      if (question.co) {
        headerRow[question.name] += ` [${question.co.code}]`
      }
    })
    templateData.push(headerRow)

    // Add student rows
    students.forEach((student) => {
      const studentRow: any = {
        'Roll Number': student.rollNumber
      }
      
      assessment.questions.forEach((question) => {
        studentRow[question.name] = ''
      })
      
      templateData.push(studentRow)
    })

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Marks Template')

    // Convert to buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return as downloadable file
    return new NextResponse(excelBuffer as Buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${assessment.course.code}-${assessment.name}-template.xlsx"`
      }
    })

  } catch (error) {
    console.error('Failed to generate template:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}