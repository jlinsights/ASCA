'use client'

import { useState, useMemo } from 'react'
import type { CulturalEvent } from './types'

interface UseCulturalCalendarParams {
  events: CulturalEvent[]
}

export function useCulturalCalendar({ events }: UseCulturalCalendarParams) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Get events for a specific date
  const getEventsForDate = (date: Date): CulturalEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.date.start)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    if (selectedFilters.length === 0) return events

    return events.filter(event =>
      selectedFilters.some(
        filter => event.type === filter || event.tags.includes(filter) || event.season === filter
      )
    )
  }, [events, selectedFilters])

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const types = [...new Set(events.map(e => e.type))]
    const tags = [...new Set(events.flatMap(e => e.tags))]
    const seasons = [...new Set(events.map(e => e.season))]

    return { types, tags, seasons }
  }, [events])

  // Generate calendar days for current month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i)
      days.push({ date: currentDate, isCurrentMonth: true })
    }

    // Next month's leading days
    const totalCells = Math.ceil(days.length / 7) * 7
    for (let i = days.length; i < totalCells; i++) {
      const nextMonthDate: Date = new Date(year, month + 1, i - days.length + 1)
      days.push({ date: nextMonthDate, isCurrentMonth: false })
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  return {
    currentDate,
    viewMode,
    setViewMode,
    selectedFilters,
    setSelectedFilters,
    showFilters,
    setShowFilters,
    filteredEvents,
    filterOptions,
    getEventsForDate,
    getDaysInMonth,
    navigateMonth,
  }
}
