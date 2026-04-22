// Image and Media Management

export interface ArtworkImage {
  id: string
  type: 'primary' | 'detail' | 'full_view' | 'raking_light' | 'infrared' | 'x_ray'
  urls: {
    thumbnail: string // 150x150
    small: string // 400px wide
    medium: string // 800px wide
    large: string // 1600px wide
    original: string // Full resolution
    zoom_tiles?: string[] // Deep zoom tiles
  }
  metadata: {
    filename: string
    format: 'webp' | 'avif' | 'jpg' | 'png' | 'tiff'
    dimensions: {
      width: number
      height: number
    }
    file_size: number
    dpi: number
    color_profile: string
    capture_date?: Date
    camera_info?: CameraInfo
    lighting_conditions?: string
  }
  regions?: ImageRegion[]
  annotations?: ImageAnnotation[]
  processing: {
    color_corrected: boolean
    sharpened: boolean
    noise_reduced: boolean
    lens_corrected: boolean
    processing_notes?: string
  }
}

export interface ImageRegion {
  id: string
  name: string
  description: string
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
  type: 'character' | 'seal' | 'signature' | 'damage' | 'restoration' | 'annotation'
  educational_note?: string
  related_content?: string[]
}

export interface ImageAnnotation {
  id: string
  position: {
    x: number
    y: number
  }
  type: 'stroke_analysis' | 'technique_highlight' | 'historical_note' | 'restoration_note'
  title: string
  content: string
  media?: {
    image_url?: string
    video_url?: string
    audio_url?: string
  }
  visibility: 'always' | 'hover' | 'click'
  target_audience: 'general' | 'students' | 'scholars' | 'conservators'
}

export interface CameraInfo {
  make: string
  model: string
  lens: string
  focal_length: number
  aperture: string
  shutter_speed: string
  iso: number
}
