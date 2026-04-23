// Image Service — Configuration Types

export interface ImageProcessingConfig {
  formats: ('webp' | 'avif' | 'jpg' | 'png')[]
  quality: number
  progressive: boolean
  stripMetadata: boolean
  sharpen?: number
  denoise?: number
  autoContrast?: boolean
  colorProfileConversion?: string
}

export interface ImageSizeConfig {
  name: string
  width?: number
  height?: number
  quality: number
  format: 'webp' | 'avif' | 'jpg' | 'png'
  description: string
}

export interface DeepZoomConfig {
  tileSize: number
  overlap: number
  format: 'jpg' | 'png'
  quality: number
  maxZoomLevel: number
}

export interface ImageServiceConfig {
  cdnBaseUrl: string
  apiKey: string
  maxFileSize?: number
  allowedFormats?: string[]
}
