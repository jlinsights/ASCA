'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  Award,
  GraduationCap,
  BookOpen,
  Newspaper,
  Home,
  Users,
  MapPin,
  ExternalLink,
  Star
} from 'lucide-react'
import type { CareerEntry, TimelineView } from '@/types/career'
import { CAREER_ENTRY_TYPE_LABELS } from '@/types/career'
import Image from 'next/image'

interface TimelineProps {
  entries: CareerEntry[]
  view?: TimelineView
  onEdit?: (entry: CareerEntry) => void
  onDelete?: (entryId: string) => void
  onToggleFeatured?: (entryId: string) => void
  showActions?: boolean
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'exhibition':
      return <Home className="w-5 h-5" />
    case 'award':
      return <Award className="w-5 h-5" />
    case 'education':
      return <GraduationCap className="w-5 h-5" />
    case 'publication':
      return <BookOpen className="w-5 h-5" />
    case 'media':
      return <Newspaper className="w-5 h-5" />
    case 'residency':
      return <MapPin className="w-5 h-5" />
    case 'workshop':
      return <Users className="w-5 h-5" />
    default:
      return <Calendar className="w-5 h-5" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'exhibition':
      return 'bg-celadon-green/10 text-celadon-green border-celadon-green/30'
    case 'award':
      return 'bg-temple-gold/10 text-temple-gold border-temple-gold/30'
    case 'education':
      return 'bg-scholar-red/10 text-scholar-red border-scholar-red/30'
    case 'publication':
      return 'bg-ink-black/10 text-ink-black border-ink-black/30'
    case 'media':
      return 'bg-celadon-green/10 text-celadon-green border-celadon-green/30'
    default:
      return 'bg-rice-paper text-ink-black border-ink-black/20'
  }
}

export function Timeline({ 
  entries, 
  view = { groupBy: 'year', sortOrder: 'desc', showImages: true },
  onEdit,
  onDelete,
  onToggleFeatured,
  showActions = false
}: TimelineProps) {
  // Group entries by year
  const groupedEntries = useMemo(() => {
    if (view.groupBy === 'year') {
      const groups: Record<number, CareerEntry[]> = {}
      entries.forEach(entry => {
        if (!groups[entry.year]) {
          groups[entry.year] = []
        }
        groups[entry.year]!.push(entry) // Non-null assertion since we just created it
      })
      return groups
    } else if (view.groupBy === 'type') {
      const groups: Record<string, CareerEntry[]> = {}
      entries.forEach(entry => {
        if (!groups[entry.type]) {
          groups[entry.type] = []
        }
        groups[entry.type]!.push(entry) // Non-null assertion since we just created it
      })
      return groups
    }
    return { all: entries }
  }, [entries, view.groupBy])

  const sortedGroups = useMemo(() => {
    const keys = Object.keys(groupedEntries).sort((a, b) => {
      if (view.groupBy === 'year') {
        return view.sortOrder === 'desc' 
          ? parseInt(b) - parseInt(a)
          : parseInt(a) - parseInt(b)
      }
      return 0
    })
    return keys
  }, [groupedEntries, view])

  return (
    <div className="space-y-8">
      {sortedGroups.map((groupKey: string) => {
        // Type-safe access: treat groupedEntries as Record with string|number keys
        const entriesRecord = groupedEntries as Record<string | number, CareerEntry[]>
        const entries = entriesRecord[groupKey]
        if (!entries || !Array.isArray(entries)) return null
        
        return (
        <div key={groupKey} className="relative">
          {/* Year/Type Header */}
          <div className="sticky top-0 bg-rice-paper/80 dark:bg-ink-black/80 backdrop-blur-sm z-10 pb-4">
            <h3 className="text-2xl font-serif font-bold text-foreground border-b-2 border-celadon-green pb-2">
              {view.groupBy === 'year' ? `${groupKey}년` : CAREER_ENTRY_TYPE_LABELS[groupKey as keyof typeof CAREER_ENTRY_TYPE_LABELS]?.ko}
            </h3>
          </div>

          {/* Timeline Line */}
          <div className="relative pl-8 border-l-2 border-celadon-green/30 space-y-6">
            {entries.map((entry: CareerEntry, index: number) => (
              <div key={entry.id} className="relative">
                {/* Timeline Dot */}
                <div className="absolute -left-[33px] top-6 w-4 h-4 rounded-full bg-celadon-green border-4 border-rice-paper dark:border-ink-black">
                  {entry.isFeatured && (
                    <Star className="w-6 h-6 text-temple-gold absolute -top-1 -left-1 fill-temple-gold" />
                  )}
                </div>

                <Card className="ml-4 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getTypeColor(entry.type)} border`}>
                            <span className="flex items-center gap-1">
                              {getTypeIcon(entry.type)}
                              <span className="ml-1">
                                {CAREER_ENTRY_TYPE_LABELS[entry.type]?.ko}
                              </span>
                            </span>
                          </Badge>
                          {entry.month && (
                            <span className="text-sm text-muted-foreground">
                              {entry.month}월
                            </span>
                          )}
                        </div>
                        
                        <CardTitle className="text-xl font-serif">
                          {entry.title}
                        </CardTitle>
                        {entry.titleEn && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {entry.titleEn}
                          </p>
                        )}
                      </div>

                      {showActions && (
                        <div className="flex gap-2">
                          {onToggleFeatured && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onToggleFeatured(entry.id)}
                            >
                              <Star className={entry.isFeatured ? 'fill-temple-gold text-temple-gold' : ''} />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(entry)}
                            >
                              수정
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onDelete(entry.id)}
                            >
                              삭제
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Organization */}
                    {entry.organization && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{entry.organization}</span>
                        {entry.location && (
                          <span className="text-muted-foreground">· {entry.location}</span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {entry.description && (
                      <p className="text-sm text-foreground leading-relaxed">
                        {entry.description}
                      </p>
                    )}

                    {/* Role */}
                    {entry.role && (
                      <p className="text-sm text-muted-foreground">
                        역할: {entry.role}
                      </p>
                    )}

                    {/* Images */}
                    {view.showImages && entry.images && entry.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {entry.images.slice(0, 3).map((image: string, idx: number) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                            <Image
                              src={image}
                              alt={`${entry.title} ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* External Link */}
                    {entry.externalUrl && (
                      <a
                        href={entry.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-celadon-green hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        자세히 보기
                      </a>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
        )
      })}

      {entries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>등록된 이력이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
