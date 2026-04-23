// Deep Zoom tile generation

import { logger } from '@/lib/utils/logger'
import { getMimeType } from './format'
import { loadImage } from './loader'
import type { DeepZoomConfig } from './types'

type Uploader = (file: File | Blob, artworkId: string, variant: string) => Promise<string>

function generateTile(
  img: HTMLImageElement,
  level: number,
  tileX: number,
  tileY: number,
  config: DeepZoomConfig
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    const scale = Math.pow(2, level)
    const scaledWidth = img.naturalWidth / scale
    const scaledHeight = img.naturalHeight / scale

    const tileLeft = tileX * config.tileSize
    const tileTop = tileY * config.tileSize
    const tileWidth = Math.min(config.tileSize, scaledWidth - tileLeft)
    const tileHeight = Math.min(config.tileSize, scaledHeight - tileTop)

    canvas.width = tileWidth
    canvas.height = tileHeight

    const srcLeft = tileLeft * scale
    const srcTop = tileTop * scale
    const srcWidth = tileWidth * scale
    const srcHeight = tileHeight * scale

    ctx.drawImage(img, srcLeft, srcTop, srcWidth, srcHeight, 0, 0, tileWidth, tileHeight)

    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create tile blob'))
        }
      },
      getMimeType(config.format),
      config.quality / 100
    )
  })
}

async function generateTilesForLevel(
  img: HTMLImageElement,
  level: number,
  config: DeepZoomConfig,
  artworkId: string,
  uploader: Uploader
): Promise<string[]> {
  const scale = Math.pow(2, level)
  const scaledWidth = Math.ceil(img.naturalWidth / scale)
  const scaledHeight = Math.ceil(img.naturalHeight / scale)

  const tilesX = Math.ceil(scaledWidth / config.tileSize)
  const tilesY = Math.ceil(scaledHeight / config.tileSize)

  const tiles: string[] = []

  for (let x = 0; x < tilesX; x++) {
    for (let y = 0; y < tilesY; y++) {
      const tileBlob = await generateTile(img, level, x, y, config)
      const tileUrl = await uploader(tileBlob, artworkId, `tile_${level}_${x}_${y}`)
      tiles.push(tileUrl)
    }
  }

  return tiles
}

export async function generateDeepZoomTiles(
  file: File,
  artworkId: string,
  uploader: Uploader,
  config: DeepZoomConfig = {
    tileSize: 512,
    overlap: 1,
    format: 'jpg',
    quality: 90,
    maxZoomLevel: 6,
  }
): Promise<string[]> {
  try {
    const img = await loadImage(file)
    const tiles: string[] = []

    for (let level = 0; level <= config.maxZoomLevel; level++) {
      const levelTiles = await generateTilesForLevel(img, level, config, artworkId, uploader)
      tiles.push(...levelTiles)
    }

    return tiles
  } catch (error) {
    logger.error(
      'Failed to generate deep zoom tiles',
      error instanceof Error ? error : new Error(String(error))
    )
    return []
  }
}
