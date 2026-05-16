import type { Dispatch, SetStateAction } from 'react'
import type { ArtworkCategory, ArtworkStatus } from '@/lib/types/artwork-legacy'

export interface ArtworkFormData {
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  category: ArtworkCategory
  medium: string
  width: string
  height: string
  depth: string
  unit: 'cm' | 'mm' | 'inch'
  yearCreated: number
  isForSale: boolean
  price: string
  currency: string
  tags: string
  status: ArtworkStatus
}

export interface ArtworkSectionProps {
  formData: ArtworkFormData
  setFormData: Dispatch<SetStateAction<ArtworkFormData>>
}
