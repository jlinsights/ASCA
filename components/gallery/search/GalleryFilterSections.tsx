
import React from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

export const BasicSearch = ({ filters, updateFilter, availableFilters }: any) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Search Text</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-black/40" />
          <Input
            type="text"
            placeholder="Search by title, artist, description..."
            value={filters.text_search || ''}
            onChange={(e) => updateFilter('text_search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Artists</label>
        <select
          multiple
          value={filters.artist_ids || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('artist_ids', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-24"
        >
          {availableFilters.artists.map((artist: any) => (
            <option key={artist.id} value={artist.id}>
              {artist.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-ink-black/60 mt-1">Hold Ctrl/Cmd to select multiple</p>
      </div>
    </div>
  );

  export const PeriodSearch = ({ filters, updateFilter, availableFilters }: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-black mb-2">Start Year</label>
          <Input
            type="number"
            placeholder="e.g., 1000"
            value={filters.creation_date?.start_date ? new Date(filters.creation_date.start_date).getFullYear() : ''}
            onChange={(e) => {
              const year = parseInt(e.target.value);
              if (!isNaN(year)) {
                updateFilter('creation_date', {
                  ...filters.creation_date,
                  start_date: new Date(year, 0, 1)
                });
              }
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-black mb-2">End Year</label>
          <Input
            type="number"
            placeholder="e.g., 1500"
            value={filters.creation_date?.end_date ? new Date(filters.creation_date.end_date).getFullYear() : ''}
            onChange={(e) => {
              const year = parseInt(e.target.value);
              if (!isNaN(year)) {
                updateFilter('creation_date', {
                  ...filters.creation_date,
                  end_date: new Date(year, 11, 31)
                });
              }
            }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Dynasty</label>
        <select
          multiple
          value={filters.dynasty || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('dynasty', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          {availableFilters.dynasties.map((dynasty: any) => (
            <option key={dynasty} value={dynasty}>
              {dynasty}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Region</label>
        <select
          multiple
          value={filters.region || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('region', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          {availableFilters.regions.map((region: any) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  export const StyleSearch = ({ filters, updateFilter, availableFilters }: any) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Calligraphy Styles</label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {availableFilters.styles.map((style: any) => (
            <label key={style} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.styles?.includes(style) || false}
                onChange={(e) => {
                  const currentStyles = filters.styles || [];
                  if (e.target.checked) {
                    updateFilter('styles', [...currentStyles, style]);
                  } else {
                    updateFilter('styles', currentStyles.filter((s: any) => s !== style));
                  }
                }}
                className="rounded border-celadon-green/30"
              />
              <span className="text-sm text-ink-black">{style}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Techniques</label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {availableFilters.techniques.map((technique: any) => (
            <label key={technique} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.techniques?.includes(technique) || false}
                onChange={(e) => {
                  const currentTechniques = filters.techniques || [];
                  if (e.target.checked) {
                    updateFilter('techniques', [...currentTechniques, technique]);
                  } else {
                    updateFilter('techniques', currentTechniques.filter((t: any) => t !== technique));
                  }
                }}
                className="rounded border-celadon-green/30"
              />
              <span className="text-sm text-ink-black">{technique}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Medium</label>
        <select
          multiple
          value={filters.mediums || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('mediums', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          {availableFilters.mediums.map((medium: any) => (
            <option key={medium} value={medium}>
              {medium}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  export const TechnicalSearch = ({ filters, updateFilter, availableFilters }: any) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Image Quality</label>
        <select
          value={filters.image_quality || ''}
          onChange={(e) => updateFilter('image_quality', e.target.value || undefined)}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm"
        >
          <option value="">Any Quality</option>
          <option value="thumbnail">Thumbnail</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="original">Original Resolution</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.has_annotations || false}
            onChange={(e) => updateFilter('has_annotations', e.target.checked)}
            className="rounded border-celadon-green/30"
          />
          <span className="text-sm text-ink-black">Has Annotations</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.has_stroke_analysis || false}
            onChange={(e) => updateFilter('has_stroke_analysis', e.target.checked)}
            className="rounded border-celadon-green/30"
          />
          <span className="text-sm text-ink-black">Has Stroke Analysis</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.has_educational_content || false}
            onChange={(e) => updateFilter('has_educational_content', e.target.checked)}
            className="rounded border-celadon-green/30"
          />
          <span className="text-sm text-ink-black">Has Educational Content</span>
        </label>
      </div>
    </div>
  );

  export const PhysicalSearch = ({ filters, updateFilter, availableFilters }: any) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Dimensions (cm)</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="number"
              placeholder="Min Width"
              value={filters.dimensions?.min_width || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateFilter('dimensions', {
                  ...filters.dimensions,
                  min_width: isNaN(value) ? undefined : value
                });
              }}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Max Width"
              value={filters.dimensions?.max_width || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateFilter('dimensions', {
                  ...filters.dimensions,
                  max_width: isNaN(value) ? undefined : value
                });
              }}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Min Height"
              value={filters.dimensions?.min_height || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateFilter('dimensions', {
                  ...filters.dimensions,
                  min_height: isNaN(value) ? undefined : value
                });
              }}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Max Height"
              value={filters.dimensions?.max_height || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateFilter('dimensions', {
                  ...filters.dimensions,
                  max_height: isNaN(value) ? undefined : value
                });
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Condition</label>
        <select
          multiple
          value={filters.condition || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('condition', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          <option value="excellent">Excellent</option>
          <option value="very_good">Very Good</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.provenance_verified || false}
            onChange={(e) => updateFilter('provenance_verified', e.target.checked)}
            className="rounded border-celadon-green/30"
          />
          <span className="text-sm text-ink-black">Verified Provenance</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.exhibition_history || false}
            onChange={(e) => updateFilter('exhibition_history', e.target.checked)}
            className="rounded border-celadon-green/30"
          />
          <span className="text-sm text-ink-black">Has Exhibition History</span>
        </label>
      </div>
    </div>
  );

  export const CulturalSearch = ({ filters, updateFilter, availableFilters }: any) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">School/Lineage</label>
        <select
          multiple
          value={filters.school || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('school', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          <option value="imperial">Imperial Court</option>
          <option value="scholar">Scholar Tradition</option>
          <option value="monk">Monastery</option>
          <option value="folk">Folk Tradition</option>
          <option value="modern">Modern School</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Lineage</label>
        <select
          multiple
          value={filters.lineage || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('lineage', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          <option value="wang_xizhi">Wang Xizhi Lineage</option>
          <option value="yan_zhenqing">Yan Zhenqing Lineage</option>
          <option value="zhao_mengfu">Zhao Mengfu Lineage</option>
          <option value="dong_qichang">Dong Qichang School</option>
        </select>
      </div>
    </div>
  );

  export const CollectionSearch = ({ filters, updateFilter, availableFilters }: any) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Collections</label>
        <select
          multiple
          value={filters.collection_ids || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('collection_ids', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-24"
        >
          {availableFilters.collections.map((collection: any) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Exhibition History</label>
        <select
          multiple
          value={filters.exhibition_ids || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('exhibition_ids', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          <option value="palace_museum_2023">Palace Museum 2023</option>
          <option value="met_masters_2022">Metropolitan Museum Masters 2022</option>
          <option value="national_gallery_2021">National Gallery 2021</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Curator Selections</label>
        <select
          multiple
          value={filters.curator_selections || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('curator_selections', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          <option value="masterpieces">Masterpieces</option>
          <option value="educational">Educational Highlights</option>
          <option value="rare_finds">Rare Discoveries</option>
          <option value="contemporary">Contemporary Masters</option>
        </select>
      </div>
    </div>
  );

  export const FilterSectionWrapper = ({ section, expandedSections, toggleSection, filters, updateFilter, availableFilters }: any) => {
    const isExpanded = expandedSections.has(section.id);
    const Icon = section.icon;

    return (
      <Card key={section.id} className="border-celadon-green/20">
        <CardHeader 
          className="pb-3 cursor-pointer hover:bg-silk-cream/30 transition-colors"
          onClick={() => toggleSection(section.id)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Icon className="w-4 h-4 text-celadon-green" />
              {section.title}
            </CardTitle>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-ink-black/60" />
            ) : (
              <ChevronDown className="w-4 h-4 text-ink-black/60" />
            )}
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            {section.id === 'basic' && <BasicSearch filters={filters} updateFilter={updateFilter} availableFilters={availableFilters} />}
            {section.id === 'period' && <PeriodSearch filters={filters} updateFilter={updateFilter} availableFilters={availableFilters} />}
            {section.id === 'style' && <StyleSearch filters={filters} updateFilter={updateFilter} availableFilters={availableFilters} />}
            {section.id === 'technical' && <TechnicalSearch filters={filters} updateFilter={updateFilter} availableFilters={availableFilters} />}
            {section.id === 'physical' && <PhysicalSearch filters={filters} updateFilter={updateFilter} availableFilters={availableFilters} />}
            {section.id === 'cultural' && <CulturalSearch filters={filters} updateFilter={updateFilter} availableFilters={availableFilters} />}
            {section.id === 'collection' && <CollectionSearch filters={filters} updateFilter={updateFilter} availableFilters={availableFilters} />}
          </CardContent>
        )}
      </Card>
    );
  };

  
