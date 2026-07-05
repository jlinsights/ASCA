'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, FileText, Brush, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LearningHubProps } from './learning-hub/types'
import { useLearningHub } from './learning-hub/use-learning-hub'
import { OverviewTab } from './learning-hub/overview-tab'
import { ResourcesTab } from './learning-hub/resources-tab'

// ===============================
// Main Component (shell)
// ===============================

function LearningHub({
  resources,
  learningPaths,
  userProgress,
  showProgressiveDisclosure = true,
  className,
}: LearningHubProps) {
  const {
    selectedTab,
    setSelectedTab,
    setSelectedPath,
    setSelectedResource,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredResources,
    isResourceUnlocked,
    isResourceCompleted,
  } = useLearningHub({ resources, userProgress, showProgressiveDisclosure })

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className='text-center mb-8'>
        <h1 className='font-calligraphy text-3xl font-bold text-ink-black mb-4'>
          Traditional Calligraphy Learning Hub
        </h1>
        <p className='font-serif text-lg text-ink-black/70 max-w-2xl mx-auto'>
          Master the ancient art of East Asian calligraphy through structured learning paths, expert
          instruction, and progressive skill development.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className='flex justify-center mb-8'>
        <div className='flex gap-1 bg-silk-cream/50 rounded-lg p-1'>
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'paths', label: 'Learning Paths', icon: BookOpen },
            { id: 'resources', label: 'Resources', icon: FileText },
            { id: 'practice', label: 'Practice', icon: Brush },
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={selectedTab === id ? 'default' : 'ghost'}
              onClick={() => setSelectedTab(id as any)}
              className={cn(
                'flex items-center gap-2',
                selectedTab === id && 'bg-celadon-green text-ink-black'
              )}
            >
              <Icon className='w-4 h-4' />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <OverviewTab
          userProgress={userProgress}
          resources={resources}
          learningPaths={learningPaths}
          isResourceCompleted={isResourceCompleted}
          isResourceUnlocked={isResourceUnlocked}
          onSelectResource={setSelectedResource}
          onSelectPath={pathId => {
            setSelectedPath(pathId)
            setSelectedTab('paths')
          }}
        />
      )}
      {selectedTab === 'resources' && (
        <ResourcesTab
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          filteredResources={filteredResources}
          isResourceCompleted={isResourceCompleted}
          isResourceUnlocked={isResourceUnlocked}
          onSelectResource={setSelectedResource}
        />
      )}

      {/* Placeholder for other tabs */}
      {(selectedTab === 'paths' || selectedTab === 'practice') && (
        <Card className='text-center py-12'>
          <CardContent>
            <BookOpen className='w-12 h-12 text-ink-black/20 mx-auto mb-4' />
            <h3 className='font-calligraphy text-lg font-semibold text-ink-black mb-2'>
              {selectedTab === 'paths' ? 'Learning Paths' : 'Practice Area'}
            </h3>
            <p className='text-ink-black/60'>This section is under development. Coming soon!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LearningHub
