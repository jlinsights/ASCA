'use client'

import { useId, useRef, useState, type ReactNode } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/contexts/language-context'
import { discoveryCopy } from './discovery-copy'

export interface DiscoveryFilter {
  id: string
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

interface DiscoveryToolbarProps {
  search: string
  searchLabel: string
  onSearchChange: (value: string) => void
  filters: DiscoveryFilter[]
  resultText: string
  busy?: boolean
  onReset: () => void
  sort?: DiscoveryFilter
  children?: ReactNode
  extraConditions?: { id: string; label: string; onRemove: () => void }[]
}

function FilterSelect({ filter, prefix }: { filter: DiscoveryFilter; prefix: string }) {
  const id = `${prefix}-${filter.id}`
  return (
    <div className='min-w-0 space-y-2'>
      <label id={`${id}-label`} htmlFor={id} className='block text-sm font-medium text-foreground'>
        {filter.label}
      </label>
      <Select value={filter.value} onValueChange={filter.onChange}>
        <SelectTrigger id={id} aria-labelledby={`${id}-label`} className='h-12 text-base'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {filter.options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function DiscoveryToolbar({
  search,
  searchLabel,
  onSearchChange,
  filters,
  resultText,
  busy = false,
  onReset,
  sort,
  children,
  extraConditions = [],
}: DiscoveryToolbarProps) {
  const prefix = useId()
  const searchRef = useRef<HTMLInputElement>(null)
  const [expanded, setExpanded] = useState(false)
  const { language } = useLanguage()
  const copy = discoveryCopy[language]
  const selected = filters.filter(filter => filter.value !== 'all')
  const conditions = [
    ...selected.map(filter => ({
      id: filter.id,
      label: `${filter.label}: ${filter.options.find(option => option.value === filter.value)?.label ?? filter.value}`,
      onRemove: () => filter.onChange('all'),
    })),
    ...extraConditions,
  ]
  const hasConditions = search.trim().length > 0 || conditions.length > 0

  return (
    <section
      aria-label={copy.search}
      className='rounded-lg border border-border bg-card p-4 md:p-6'
    >
      <div className='grid items-end gap-4 md:grid-cols-3'>
        <div className={sort ? 'space-y-2 md:col-span-2' : 'space-y-2 md:col-span-3'}>
          <label htmlFor={`${prefix}-search`} className='block text-sm font-medium text-foreground'>
            {searchLabel}
          </label>
          <div className='relative'>
            <Search
              aria-hidden='true'
              className='pointer-events-none absolute left-4 top-4 h-4 w-4 text-muted-foreground'
            />
            <Input
              ref={searchRef}
              id={`${prefix}-search`}
              type='search'
              value={search}
              placeholder={searchLabel}
              onChange={event => onSearchChange(event.target.value)}
              className='h-12 pl-12 pr-12 text-base [&::-webkit-search-cancel-button]:appearance-none'
            />
            {search.length > 0 && (
              <Button
                type='button'
                variant='ghost'
                aria-label={copy.clearSearch}
                onClick={() => {
                  onSearchChange('')
                  searchRef.current?.focus()
                }}
                className='absolute right-0 top-0 h-12 w-12 p-0'
              >
                <X aria-hidden='true' />
              </Button>
            )}
          </div>
        </div>
        {sort && <FilterSelect filter={sort} prefix={prefix} />}
      </div>

      <Button
        type='button'
        variant='outline'
        aria-expanded={expanded}
        aria-controls={`${prefix}-filters`}
        onClick={() => setExpanded(value => !value)}
        className='mt-4 h-12 w-full lg:hidden'
      >
        <SlidersHorizontal aria-hidden='true' />
        {copy.filters}
        {conditions.length > 0 && ` (${conditions.length})`}
      </Button>

      <div
        id={`${prefix}-filters`}
        className={`mt-4 gap-4 border-t border-border pt-4 lg:grid lg:grid-cols-4 ${expanded ? 'grid grid-cols-1 sm:grid-cols-2' : 'hidden'}`}
      >
        {filters.map(filter => (
          <FilterSelect key={filter.id} filter={filter} prefix={prefix} />
        ))}
        {children}
      </div>

      {conditions.length > 0 && (
        <ul aria-label={copy.active} className='mt-4 flex flex-wrap gap-2'>
          {conditions.map(condition => (
            <li key={condition.id} className='min-w-0 max-w-full'>
              <Button
                type='button'
                variant='secondary'
                aria-label={`${copy.remove}: ${condition.label}`}
                onClick={() => {
                  condition.onRemove()
                  searchRef.current?.focus()
                }}
                className='h-auto min-h-12 max-w-full whitespace-normal px-4 py-2 text-left'
              >
                <span className='break-words'>{condition.label}</span>
                <X aria-hidden='true' />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className='mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4'>
        <p
          role='status'
          aria-live='polite'
          aria-atomic='true'
          className='text-sm text-muted-foreground'
        >
          {busy ? copy.updating : resultText}
        </p>
        {hasConditions && (
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              onReset()
              searchRef.current?.focus()
            }}
            className='h-12'
          >
            {copy.reset}
          </Button>
        )}
      </div>
    </section>
  )
}
