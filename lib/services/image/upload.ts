// High-level artwork image upload orchestration

import type { ArtworkImage } from '@/lib/types/gallery'
import { generateImageId, getOptimalFormat } from './format'
import { extractImageMetadata } from './metadata'
import { generateDeepZoomTiles } from './tiles'
import { generateResponsiveSizes } from './transform'
import type { ImageSizeConfig } from './types'
import { validateImageFile, type ValidationOptions } from './validation'

type Uploader = (file: File | Blob, artworkId: string, variant: string) => Promise<string>

export interface UploadArtworkImageOptions {
  sizes: ImageSizeConfig[]
  validation: ValidationOptions
  uploader: Uploader
}

export async function uploadArtworkImage(
  file: File,
  artworkId: string,
  imageType: ArtworkImage['type'],
  options: UploadArtworkImageOptions,
  metadata?: Partial<ArtworkImage['metadata']>
): Promise<ArtworkImage> {
  validateImageFile(file, options.validation)

  const extractedMetadata = await extractImageMetadata(file)
  const originalUrl = await options.uploader(file, artworkId, 'original')
  const processedSizes = await generateResponsiveSizes(
    file,
    artworkId,
    options.sizes,
    options.uploader
  )
  const zoomTiles = await generateDeepZoomTiles(file, artworkId, options.uploader)

  return {
    id: generateImageId(),
    type: imageType,
    urls: {
      thumbnail: processedSizes.thumbnail || '',
      small: processedSizes.small || '',
      medium: processedSizes.medium || '',
      large: processedSizes.large || '',
      original: originalUrl,
      zoom_tiles: zoomTiles,
    },
    metadata: {
      filename: file.name,
      format: getOptimalFormat(file),
      dimensions: extractedMetadata.dimensions,
      file_size: file.size,
      dpi: extractedMetadata.dpi || 300,
      color_profile: extractedMetadata.colorProfile || 'sRGB',
      capture_date: extractedMetadata.captureDate,
      camera_info: extractedMetadata.cameraInfo,
      ...metadata,
    },
    regions: [],
    annotations: [],
    processing: {
      color_corrected: true,
      sharpened: true,
      noise_reduced: true,
      lens_corrected: false,
      processing_notes: 'Automated processing applied',
    },
  }
}
