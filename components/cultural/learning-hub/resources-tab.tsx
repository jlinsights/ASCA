'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Search } from 'lucide-react'
import type { LearningResource } from './types'
import { ResourceCard } from './resource-card'

interface ResourceFilters {
  difficulty?: string
  type?: string
  duration?: string
}

interface ResourcesTabProps {
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
  filters: ResourceFilters
  setFilters: Dispatch<SetStateAction<ResourceFilters>>
  filteredResources: LearningResource[]
  isResourceCompleted: (resourceId: string) => boolean
  isResourceUnlocked: (resource: LearningResource) => boolean
  onSelectResource: (resource: LearningResource) => void
}

export function ResourcesTab({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  filteredResources,
  isResourceCompleted,
  isResourceUnlocked,
  onSelectResource,
}: ResourcesTabProps) {
  return (
    <div className='space-y-6'>
      {/* Search and Filters */}
      <Card className='bg-silk-cream/30 border-celadon-green/20'>
        <CardContent className='p-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-black/40' />
              <input
                type='text'
                placeholder='Search resources...'
                aria-label='Search resources'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 rounded-md border border-celadon-green/20 bg-rice-paper text-sm'
              />
            </div>

            <select
              aria-label='Filter by difficulty'
              value={filters.difficulty || ''}
              onChange={e =>
                setFilters(prev => ({ ...prev, difficulty: e.target.value || undefined }))
              }
              className='p-2 rounded-md border border-celadon-green/20 bg-rice-paper text-sm'
            >
              <option value=''>All Levels</option>
              <option value='beginner'>Beginner</option>
              <option value='intermediate'>Intermediate</option>
              <option value='advanced'>Advanced</option>
              <option value='master'>Master</option>
            </select>

            <select
              aria-label='Filter by type'
              value={filters.type || ''}
              onChange={e => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
              className='p-2 rounded-md border border-celadon-green/20 bg-rice-paper text-sm'
            >
              <option value=''>All Types</option>
              <option value='video'>Video</option>
              <option value='audio'>Audio</option>
              <option value='document'>Document</option>
              <option value='interactive'>Interactive</option>
              <option value='practice'>Practice</option>
            </select>

            <select
              aria-label='Filter by duration'
              value={filters.duration || ''}
              onChange={e =>
                setFilters(prev => ({ ...prev, duration: e.target.value || undefined }))
              }
              className='p-2 rounded-md border border-celadon-green/20 bg-rice-paper text-sm'
            >
              <option value=''>All Durations</option>
              <option value='short'>Short (≤15m)</option>
              <option value='medium'>Medium (16-60m)</option>
              <option value='long'>Long (&gt;60m)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredResources.map(resource => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            isCompleted={isResourceCompleted(resource.id)}
            isUnlocked={isResourceUnlocked(resource)}
            onSelect={onSelectResource}
          />
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card className='text-center py-12'>
          <CardContent>
            <BookOpen className='w-12 h-12 text-ink-black/20 mx-auto mb-4' />
            <h3 className='font-calligraphy text-lg font-semibold text-ink-black mb-2'>
              No resources found
            </h3>
            <p className='text-ink-black/60'>Try adjusting your search terms or filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
