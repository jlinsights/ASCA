export const CulturalSearch = ({ filters, updateFilter, availableFilters }: any) => (
  <div className='space-y-4'>
    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>School/Lineage</label>
      <select
        multiple
        value={filters.school || []}
        onChange={e => {
          const values = Array.from(e.target.selectedOptions, option => option.value)
          updateFilter('school', values)
        }}
        className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20'
      >
        <option value='imperial'>Imperial Court</option>
        <option value='scholar'>Scholar Tradition</option>
        <option value='monk'>Monastery</option>
        <option value='folk'>Folk Tradition</option>
        <option value='modern'>Modern School</option>
      </select>
    </div>

    <div>
      <label className='block text-sm font-medium text-ink-black mb-2'>Lineage</label>
      <select
        multiple
        value={filters.lineage || []}
        onChange={e => {
          const values = Array.from(e.target.selectedOptions, option => option.value)
          updateFilter('lineage', values)
        }}
        className='w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20'
      >
        <option value='wang_xizhi'>Wang Xizhi Lineage</option>
        <option value='yan_zhenqing'>Yan Zhenqing Lineage</option>
        <option value='zhao_mengfu'>Zhao Mengfu Lineage</option>
        <option value='dong_qichang'>Dong Qichang School</option>
      </select>
    </div>
  </div>
)
