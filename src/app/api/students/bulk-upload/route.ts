import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Read the Excel file
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'binary' })

    // Parse the data
    const worksheet = workbook.Sheets[0]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    if (!jsonData || !Array.isArray(jsonData)) {
      return NextResponse.json(
        { message: 'Invalid file format' },
        { status: 400 }
      )
    }

    const students = jsonData.slice(1) // Skip header row
    const studentData = students.map((row: any, index: number) => {
      const [registerNo, name, email, status, sectionName] = row
      const sectionId = sectionName ? await getSectionIdByName(row[3], row[4]) : null

      return {
        registerNo: String(registerNo),
        name: String(name),
        email: String(email),
        status: row[5] || 'ACTIVE',
        sectionId
      }
    })

    // Insert students into database
    for (const studentData of studentData) {
      await db.student.create({
        data: studentData
      })
    }

    return NextResponse.json(
      { 
        message: `Successfully uploaded ${studentData.length} students`,
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error uploading students:', error)
    return NextResponse.json(
      { message: 'Upload failed. Please check the file format.' },
      { status: 500 }
    )
  }
}

async function getSectionIdByName(programName: string, batchName: string): Promise<string | null> {
  try {
    const batch = await db.batch.findFirst({
      where: {
        name: batchName,
        program: {
          name: programName
        }
      }
    })

    if (batch) {
      const section = await db.section.findFirst({
        where: {
          name: 'A' // Default section
        }
      })

      return section?.id || null
    }

    return null
  } catch (error) {
    console.error('Error finding section:', error)
    return null
  }
}