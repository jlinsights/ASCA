export const TechnicalSearch = ({ filters, updateFilter, availableFilters }: any) => (
  <div className='space-y-4'>
    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Image Quality</label>
      <select
        value={filters.image_quality || ''}
        onChange={e => updateFilter('image_quality', e.target.value || undefined)}
        className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm'
      >
        <option value=''>Any Quality</option>
        <option value='thumbnail'>Thumbnail</option>
        <option value='small'>Small</option>
        <option value='medium'>Medium</option>
        <option value='large'>Large</option>
        <option value='original'>Original Resolution</option>
      </select>
    </div>

    <div className='space-y-2'>
      <label className='flex items-center gap-2'>
        <input
          type='checkbox'
          checked={filters.has_annotations || false}
          onChange={e => updateFilter('has_annotations', e.target.checked)}
          className='rounded border-celadon-green/30'
        />
        <span className='text-sm text-ink-black'>Has Annotations</span>
      </label>

      <label className='flex items-center gap-2'>
        <input
          type='checkbox'
          checked={filters.has_stroke_analysis || false}
          onChange={e => updateFilter('has_stroke_analysis', e.target.checked)}
          className='rounded border-celadon-green/30'
        />
        <span className='text-sm text-ink-black'>Has Stroke Analysis</span>
      </label>

      <label className='flex items-center gap-2'>
        <input
          type='checkbox'
          checked={filters.has_educational_content || false}
          onChange={e => updateFilter('has_educational_content', e.target.checked)}
          className='rounded border-celadon-green/30'
        />
        <span className='text-sm text-ink-black'>Has Educational Content</span>
      </label>
    </div>
  </div>
)
