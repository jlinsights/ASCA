// ImageService — thin composition layer over domain modules

import type { ArtworkImage } from '@/lib/types/gallery'
import { DEFAULT_SIZES } from './format'
import { analyzeImageQuality, type ImageQualityReport } from './metadata'
import { createUploader } from './storage'
import { loadImageProgressively } from './transform'
import type { ImageServiceConfig, ImageSizeConfig } from './types'
import { generateOptimizedUrl, type ImageTransformations } from './url'
import { uploadArtworkImage } from './upload'

export class ImageService {
  private cdnBaseUrl: string
  private apiKey: string
  private maxFileSize: number
  private allowedFormats: string[]
  private defaultSizes: ImageSizeConfig[]
  private uploader: (file: File | Blob, artworkId: string, variant: string) => Promise<string>

  constructor(config: ImageServiceConfig) {
    this.cdnBaseUrl = config.cdnBaseUrl
    this.apiKey = config.apiKey
    this.maxFileSize = config.maxFileSize || 50 * 1024 * 1024
    this.allowedFormats = config.allowedFormats || ['jpg', 'png', 'tiff', 'webp', 'avif']
    this.defaultSizes = DEFAULT_SIZES
    this.uploader = createUploader({ cdnBaseUrl: this.cdnBaseUrl, apiKey: this.apiKey })
  }

  uploadArtworkImage(
    file: File,
    artworkId: string,
    imageType: ArtworkImage['type'],
    metadata?: Partial<ArtworkImage['metadata']>
  ): Promise<ArtworkImage> {
    return uploadArtworkImage(
      file,
      artworkId,
      imageType,
      {
        sizes: this.defaultSizes,
        validation: {
          maxFileSize: this.maxFileSize,
          allowedFormats: this.allowedFormats,
        },
        uploader: this.uploader,
      },
      metadata
    )
  }

  generateOptimizedUrl(baseUrl: string, transformations: ImageTransformations = {}): string {
    return generateOptimizedUrl(baseUrl, transformations)
  }

  loadImageProgressively(
    urls: ArtworkImage['urls'],
    onProgress?: (loadedSize: string) => void
  ): Promise<string> {
    return loadImageProgressively(urls, onProgress)
  }

  analyzeImageQuality(file: File): Promise<ImageQualityReport> {
    return analyzeImageQuality(file)
  }
}

export function createImageService(config: ImageServiceConfig): ImageService {
  return new ImageService(config)
}

export const defaultImageConfig = {
  maxFileSize: 50 * 1024 * 1024,
  allowedFormats: ['jpg', 'jpeg', 'png', 'tiff', 'webp', 'avif'],
  qualitySettings: {
    thumbnail: 80,
    small: 85,
    medium: 90,
    large: 95,
    original: 100,
  },
  deepZoom: {
    tileSize: 512,
    overlap: 1,
    maxZoomLevel: 6,
  },
}
