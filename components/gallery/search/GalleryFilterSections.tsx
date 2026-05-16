import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { BasicSearch } from './_sections/BasicSearch'
import { PeriodSearch } from './_sections/PeriodSearch'
import { StyleSearch } from './_sections/StyleSearch'
import { TechnicalSearch } from './_sections/TechnicalSearch'
import { PhysicalSearch } from './_sections/PhysicalSearch'
import { CulturalSearch } from './_sections/CulturalSearch'
import { CollectionSearch } from './_sections/CollectionSearch'

export {
  BasicSearch,
  PeriodSearch,
  StyleSearch,
  TechnicalSearch,
  PhysicalSearch,
  CulturalSearch,
  CollectionSearch,
}

export const FilterSectionWrapper = ({
  section,
  expandedSections,
  toggleSection,
  filters,
  updateFilter,
  availableFilters,
}: any) => {
  const isExpanded = expandedSections.has(section.id)
  const Icon = section.icon

  return (
    <Card key={section.id} className='border-celadon-green/20'>
      <CardHeader
        className='pb-3 cursor-pointer hover:bg-silk-cream/30 transition-colors'
        onClick={() => toggleSection(section.id)}
      >
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base font-medium flex items-center gap-2'>
            <Icon className='w-4 h-4 text-celadon-green' />
            {section.title}
          </CardTitle>
          {isExpanded ? (
            <ChevronUp className='w-4 h-4 text-ink-black/60' />
          ) : (
            <ChevronDown className='w-4 h-4 text-ink-black/60' />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className='pt-0'>
          {section.id === 'basic' && (
            <BasicSearch
              filters={filters}
              updateFilter={updateFilter}
              availableFilters={availableFilters}
            />
          )}
          {section.id === 'period' && (
            <PeriodSearch
              filters={filters}
              updateFilter={updateFilter}
              availableFilters={availableFilters}
            />
          )}
          {section.id === 'style' && (
            <StyleSearch
              filters={filters}
              updateFilter={updateFilter}
              availableFilters={availableFilters}
            />
          )}
          {section.id === 'technical' && (
            <TechnicalSearch
              filters={filters}
              updateFilter={updateFilter}
              availableFilters={availableFilters}
            />
          )}
          {section.id === 'physical' && (
            <PhysicalSearch
              filters={filters}
              updateFilter={updateFilter}
              availableFilters={availableFilters}
            />
          )}
          {section.id === 'cultural' && (
            <CulturalSearch
              filters={filters}
              updateFilter={updateFilter}
              availableFilters={availableFilters}
            />
          )}
          {section.id === 'collection' && (
            <CollectionSearch
              filters={filters}
              updateFilter={updateFilter}
              availableFilters={availableFilters}
            />
          )}
        </CardContent>
      )}
    </Card>
  )
}
