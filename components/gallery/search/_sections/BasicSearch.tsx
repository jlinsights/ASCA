import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export const BasicSearch = ({ filters, updateFilter, availableFilters }: any) => (
  <div className='space-y-4'>
    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Search Text</label>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-black/40' />
        <Input
          type='text'
          placeholder='Search by title, artist, description...'
          value={filters.text_search || ''}
          onChange={e => updateFilter('text_search', e.target.value)}
          className='pl-10'
        />
      </div>
    </div>

    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Artists</label>
      <select
        multiple
        value={filters.artist_ids || []}
        onChange={e => {
          const values = Array.from(e.target.selectedOptions, option => option.value)
          updateFilter('artist_ids', values)
        }}
        className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-24'
      >
        {availableFilters.artists.map((artist: any) => (
          <option key={artist.id} value={artist.id}>
            {artist.name}
          </option>
        ))}
      </select>
      <p className='text-xs text-ink-black/60 mt-1'>Hold Ctrl/Cmd to select multiple</p>
    </div>
  </div>
)
