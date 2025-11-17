import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Read the Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    // Get assessment details to map questions
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          include: {
            co: true
          }
        },
        section: {
          include: {
            students: true
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

    // Process each row of the Excel file
    for (const row of data as any[]) {
      const studentRegisterNo = row['Register No'] || row['RegisterNo'] || row['registerNo']
      const studentName = row['Student Name'] || row['StudentName'] || row['name']
      
      // Find student by register number
      const student = assessment.section.students.find(s => s.registerNo === studentRegisterNo)
      
      if (!student) {
        console.warn(`Student not found: ${studentRegisterNo}`)
        continue
      }

      // Process each question column
      for (const question of assessment.questions) {
        const marks = row[question.questionName] || row[question.questionName.replace(/\s+/g, '')]
        
        if (marks !== undefined && marks !== null && marks !== '') {
          const numericMarks = parseFloat(marks)
          
          if (!isNaN(numericMarks)) {
            // Upsert mark (create or update)
            await db.mark.upsert({
              where: {
                studentId_assessmentQuestionId: {
                  studentId: student.id,
                  assessmentQuestionId: question.id
                }
              },
              update: {
                marks: numericMarks
              },
              create: {
                studentId: student.id,
                assessmentQuestionId: question.id,
                marks: numericMarks
              }
            })
          }
        }
      }
    }

    return NextResponse.json(
      { 
        message: 'Marks uploaded successfully',
        processed: data.length 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error uploading marks:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}