import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

export async function generatePDF(elementId: string, filename = "catalog.pdf"): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) return

  // 로딩 상태 표시
  const loadingElement = document.createElement("div")
  loadingElement.className = "fixed inset-0 bg-ink-black/50 flex items-center justify-center z-50"
  loadingElement.innerHTML = '<div class="bg-rice-paper p-4 rounded-md text-ink-black">PDF 생성 중...</div>'
  document.body.appendChild(loadingElement)

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const imgData = canvas.toDataURL("image/jpeg", 1.0)
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
    })

    const imgWidth = 297 // A4 가로
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight)
    pdf.save(filename)
  } catch (error) {
    
    alert("PDF 생성 중 오류가 발생했습니다.")
  } finally {
    // 로딩 상태 제거
    document.body.removeChild(loadingElement)
  }
}

export async function generateMultiPagePDF(pages: string[], filename = "catalog.pdf"): Promise<void> {
  if (!pages.length) return

  // 로딩 상태 표시
  const loadingElement = document.createElement("div")
  loadingElement.className = "fixed inset-0 bg-ink-black/50 flex items-center justify-center z-50"
  loadingElement.innerHTML = '<div class="bg-rice-paper p-4 rounded-md text-ink-black">PDF 생성 중...</div>'
  document.body.appendChild(loadingElement)

  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
    })

    for (let i = 0; i < pages.length; i++) {
      const pageElement = document.getElementById(pages[i])
      if (!pageElement) continue

      if (i > 0) pdf.addPage()

      const canvas = await html2canvas(pageElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL("image/jpeg", 1.0)
      const imgWidth = 210 // A4 가로
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight)
    }

    pdf.save(filename)
  } catch (error) {
    
    alert("PDF 생성 중 오류가 발생했습니다.")
  } finally {
    // 로딩 상태 제거
    document.body.removeChild(loadingElement)
  }
}
