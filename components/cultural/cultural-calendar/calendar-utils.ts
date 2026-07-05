import { EVENT_TYPE_CLASSES, SEASONAL_BG } from '../_constants/color-classes'
import type { TraditionalDate } from './types'

// Get traditional festivals for a given date
export const getTraditionalFestivals = (month: number, day: number): string[] => {
  const festivals: Record<string, string[]> = {
    '1-1': ["New Year's Day"],
    '2-14': ['Lantern Festival'],
    '3-3': ['Double Third Festival'],
    '5-5': ['Dragon Boat Festival'],
    '7-7': ['Qixi Festival'],
    '8-15': ['Mid-Autumn Festival'],
    '9-9': ['Double Ninth Festival'],
    '12-22': ['Winter Solstice'],
  }

  return festivals[`${month}-${day}`] || []
}

// Traditional calendar data (simplified)
export const getTraditionalDate = (date: Date): TraditionalDate => {
  // This is a simplified implementation - in a real app, you'd use a proper lunar calendar library
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Simplified lunar date calculation (approximation)
  const lunarMonth = ((month + 10) % 12) + 1
  const lunarDay = Math.floor(day * 0.95) + 1

  // Five elements cycle
  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const
  const element = elements[year % 5]

  // Chinese zodiac animals
  const animals = [
    'Rat',
    'Ox',
    'Tiger',
    'Rabbit',
    'Dragon',
    'Snake',
    'Horse',
    'Goat',
    'Monkey',
    'Rooster',
    'Dog',
    'Pig',
  ]
  const animal = animals[year % 12]

  // Season determination
  const seasons = [
    'winter',
    'winter',
    'spring',
    'spring',
    'spring',
    'summer',
    'summer',
    'summer',
    'autumn',
    'autumn',
    'autumn',
    'winter',
  ] as const
  const season = seasons[month - 1]

  return {
    year,
    month,
    day,
    lunarMonth,
    lunarDay,
    element: element || 'wood', // Provide fallback for TypeScript
    animal: animal || 'Rat', // Provide fallback for TypeScript
    season: season || 'spring', // Provide fallback for TypeScript
    festivals: getTraditionalFestivals(month, day),
  }
}

export const getSeasonalColor = (season: string) => SEASONAL_BG[season] ?? SEASONAL_BG.default

export const getEventTypeColor = (type: string) =>
  EVENT_TYPE_CLASSES[type] ?? EVENT_TYPE_CLASSES.default

export const formatEventTime = (date: Date, endDate?: Date) => {
  const timeFormat = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  if (endDate) {
    return `${timeFormat.format(date)} - ${timeFormat.format(endDate)}`
  }
  return timeFormat.format(date)
}
