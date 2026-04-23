// Format, MIME, and ID helpers — pure utilities

import type { ImageSizeConfig } from './types'

export const DEFAULT_SIZES: ImageSizeConfig[] = [
  {
    name: 'thumbnail',
    width: 150,
    height: 150,
    quality: 80,
    format: 'webp',
    description: 'Small thumbnail for lists and previews',
  },
  {
    name: 'small',
    width: 400,
    quality: 85,
    format: 'webp',
    description: 'Small size for mobile devices',
  },
  {
    name: 'medium',
    width: 800,
    quality: 90,
    format: 'webp',
    description: 'Medium size for tablet and desktop',
  },
  {
    name: 'large',
    width: 1600,
    quality: 95,
    format: 'webp',
    description: 'Large size for detailed viewing',
  },
  {
    name: 'xlarge',
    width: 3200,
    quality: 98,
    format: 'jpg',
    description: 'Extra large for scholarly examination',
  },
]

export function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    webp: 'image/webp',
    avif: 'image/avif',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    tiff: 'image/tiff',
  }
  return mimeTypes[format.toLowerCase()] || 'image/jpeg'
}

export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

export function supportsAVIF(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  try {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
  } catch {
    return false
  }
}

export function getOptimalFormat(file: File): 'webp' | 'avif' | 'jpg' | 'png' {
  if (supportsAVIF() && file.size > 1024 * 1024) {
    return 'avif'
  }
  if (supportsWebP()) {
    return 'webp'
  }
  if (file.type.includes('png')) {
    return 'png'
  }
  return 'jpg'
}

export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
