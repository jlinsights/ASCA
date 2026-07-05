'use client'

import { useState } from 'react'
import type { LearningResource, LearningTab, UserProgress } from './types'

interface UseLearningHubParams {
  resources: LearningResource[]
  userProgress: UserProgress
  showProgressiveDisclosure: boolean
}

export function useLearningHub({
  resources,
  userProgress,
  showProgressiveDisclosure,
}: UseLearningHubParams) {
  const [selectedTab, setSelectedTab] = useState<LearningTab>('overview')
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<{
    difficulty?: string
    type?: string
    duration?: string
  }>({})

  // Filter resources based on search and filters
  const filteredResources = resources.filter(resource => {
    const matchesSearch =
      !searchTerm ||
      resource.title.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.title.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      switch (key) {
        case 'difficulty':
          return resource.difficulty === value
        case 'type':
          return resource.type === value
        case 'duration':
          const duration = resource.duration
          switch (value) {
            case 'short':
              return duration <= 15
            case 'medium':
              return duration > 15 && duration <= 60
            case 'long':
              return duration > 60
            default:
              return true
          }
        default:
          return true
      }
    })

    return matchesSearch && matchesFilters
  })

  const isResourceUnlocked = (resource: LearningResource) => {
    if (!showProgressiveDisclosure) return true
    return resource.prerequisites.every(prereq => userProgress.resourcesCompleted.includes(prereq))
  }

  const isResourceCompleted = (resourceId: string) => {
    return userProgress.resourcesCompleted.includes(resourceId)
  }

  return {
    selectedTab,
    setSelectedTab,
    selectedPath,
    setSelectedPath,
    selectedResource,
    setSelectedResource,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredResources,
    isResourceUnlocked,
    isResourceCompleted,
  }
}
