// Types for cultural events

export interface CulturalEvent {
  id: string
  title: {
    original: string
    romanized: string
    english: string
  }
  description: string
  type: 'exhibition' | 'workshop' | 'ceremony' | 'festival' | 'lecture' | 'performance'
  date: {
    start: Date
    end?: Date
    lunar?: {
      month: number
      day: number
      year: number
    }
  }
  location: {
    venue: string
    address: string
    online?: boolean
  }
  organizer: string
  instructor?: string
  capacity?: number
  registered?: number
  price?: {
    amount: number
    currency: string
    free?: boolean
  }
  tags: string[]
  culturalSignificance: string
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  featured?: boolean
  registrationRequired?: boolean
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

export interface TraditionalDate {
  year: number
  month: number
  day: number
  lunarMonth: number
  lunarDay: number
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
  animal: string
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  festivals?: string[]
}

export interface CulturalCalendarProps {
  events: CulturalEvent[]
  showLunarCalendar?: boolean
  showTraditionalFestivals?: boolean
  showSeasonalThemes?: boolean
  className?: string
}
