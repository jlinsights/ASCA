import { BookOpen, PlayCircle, FileText, Video, Headphones, Brush } from 'lucide-react'
import { DIFFICULTY_BG } from '../_constants/color-classes'

export const getDifficultyColor = (difficulty: string) =>
  DIFFICULTY_BG[difficulty] ?? DIFFICULTY_BG.default

export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return Video
    case 'audio':
      return Headphones
    case 'document':
      return FileText
    case 'interactive':
      return PlayCircle
    case 'practice':
      return Brush
    default:
      return BookOpen
  }
}

export const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}
