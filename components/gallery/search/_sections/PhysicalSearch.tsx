import { Input } from '@/components/ui/input'

export const PhysicalSearch = ({ filters, updateFilter, availableFilters }: any) => (
  <div className='space-y-4'>
    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Dimensions (cm)</label>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <Input
            type='number'
            placeholder='Min Width'
            value={filters.dimensions?.min_width || ''}
            onChange={e => {
              const value = parseFloat(e.target.value)
              updateFilter('dimensions', {
                ...filters.dimensions,
                min_width: isNaN(value) ? undefined : value,
              })
            }}
          />
        </div>
        <div>
          <Input
            type='number'
            placeholder='Max Width'
            value={filters.dimensions?.max_width || ''}
            onChange={e => {
              const value = parseFloat(e.target.value)
              updateFilter('dimensions', {
                ...filters.dimensions,
                max_width: isNaN(value) ? undefined : value,
              })
            }}
          />
        </div>
        <div>
          <Input
            type='number'
            placeholder='Min Height'
            value={filters.dimensions?.min_height || ''}
            onChange={e => {
              const value = parseFloat(e.target.value)
              updateFilter('dimensions', {
                ...filters.dimensions,
                min_height: isNaN(value) ? undefined : value,
              })
            }}
          />
        </div>
        <div>
          <Input
            type='number'
            placeholder='Max Height'
            value={filters.dimensions?.max_height || ''}
            onChange={e => {
              const value = parseFloat(e.target.value)
              updateFilter('dimensions', {
                ...filters.dimensions,
                max_height: isNaN(value) ? undefined : value,
              })
            }}
          />
        </div>
      </div>
    </div>

    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Condition</label>
      <select
        multiple
        value={filters.condition || []}
        onChange={e => {
          const values = Array.from(e.target.selectedOptions, option => option.value)
          updateFilter('condition', values)
        }}
        className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20'
      >
        <option value='excellent'>Excellent</option>
        <option value='very_good'>Very Good</option>
        <option value='good'>Good</option>
        <option value='fair'>Fair</option>
        <option value='poor'>Poor</option>
      </select>
    </div>

    <div className='space-y-2'>
      <label className='flex items-center gap-2'>
        <input
          type='checkbox'
          checked={filters.provenance_verified || false}
          onChange={e => updateFilter('provenance_verified', e.target.checked)}
          className='rounded border-celadon-green/30'
        />
        <span className='text-sm text-ink-black'>Verified Provenance</span>
      </label>

      <label className='flex items-center gap-2'>
        <input
          type='checkbox'
          checked={filters.exhibition_history || false}
          onChange={e => updateFilter('exhibition_history', e.target.checked)}
          className='rounded border-celadon-green/30'
        />
        <span className='text-sm text-ink-black'>Has Exhibition History</span>
      </label>
    </div>
  </div>
)
