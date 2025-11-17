import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    // Get first program and batch for template
    const program = await db.program.findFirst()
    const batch = await db.batch.findFirst({
      where: {
        programId: program?.id
      }
    })

    if (!program || !batch) {
      return NextResponse.json(
        { message: 'No program or batch found' },
        { status: 404 }
      )
    }

    // Get all sections for the program/batch
    const sections = await db.section.findMany({
      where: {
        batchId: batch.id
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Create workbook
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Register No', 'Name', 'Email', 'Status', 'Section', 'Batch']
    ])

    // Add header row
    XLSX.utils.sheet_add_aoa(worksheet, ['Register No', 'Name', 'Email', 'Status', 'Section', 'Batch'])

    // Add sample data row
    XLSX.utils.sheet_add_aoa(worksheet, ['2025ST001', 'John Doe', 'john.doe@email.com', 'ACTIVE', 'A', '2025-2029'])

    // Create the Excel buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="student-template.xlsx"`
      },
    })
  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { message: 'Failed to generate template' },
      { status: 500 }
    )
  }
}