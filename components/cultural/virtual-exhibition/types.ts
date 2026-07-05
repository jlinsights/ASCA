// Types for virtual exhibition

export interface ExhibitionArtwork {
  id: string
  title: {
    original: string
    romanized: string
    english: string
  }
  artist: {
    name: string
    period: string
    school: string
  }
  image: {
    url: string
    highRes: string
    details: string[]
  }
  audio?: {
    url: string
    transcript: string
  }
  description: {
    cultural: string
    technical: string
    historical: string
  }
  dimensions: {
    width: number
    height: number
    unit: string
  }
  year: string
  medium: string
  provenance: string
  position: {
    x: number
    y: number
    wall: 'north' | 'south' | 'east' | 'west'
  }
}

export interface Exhibition {
  id: string
  title: string
  description: string
  curator: string
  theme: string
  period: string
  artworks: ExhibitionArtwork[]
  galleryLayout: {
    width: number
    height: number
    style: 'traditional' | 'modern' | 'minimalist'
  }
  ambiance: {
    lighting: 'warm' | 'neutral' | 'cool'
    music: boolean
    soundscape?: string
  }
}

export interface VirtualExhibitionProps {
  exhibition: Exhibition
  className?: string
}

export type ExhibitionView = 'gallery' | 'detail' | '3d'
