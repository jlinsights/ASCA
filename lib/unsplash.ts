import { createApi } from 'unsplash-js'

// Unsplash API 클라이언트 생성
export const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || 'demo-key',
})

// Unsplash 이미지 타입 정의
export interface UnsplashImage {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  links?: {
    download_location: string
  }
  alt_description: string | null
  description: string | null
  user: {
    name: string
    username: string
  }
  width: number
  height: number
  likes: number
  downloads?: number
}

// 이미지 검색 함수
export async function searchUnsplashImages(
  query: string, 
  page: number = 1, 
  perPage: number = 20
) {
  try {
    const result = await unsplash.search.getPhotos({
      query,
      page,
      perPage,
      orientation: 'landscape'
    })
    
    if (result.errors) {
      console.error('Unsplash API errors:', result.errors)
      return { images: [], total: 0, totalPages: 0 }
    }
    
    return {
      images: result.response?.results || [],
      total: result.response?.total || 0,
      totalPages: result.response?.total_pages || 0
    }
  } catch (error) {
    console.error('Error searching Unsplash images:', error)
    return { images: [], total: 0, totalPages: 0 }
  }
}

// 이미지 다운로드 트리거 (Unsplash API 요구사항)
export async function triggerUnsplashDownload(downloadUrl: string) {
  try {
    await fetch(downloadUrl)
  } catch (error) {
    console.error('Error triggering Unsplash download:', error)
  }
}

// 이미지 URL을 Blob으로 변환
export async function downloadImageAsBlob(imageUrl: string): Promise<Blob | null> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.blob()
  } catch (error) {
    console.error('Error downloading image:', error)
    return null
  }
} 