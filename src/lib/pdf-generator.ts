import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface ReportData {
  title: string
  subtitle?: string
  metadata?: {
    program?: string
    batch?: string
    course?: string
    section?: string
    faculty?: string
    date?: string
  }
  sections: ReportSection[]
}

export interface ReportSection {
  title: string
  content: string | HTMLElement
  type?: 'table' | 'text' | 'chart'
}

export class PDFGenerator {
  static async generatePDF(data: ReportData): Promise<void> {
    try {
      // Create a temporary container for rendering
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '-9999px'
      container.style.width = '210mm' // A4 width
      container.style.backgroundColor = 'white'
      container.style.padding = '20px'
      container.style.fontFamily = 'Arial, sans-serif'
      
      // Build HTML content
      container.innerHTML = this.buildReportHTML(data)
      document.body.appendChild(container)

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      // Add image to PDF
      let position = 0
      while (heightLeft > 0) {
        const pageContent = canvas.toDataURL('image/png', {
          width: canvas.width,
          height: Math.min(canvas.height, (pageHeight * canvas.width) / imgWidth),
          x: 0,
          y: position * ((pageHeight * canvas.width) / imgWidth)
        })

        if (heightLeft > pageHeight) {
          pdf.addImage(pageContent, 'PNG', 0, 0, imgWidth, Math.min(pageHeight, heightLeft))
          heightLeft -= pageHeight
          position++
        } else {
          pdf.addImage(pageContent, 'PNG', 0, 0, imgWidth, heightLeft)
          heightLeft = 0
        }
      }

      // Save the PDF
      const filename = `${data.title.replace(/\\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(filename)

      // Clean up
      document.body.removeChild(container)
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  }

  private static buildReportHTML(data: ReportData): string {
    let html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #dc2626; padding-bottom: 20px;">
          <h1 style="color: #dc2626; margin: 0; font-size: 28px; font-weight: bold;">
            ${data.title}
          </h1>
          ${data.subtitle ? `<h2 style="color: #666; margin: 10px 0; font-size: 18px; font-weight: normal;">${data.subtitle}</h2>` : ''}
        </div>

        <!-- Metadata -->
        ${data.metadata ? `
        <div style="margin-bottom: 20px; font-size: 12px; color: #666;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Program:</td>
              <td style="padding: 5px; border: 1px solid #ddd;">${data.metadata.program || 'N/A'}</td>
              <td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Batch:</td>
              <td style="padding: 5px; border: 1px solid #ddd;">${data.metadata.batch || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Course:</td>
              <td style="padding: 5px; border: 1px solid #ddd;">${data.metadata.course || 'N/A'}</td>
              <td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Section:</td>
              <td style="padding: 5px; border: 1px solid #ddd;">${data.metadata.section || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Faculty:</td>
              <td style="padding: 5px; border: 1px solid #ddd;">${data.metadata.faculty || 'N/A'}</td>
              <td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Date:</td>
              <td style="padding: 5px; border: 1px solid #ddd;">${data.metadata.date || new Date().toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        ` : ''}
    `

    // Add sections
    data.sections.forEach((section, index) => {
      html += `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #1f2937; font-size: 20px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
            ${section.title}
          </h3>
          <div style="font-size: 12px; line-height: 1.4;">
            ${typeof section.content === 'string' ? section.content : ''}
          </div>
        </div>
      `
    })

    html += `
      </div>
      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #666;">
        <p>Generated by NBA OBE Portal on ${new Date().toLocaleString()}</p>
        <p>This is a computer-generated document. No signature required.</p>
      </div>
    `

    return html
  }

  static async generateCourseAttainmentReport(reportData: any): Promise<void> {
    const sections: ReportSection[] = []

    // Overall CO Attainment Section
    if (reportData.coAttainments && reportData.coAttainments.length > 0) {
      let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa; font-weight: bold;">
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">CO Code</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">CO Description</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: center;">Target %</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: center;">Students Meeting Target</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: center;">Attainment %</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: center;">Attainment Level</th>
            </tr>
          </thead>
          <tbody>
      `

      reportData.coAttainments.forEach((co: any) => {
        const levelColor = co.attainmentLevel === 3 ? '#dc2626' : 
                           co.attainmentLevel === 2 ? '#f97316' : 
                           co.attainmentLevel === 1 ? '#fbbf24' : '#6b7280'

        tableHTML += `
          <tr>
            <td style="border: 1px solid #dee2e6; padding: 8px; font-weight: bold;">${co.code}</td>
            <td style="border: 1px solid #dee2e6; padding: 8px;">${co.description}</td>
            <td style="border: 1px solid #dee2e6; padding: 8px; text-align: center;">${co.target}%</td>
            <td style="border: 1px solid #dee2e6; padding: 8px; text-align: center;">${co.studentsMeetingTarget}</td>
            <td style="border: 1px solid #dee2e6; padding: 8px; text-align: center; font-weight: bold;">${co.percentageMeetingTarget.toFixed(1)}%</td>
            <td style="border: 1px solid #dee2e6; padding: 8px; text-align: center; background-color: ${levelColor}; color: white; font-weight: bold;">Level ${co.attainmentLevel}</td>
          </tr>
        `
      })

      tableHTML += `
          </tbody>
        </table>
      `

      sections.push({
        title: 'Overall CO Attainment Summary',
        content: tableHTML,
        type: 'table'
      })
    }

    // Student-wise Breakdown Section
    if (reportData.studentBreakdown && reportData.studentBreakdown.length > 0) {
      let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
          <thead>
            <tr style="background-color: #f8f9fa; font-weight: bold;">
              <th style="border: 1px solid #dee2e6; padding: 6px; text-align: left;">Register No</th>
              <th style="border: 1px solid #dee2e6; padding: 6px; text-align: left;">Student Name</th>
      `

      // Add CO columns
      if (reportData.studentBreakdown && reportData.studentBreakdown.length > 0) {
        Object.keys(reportData.studentBreakdown[0]).forEach(key => {
          if (key.startsWith('CO')) {
            tableHTML += `<th style="border: 1px solid #dee2e6; padding: 6px; text-align: center;">${key}</th>`
          }
        })
      }

      tableHTML += `
            </tr>
          </thead>
          <tbody>
      `

      reportData.studentBreakdown.forEach((student: any) => {
        tableHTML += `<tr><td style="border: 1px solid #dee2e6; padding: 6px; font-weight: bold;">${student.registerNo}</td><td style="border: 1px solid #dee2e6; padding: 6px;">${student.name}</td>`

        Object.keys(student).forEach(key => {
          if (key.startsWith('CO')) {
            const value = student[key]
            const bgColor = value >= (reportData.course?.target || 60) ? '#d4edda' : '#f8d7da'
            tableHTML += `<td style="border: 1px solid #dee2e6; padding: 6px; text-align: center; background-color: ${bgColor};">${value.toFixed(1)}%</td>`
          }
        })

        tableHTML += `</tr>`
      })

      tableHTML += `
          </tbody>
        </table>
      `

      sections.push({
        title: 'Student-wise CO Attainment Breakdown',
        content: tableHTML,
        type: 'table'
      })
    }

    const reportData_formatted: ReportData = {
      title: 'Course Attainment Report',
      subtitle: reportData.course?.name || 'Course Report',
      metadata: {
        program: reportData.course?.program?.name,
        batch: reportData.course?.batch?.name,
        course: reportData.course?.name + ' (' + reportData.course?.code + ')',
        section: reportData.sectionId === 'overall' ? 'Overall Course' : reportData.sectionName,
        faculty: reportData.facultyName,
        date: new Date().toLocaleDateString()
      },
      sections
    }

    await this.generatePDF(reportData_formatted)
  }

  static async generatePOAttainmentReport(reportData: any): Promise<void> {
    const sections: ReportSection[] = []

    if (reportData.poAttainments && reportData.poAttainments.length > 0) {
      let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa; font-weight: bold;">
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">PO Code</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">PO Description</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: center;">Direct Attainment</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: center;">Indirect Attainment</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: center;">Overall Attainment</th>
            </tr>
          </thead>
          <tbody>
      `

      reportData.poAttainments.forEach((po: any) => {
        tableHTML += `
          <tr>
            <td style="border: 1px solid #dee2e6; padding: 8px; font-weight: bold;">${po.code}</td>
            <td style="border: 1px solid #dee2e6; padding: 8px;">${po.description}</td>
            <td style="border: 1px solid #dee2e6; padding: 8px; text-align: center;">${po.directAttainment.toFixed(2)}</td>
            <td style="border: 1px solid #dee2e6; padding: 8px; text-align: center;">${po.indirectAttainment || 3.0}</td>
            <td style="border: 1px solid #dee2e6; padding: 8px; text-align: center; font-weight: bold;">${po.overallAttainment.toFixed(2)}</td>
          </tr>
        `
      })

      tableHTML += `
          </tbody>
        </table>
      `

      sections.push({
        title: 'Program Outcome (PO) Attainment Summary',
        content: tableHTML,
        type: 'table'
      })
    }

    const reportData_formatted: ReportData = {
      title: 'Program Outcome Attainment Report',
      subtitle: reportData.program?.name || 'Program Report',
      metadata: {
        program: reportData.program?.name,
        batch: reportData.batch?.name,
        date: new Date().toLocaleDateString()
      },
      sections
    }

    await this.generatePDF(reportData_formatted)
  }
}