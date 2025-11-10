import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'courses' or 'outcomes'
    
    if (!file || !type) {
      return NextResponse.json(
        { error: 'File and type are required' },
        { status: 400 }
      )
    }

    // Read Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    if (type === 'courses') {
      return await handleCoursesUpload(data)
    } else if (type === 'outcomes') {
      return await handleOutcomesUpload(data)
    } else {
      return NextResponse.json(
        { error: 'Invalid upload type' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Failed to process bulk upload:', error)
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    )
  }
}

async function handleCoursesUpload(data: any[]) {
  const results = []
  const errors = []

  for (const [index, row] of data.entries()) {
    try {
      // Validate required fields
      if (!row['Course Code'] || !row['Course Name'] || !row['Program ID']) {
        errors.push({ row: index + 1, error: 'Missing required fields: Course Code, Course Name, or Program ID' })
        continue
      }

      // Check if program exists
      const program = await db.program.findUnique({
        where: { id: row['Program ID'] }
      })

      if (!program) {
        errors.push({ row: index + 1, error: `Program with ID ${row['Program ID']} not found` })
        continue
      }

      // Get or create batch
      let batch = await db.batch.findFirst({
        where: { 
          programId: row['Program ID'],
          startYear: parseInt(row['Start Year']) || new Date().getFullYear()
        }
      })

      if (!batch) {
        const endYear = (parseInt(row['Start Year']) || new Date().getFullYear()) + program.duration
        batch = await db.batch.create({
          data: {
            name: `${row['Start Year'] || new Date().getFullYear()}-${endYear}`,
            startYear: parseInt(row['Start Year']) || new Date().getFullYear(),
            endYear,
            programId: row['Program ID'],
            createdBy: 'system' // This should come from session
          }
        })
      }

      // Create course
      const course = await db.course.create({
        data: {
          code: row['Course Code'],
          name: row['Course Name'],
          description: row['Description'] || '',
          credits: parseInt(row['Credits']) || 3,
          status: row['Status'] || 'Future',
          target: parseFloat(row['Target %']) || 60.0,
          attainmentLevel1: parseFloat(row['Level 1 %']) || 40.0,
          attainmentLevel2: parseFloat(row['Level 2 %']) || 60.0,
          attainmentLevel3: parseFloat(row['Level 3 %']) || 80.0,
          programId: row['Program ID'],
          batchId: batch.id,
          sectionId: row['Section ID'] || null,
          teacherId: row['Teacher ID'] || null,
          createdBy: 'system' // This should come from session
        }
      })

      results.push({
        row: index + 1,
        courseCode: row['Course Code'],
        status: 'success',
        courseId: course.id
      })

    } catch (error) {
      errors.push({ row: index + 1, error: `Processing error: ${error}` })
    }
  }

  return NextResponse.json({
    message: 'Courses upload completed',
    totalProcessed: data.length,
    successful: results.length,
    errors: errors.length,
    errorDetails: errors,
    results
  })
}

async function handleOutcomesUpload(data: any[]) {
  const results = []
  const errors = []

  for (const [index, row] of data.entries()) {
    try {
      const outcomeType = row['Type'] // 'CO' or 'PO'
      
      if (!outcomeType || !row['Code'] || !row['Description']) {
        errors.push({ row: index + 1, error: 'Missing required fields: Type, Code, or Description' })
        continue
      }

      if (outcomeType === 'CO') {
        if (!row['Course ID']) {
          errors.push({ row: index + 1, error: 'Course ID is required for CO' })
          continue
        }

        const co = await db.courseOutcome.create({
          data: {
            code: row['Code'],
            description: row['Description'],
            courseId: row['Course ID']
          }
        })

        results.push({
          row: index + 1,
          type: 'CO',
          code: row['Code'],
          status: 'success',
          id: co.id
        })

      } else if (outcomeType === 'PO') {
        if (!row['Program ID']) {
          errors.push({ row: index + 1, error: 'Program ID is required for PO' })
          continue
        }

        const po = await db.programOutcome.create({
          data: {
            code: row['Code'],
            description: row['Description'],
            programId: row['Program ID'],
            indirectAttainment: parseFloat(row['Indirect Attainment']) || 3.0
          }
        })

        results.push({
          row: index + 1,
          type: 'PO',
          code: row['Code'],
          status: 'success',
          id: po.id
        })

      } else {
        errors.push({ row: index + 1, error: 'Invalid outcome type. Must be CO or PO' })
      }

    } catch (error) {
      errors.push({ row: index + 1, error: `Processing error: ${error}` })
    }
  }

  return NextResponse.json({
    message: 'Outcomes upload completed',
    totalProcessed: data.length,
    successful: results.length,
    errors: errors.length,
    errorDetails: errors,
    results
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'courses' or 'outcomes'

    if (type === 'courses') {
      // Generate courses template
      const courses = await db.course.findMany({
        take: 5,
        select: {
          code: true,
          name: true,
          description: true,
          credits: true,
          status: true,
          target: true,
          attainmentLevel1: true,
          attainmentLevel2: true,
          attainmentLevel3: true,
          programId: true,
          batchId: true
        }
      })

      const templateData = courses.map(course => ({
        'Course Code': course.code,
        'Course Name': course.name,
        'Description': course.description || '',
        'Credits': course.credits,
        'Status': course.status,
        'Target %': course.target,
        'Level 1 %': course.attainmentLevel1,
        'Level 2 %': course.attainmentLevel2,
        'Level 3 %': course.attainmentLevel3,
        'Program ID': course.programId,
        'Batch ID': course.batchId,
        'Section ID': '',
        'Teacher ID': ''
      }))

      const worksheet = XLSX.utils.json_to_sheet(templateData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Courses Template')
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(excelBuffer as Buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="courses-template.xlsx"'
        }
      })

    } else if (type === 'outcomes') {
      // Generate outcomes template
      const templateData = [
        {
          'Type': 'CO',
          'Code': 'CO1',
          'Description': 'Example Course Outcome 1',
          'Course ID': 'your-course-id-here'
        },
        {
          'Type': 'PO',
          'Code': 'PO1',
          'Description': 'Example Program Outcome 1',
          'Program ID': 'your-program-id-here',
          'Indirect Attainment': 3.0
        }
      ]

      const worksheet = XLSX.utils.json_to_sheet(templateData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Outcomes Template')
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(excelBuffer as Buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="outcomes-template.xlsx"'
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid template type' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Failed to generate template:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}