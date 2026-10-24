'use client'

import { DiscoveryToolbar } from '@/components/gallery/discovery-toolbar'
import { discoveryCopy } from '@/components/gallery/discovery-copy'
import { useLanguage } from '@/contexts/language-context'
import { getArtistFilterOptions } from './artist-filter-options'

interface ArtistFiltersProps {
  searchQuery: string
  membershipFilter: string
  specialtyFilter: string
  titleFilter: string
  nationalityFilter: string
  resultText: string
  busy: boolean
  onSearchChange: (value: string) => void
  onMembershipChange: (value: string) => void
  onSpecialtyChange: (value: string) => void
  onTitleChange: (value: string) => void
  onNationalityChange: (value: string) => void
  onReset: () => void
}

export function ArtistFilters(props: ArtistFiltersProps) {
  const { language } = useLanguage()
  const copy = discoveryCopy[language]
  const withAll = (group: Parameters<typeof getArtistFilterOptions>[0]) => [
    { value: 'all', label: copy.all },
    ...getArtistFilterOptions(group, language),
  ]

  return (
    <DiscoveryToolbar
      search={props.searchQuery}
      searchLabel={copy.artistSearch}
      onSearchChange={props.onSearchChange}
      resultText={props.resultText}
      busy={props.busy}
      onReset={props.onReset}
      filters={[
        {
          id: 'membership',
          label: copy.membership,
          value: props.membershipFilter,
          options: withAll('membership'),
          onChange: props.onMembershipChange,
        },
        {
          id: 'nationality',
          label: copy.nationality,
          value: props.nationalityFilter,
          options: withAll('nationality'),
          onChange: props.onNationalityChange,
        },
        {
          id: 'specialty',
          label: copy.specialty,
          value: props.specialtyFilter,
          options: withAll('specialty'),
          onChange: props.onSpecialtyChange,
        },
        {
          id: 'title',
          label: copy.title,
          value: props.titleFilter,
          options: withAll('title'),
          onChange: props.onTitleChange,
        },
      ]}
    />
  )
}
