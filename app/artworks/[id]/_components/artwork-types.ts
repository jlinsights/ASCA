export type HangeulFont = '궁채' | '판본체' | '고체' | '흘림체' | '민체'
export type HanjaFont = '해서' | '행서' | '예서' | '전서' | '초서' | '행초서'

export type CalligraphySize =
  | '반절지(35×135cm)'
  | '전지(70×135cm)'
  | '국전지(70×200cm)'
  | '기타'

export type ArtworkCategory =
  | '한글서예'
  | '한자서예'
  | '문인화'
  | '수묵화'
  | '동양화'
  | '민화'
  | '현대서예'
  | '캘리그라피'
  | '전각'
  | '서각'
  | '사진'
  | '영상'

export interface Artwork {
  id: string
  title: string
  titleEn: string
  titleJa: string
  titleZh: string
  artist: string
  artistEn: string
  artistJa: string
  artistZh: string
  category: ArtworkCategory
  style: '전통' | '현대'
  font?: HangeulFont | HanjaFont
  paperSize?: CalligraphySize
  medium: string
  mediumEn: string
  dimensions: string
  year: number
  price: number
  currency: string
  description: string
  descriptionEn: string
  descriptionJa: string
  descriptionZh: string
  imageUrl: string
  images: string[]
  isAvailable: boolean
  isFeatured: boolean
  tags: string[]
  views: number
  likes: number
  artistBio?: string
  technique?: string
  provenance?: string
  exhibition?: string
  condition?: string
  certification?: boolean
  artistId?: string
  weight?: string
  materials?: string[]
  significance?: string
  collectionHistory?: string
}
