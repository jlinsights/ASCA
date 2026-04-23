// Image resizing and progressive loading

import type { ArtworkImage } from '@/lib/types/gallery'
import { logger } from '@/lib/utils/logger'
import { getMimeType } from './format'
import { preloadImage } from './loader'
import type { ImageSizeConfig } from './types'

export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } {
  if (!targetWidth && !targetHeight) {
    return { width: originalWidth, height: originalHeight }
  }

  const aspectRatio = originalWidth / originalHeight

  if (targetWidth && targetHeight) {
    const widthRatio = targetWidth / originalWidth
    const heightRatio = targetHeight / originalHeight
    const ratio = Math.min(widthRatio, heightRatio)
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio),
    }
  }

  if (targetWidth) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
    }
  }

  if (targetHeight) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight,
    }
  }

  return { width: originalWidth, height: originalHeight }
}

export function resizeImage(file: File, config: ImageSizeConfig): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      const { width: targetWidth, height: targetHeight } = calculateDimensions(
        img.naturalWidth,
        img.naturalHeight,
        config.width,
        config.height
      )

      canvas.width = targetWidth
      canvas.height = targetHeight

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        getMimeType(config.format),
        config.quality / 100
      )

      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

type Uploader = (file: File | Blob, artworkId: string, variant: string) => Promise<string>

export async function generateResponsiveSizes(
  file: File,
  artworkId: string,
  sizes: ImageSizeConfig[],
  uploader: Uploader
): Promise<Record<string, string>> {
  const result: Record<string, string> = {}

  for (const sizeConfig of sizes) {
    try {
      const processedBlob = await resizeImage(file, sizeConfig)
      const url = await uploader(processedBlob, artworkId, sizeConfig.name)
      result[sizeConfig.name] = url
    } catch (error) {
      logger.error(
        `Failed to generate ${sizeConfig.name} size`,
        error instanceof Error ? error : new Error(String(error))
      )
      result[sizeConfig.name] = await uploader(file, artworkId, 'original')
    }
  }

  return result
}

async function preloadLargerSizes(urls: ArtworkImage['urls'], currentSize: string): Promise<void> {
  const sizeOrder = ['thumbnail', 'small', 'medium', 'large', 'original']
  const currentIndex = sizeOrder.indexOf(currentSize)

  for (let i = currentIndex + 1; i < sizeOrder.length; i++) {
    const size = sizeOrder[i] as keyof typeof urls
    const url = urls[size]
    if (url) {
      try {
        const imageUrl = Array.isArray(url) ? url[0] || '' : url
        if (imageUrl) await preloadImage(imageUrl)
      } catch (error) {
        logger.warn(
          `Failed to preload ${size} image`,
          error instanceof Error ? error : new Error(String(error))
        )
      }
    }
  }
}

export async function loadImageProgressively(
  urls: ArtworkImage['urls'],
  onProgress?: (loadedSize: string) => void
): Promise<string> {
  const sizeOrder = ['thumbnail', 'small', 'medium', 'large', 'original'] as const

  for (const size of sizeOrder) {
    const url = urls[size]
    if (url) {
      try {
        await preloadImage(url)
        onProgress?.(size)
        if (size !== 'original') {
          preloadLargerSizes(urls, size)
        }
        return url
      } catch (error) {
        logger.warn(
          `Failed to load ${size} image`,
          error instanceof Error ? error : new Error(String(error))
        )
        continue
      }
    }
  }

  throw new Error('No image sizes could be loaded')
}
