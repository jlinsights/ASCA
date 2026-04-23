// Metadata extraction and image quality analysis

import type { CameraInfo } from '@/lib/types/gallery'
import { logger } from '@/lib/utils/logger'
import { loadImage } from './loader'

export interface ExtractedMetadata {
  dimensions: { width: number; height: number }
  dpi?: number
  colorProfile?: string
  captureDate?: Date
  cameraInfo?: CameraInfo
}

export interface ImageQualityReport {
  resolution: 'low' | 'medium' | 'high' | 'print_quality'
  sharpness: number
  contrast: number
  brightness: number
  colorRange: number
  artifacts: string[]
  recommendations: string[]
}

async function extractExifData(file: File): Promise<Partial<ExtractedMetadata>> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const dataView = new DataView(arrayBuffer)
    if (dataView.getUint16(0) === 0xffd8) {
      return {}
    }
    return {}
  } catch (error) {
    logger.warn(
      'Could not extract EXIF data',
      error instanceof Error ? error : new Error(String(error))
    )
    return {}
  }
}

export async function extractImageMetadata(file: File): Promise<ExtractedMetadata> {
  return new Promise(resolve => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      if (ctx) {
        ctx.drawImage(img, 0, 0)
      }
      const metadata: ExtractedMetadata = {
        dimensions: { width: img.naturalWidth, height: img.naturalHeight },
      }

      extractExifData(file)
        .then(exifData => resolve({ ...metadata, ...exifData }))
        .catch(() => resolve(metadata))

      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => {
      resolve({ dimensions: { width: 0, height: 0 } })
    }

    img.src = URL.createObjectURL(file)
  })
}

function assessResolution(dimensions: {
  width: number
  height: number
}): 'low' | 'medium' | 'high' | 'print_quality' {
  const totalPixels = dimensions.width * dimensions.height
  if (totalPixels >= 16000000) return 'print_quality'
  if (totalPixels >= 4000000) return 'high'
  if (totalPixels >= 1000000) return 'medium'
  return 'low'
}

function calculateSharpness(imageData: ImageData): number {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  let sharpness = 0
  let count = 0

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4
      const gx = ((data[i + 4] || 0) - (data[i - 4] || 0)) / 2
      const gy = ((data[i + width * 4] || 0) - (data[i - width * 4] || 0)) / 2
      const magnitude = Math.sqrt(gx * gx + gy * gy)
      sharpness += magnitude
      count++
    }
  }
  return count > 0 ? sharpness / count : 0
}

function calculateContrast(imageData: ImageData): number {
  const data = imageData.data
  const values: number[] = []
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * (data[i] || 0) + 0.587 * (data[i + 1] || 0) + 0.114 * (data[i + 2] || 0)
    values.push(gray)
  }
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}

function calculateBrightness(imageData: ImageData): number {
  const data = imageData.data
  let brightness = 0
  let count = 0
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * (data[i] || 0) + 0.587 * (data[i + 1] || 0) + 0.114 * (data[i + 2] || 0)
    brightness += gray
    count++
  }
  return count > 0 ? brightness / count : 0
}

function calculateColorRange(imageData: ImageData): number {
  const data = imageData.data
  const colors = new Set<string>()
  for (let i = 0; i < data.length; i += 40) {
    const r = Math.floor((data[i] || 0) / 16) * 16
    const g = Math.floor((data[i + 1] || 0) / 16) * 16
    const b = Math.floor((data[i + 2] || 0) / 16) * 16
    colors.add(`${r},${g},${b}`)
  }
  return colors.size
}

function detectArtifacts(imageData: ImageData): string[] {
  const artifacts: string[] = []
  const brightness = calculateBrightness(imageData)
  const contrast = calculateContrast(imageData)

  if (brightness < 50) artifacts.push('underexposed')
  else if (brightness > 200) artifacts.push('overexposed')
  if (contrast < 20) artifacts.push('low_contrast')
  return artifacts
}

function generateRecommendations(
  metadata: { dimensions: { width: number; height: number } },
  imageData: ImageData
): string[] {
  const recommendations: string[] = []
  const brightness = calculateBrightness(imageData)
  const contrast = calculateContrast(imageData)
  const resolution = assessResolution(metadata.dimensions)

  if (resolution === 'low') {
    recommendations.push('Consider capturing at higher resolution for better detail preservation')
  }
  if (brightness < 80) {
    recommendations.push('Image appears underexposed - consider brightness adjustment')
  } else if (brightness > 180) {
    recommendations.push('Image appears overexposed - consider reducing brightness')
  }
  if (contrast < 30) {
    recommendations.push('Low contrast detected - consider contrast enhancement')
  }
  if (metadata.dimensions.width < 1000 || metadata.dimensions.height < 1000) {
    recommendations.push('Image resolution may be insufficient for detailed scholarly examination')
  }
  return recommendations
}

export async function analyzeImageQuality(file: File): Promise<ImageQualityReport> {
  const metadata = await extractImageMetadata(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas context not available')
  }
  const img = await loadImage(file)
  canvas.width = Math.min(img.naturalWidth, 1000)
  canvas.height = Math.min(img.naturalHeight, 1000)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  return {
    resolution: assessResolution(metadata.dimensions),
    sharpness: calculateSharpness(imageData),
    contrast: calculateContrast(imageData),
    brightness: calculateBrightness(imageData),
    colorRange: calculateColorRange(imageData),
    artifacts: detectArtifacts(imageData),
    recommendations: generateRecommendations(metadata, imageData),
  }
}
