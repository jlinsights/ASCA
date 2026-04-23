// Image URL generation with transformation parameters

export interface ImageTransformations {
  width?: number
  height?: number
  quality?: number
  format?: string
  crop?: 'fill' | 'fit' | 'pad' | 'crop'
  gravity?: 'center' | 'north' | 'south' | 'east' | 'west'
  blur?: number
  sharpen?: number
  contrast?: number
  brightness?: number
  saturation?: number
}

export function generateOptimizedUrl(
  baseUrl: string,
  transformations: ImageTransformations = {}
): string {
  const params = new URLSearchParams()

  Object.entries(transformations).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString())
    }
  })

  return `${baseUrl}?${params.toString()}`
}
