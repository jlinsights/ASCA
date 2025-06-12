"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import HTMLFlipBook from "react-pageflip"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateMultiPagePDF } from "@/lib/pdf-utils"
import { useLanguage } from "@/contexts/language-context"

// Add proper type for the book ref
interface PageFlipRef {
  pageFlip: () => {
    flipNext: () => void
    flipPrev: () => void
    getCurrentPageIndex: () => number
  }
}

interface PageProps {
  children: React.ReactNode
  pageNumber: number
}

const Page: React.FC<PageProps> = ({ children, pageNumber }) => {
  return (
    <div
      className="page bg-rice-paper dark:bg-ink-black border border-gray-200 dark:border-gray-800 shadow-md overflow-hidden"
      id={`page-${pageNumber}`}
    >
      <div className="page-content p-4 h-full">
        {children}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">{pageNumber}</div>
      </div>
    </div>
  )
}

interface PageFlipProps {
  pages: React.ReactNode[]
  width?: number
  height?: number
  title?: string
}

export const PageFlip: React.FC<PageFlipProps> = ({ pages, width = 500, height = 700, title = "갤러리아 도록" }) => {
  // Update the ref definition with the proper type
  const book = useRef<any>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    if (pages) {
      setTotalPages(pages.length)
    }
  }, [pages])

  // Remove the problematic useEffect that was trying to access getCurrentPageIndex

  // Update the nextPage and prevPage functions with proper null checks
  const nextPage = () => {
    try {
      if (book.current && book.current.pageFlip) {
        book.current.pageFlip().flipNext()
      }
    } catch (error) {
      
    }
  }

  const prevPage = () => {
    try {
      if (book.current && book.current.pageFlip) {
        book.current.pageFlip().flipPrev()
      }
    } catch (error) {
      
    }
  }

  const handleDownloadPDF = async () => {
    const pageIds = Array.from({ length: pages.length }, (_, i) => `page-${i + 1}`)
    await generateMultiPagePDF(pageIds, `${title}.pdf`)
  }

  // Update the onPageChange function to handle the event properly
  const onPageChange = (e: any) => {
    if (e && typeof e.data === "number") {
      setCurrentPage(e.data)
      setIsInitialized(true)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4 w-full">
        <HTMLFlipBook
          width={width}
          height={height}
          size="stretch"
          minWidth={300}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1200}
          showCover={true}
          flippingTime={1000}
          className="mx-auto"
          ref={book}
          onFlip={onPageChange}
          startPage={0}
          style={{}}
          drawShadow={true}
          usePortrait={false}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={1}
          showPageCorners={true}
          disableFlipByClick={false}
          mobileScrollSupport={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
        >
          {pages.map((pageContent, index) => (
            <Page key={index} pageNumber={index + 1}>
              {pageContent}
            </Page>
          ))}
        </HTMLFlipBook>
      </div>

      <div className="flex items-center justify-between w-full max-w-md mt-4">
        <Button
          variant="outline"
          size="icon"
          onClick={prevPage}
          disabled={currentPage === 0}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-sm">
          {currentPage + 1} / {totalPages}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          onClick={handleDownloadPDF}
          className="ml-4 bg-scholar-red hover:bg-scholar-red/90 text-rice-paper"
        >
          <Download className="h-4 w-4 mr-2" />
          PDF 다운로드
        </Button>
      </div>
    </div>
  )
}
