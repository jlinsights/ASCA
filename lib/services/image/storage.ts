// CDN upload integration

import { logger } from '@/lib/utils/logger'

export interface StorageClientConfig {
  cdnBaseUrl: string
  apiKey: string
}

export function createUploader(
  config: StorageClientConfig
): (file: File | Blob, artworkId: string, variant: string) => Promise<string> {
  return async function uploadToStorage(
    file: File | Blob,
    artworkId: string,
    variant: string
  ): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('artwork_id', artworkId)
    formData.append('variant', variant)

    try {
      const response = await fetch(`${config.cdnBaseUrl}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.url
    } catch (error) {
      logger.error('Upload failed', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }
}
