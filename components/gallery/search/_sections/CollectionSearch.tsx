export const CollectionSearch = ({ filters, updateFilter, availableFilters }: any) => (
  <div className='space-y-4'>
    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Collections</label>
      <select
        multiple
        value={filters.collection_ids || []}
        onChange={e => {
          const values = Array.from(e.target.selectedOptions, option => option.value)
          updateFilter('collection_ids', values)
        }}
        className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-24'
      >
        {availableFilters.collections.map((collection: any) => (
          <option key={collection.id} value={collection.id}>
            {collection.name}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Exhibition History</label>
      <select
        multiple
        value={filters.exhibition_ids || []}
        onChange={e => {
          const values = Array.from(e.target.selectedOptions, option => option.value)
          updateFilter('exhibition_ids', values)
        }}
        className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20'
      >
        <option value='palace_museum_2023'>Palace Museum 2023</option>
        <option value='met_masters_2022'>Metropolitan Museum Masters 2022</option>
        <option value='national_gallery_2021'>National Gallery 2021</option>
      </select>
    </div>

    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Curator Selections</label>
      <select
        multiple
        value={filters.curator_selections || []}
        onChange={e => {
          const values = Array.from(e.target.selectedOptions, option => option.value)
          updateFilter('curator_selections', values)
        }}
        className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20'
      >
        <option value='masterpieces'>Masterpieces</option>
        <option value='educational'>Educational Highlights</option>
        <option value='rare_finds'>Rare Discoveries</option>
        <option value='contemporary'>Contemporary Masters</option>
      </select>
    </div>
  </div>
)
