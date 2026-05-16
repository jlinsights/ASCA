import { Input } from '@/components/ui/input'

export const PeriodSearch = ({ filters, updateFilter, availableFilters }: any) => (
  <div className='space-y-4'>
    <div className='grid grid-cols-2 gap-4'>
      <div>
        <label className='block text-sm font-medium text-ink-black mb-2'>Start Year</label>
        <Input
          type='number'
          placeholder='e.g., 1000'
          value={
            filters.creation_date?.start_date
              ? new Date(filters.creation_date.start_date).getFullYear()
              : ''
          }
          onChange={e => {
            const year = parseInt(e.target.value)
            if (!isNaN(year)) {
              updateFilter('creation_date', {
                ...filters.creation_date,
                start_date: new Date(year, 0, 1),
              })
            }
          }}
        />
      </div>
      <div>
        <label className='block text-sm font-medium text-ink-black mb-2'>End Year</label>
        <Input
          type='number'
          placeholder='e.g., 1500'
          value={
            filters.creation_date?.end_date
              ? new Date(filters.creation_date.end_date).getFullYear()
              : ''
          }
          onChange={e => {
            const year = parseInt(e.target.value)
            if (!isNaN(year)) {
              updateFilter('creation_date', {
                ...filters.creation_date,
                end_date: new Date(year, 11, 31),
              })
            }
          }}
        />
      </div>
    </div>

    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Dynasty</label>
      <select
        multiple
        value={filters.dynasty || []}
        onChange={e => {
          const values = Array.from(e.target.selectedOptions, option => option.value)
          updateFilter('dynasty', values)
        }}
        className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20'
      >
        {availableFilters.dynasties.map((dynasty: any) => (
          <option key={dynasty} value={dynasty}>
            {dynasty}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Region</label>
      <select
        multiple
        value={filters.region || []}
        onChange={e => {
          const values = Array.from(e.target.selectedOptions, option => option.value)
          updateFilter('region', values)
        }}
        className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20'
      >
        {availableFilters.regions.map((region: any) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
    </div>
  </div>
)
