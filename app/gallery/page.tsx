'use client'

import Image from 'next/image'
import images from '../../gallery-images.json'

export default function GalleryPage() {
  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">갤러리</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {images.map((img: any) => (
          <div key={img.id} className="flex flex-col items-center">
            <Image
              src={img.src}
              alt={img.title}
              width={200}
              height={150}
              className="rounded shadow mb-2"
            />
            <a
              href={img.src}
              download
              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              aria-label={`${img.title} 다운로드`}
            >
              다운로드
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </main>
  )
}