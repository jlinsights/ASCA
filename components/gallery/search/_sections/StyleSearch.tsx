export const StyleSearch = ({ filters, updateFilter, availableFilters }: any) => (
  <div className='space-y-4'>
    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Calligraphy Styles</label>
      <div className='space-y-2 max-h-32 overflow-y-auto'>
        {availableFilters.styles.map((style: any) => (
          <label key={style} className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={filters.styles?.includes(style) || false}
              onChange={e => {
                const currentStyles = filters.styles || []
                if (e.target.checked) {
                  updateFilter('styles', [...currentStyles, style])
                } else {
                  updateFilter(
                    'styles',
                    currentStyles.filter((s: any) => s !== style)
                  )
                }
              }}
              className='rounded border-celadon-green/30'
            />
            <span className='text-sm text-ink-black'>{style}</span>
          </label>
        ))}
      </div>
    </div>

    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Techniques</label>
      <div className='space-y-2 max-h-32 overflow-y-auto'>
        {availableFilters.techniques.map((technique: any) => (
          <label key={technique} className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={filters.techniques?.includes(technique) || false}
              onChange={e => {
                const currentTechniques = filters.techniques || []
                if (e.target.checked) {
                  updateFilter('techniques', [...currentTechniques, technique])
                } else {
                  updateFilter(
                    'techniques',
                    currentTechniques.filter((t: any) => t !== technique)
                  )
                }
              }}
              className='rounded border-celadon-green/30'
            />
            <span className='text-sm text-ink-black'>{technique}</span>
          </label>
        ))}
      </div>
    </div>

    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Medium</label>
      <select
        multiple
        value={filters.mediums || []}
        onChange={e => {
          const values = Array.from(e.target.selectedOptions, option => option.value)
          updateFilter('mediums', values)
        }}
        className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20'
      >
        {availableFilters.mediums.map((medium: any) => (
          <option key={medium} value={medium}>
            {medium}
          </option>
        ))}
      </select>
    </div>
  </div>
)
