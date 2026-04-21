const fs = require('fs');

function refactorSearch() {
  const src = fs.readFileSync('components/gallery/AdvancedGallerySearch.tsx', 'utf8');
  fs.mkdirSync('components/gallery/search', { recursive: true });

  // 1. Extract ArtworkCard
  const artworkCardStart = src.indexOf('const ArtworkCard: React.FC');
  const artworkCardEnd = src.lastIndexOf('export default AdvancedGallerySearch;');
  const artworkCardBody = src.substring(artworkCardStart, artworkCardEnd).trim();

  fs.writeFileSync('components/gallery/search/ArtworkCard.tsx', `
import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import type { Artwork } from '@/lib/types/gallery';

${artworkCardBody}
`);

  // 2. Extract render functions into GalleryFilterSections.tsx
  const renderersStart = src.indexOf('const renderBasicSearch');
  const renderersEnd = src.indexOf('const renderActiveFilters');
  
  let renderersCode = src.substring(renderersStart, renderersEnd);
  
  // Replace `const renderName = () =>` with `export const Name = ({ filters, updateFilter, availableFilters }: any) => `
  const sections = ['BasicSearch', 'PeriodSearch', 'StyleSearch', 'TechnicalSearch', 'PhysicalSearch', 'CulturalSearch', 'CollectionSearch'];
  
  for (const name of sections) {
    renderersCode = renderersCode.replace(
      new RegExp(`const render${name} = \\(\\) => \\(`, 'g'), 
      `export const ${name} = ({ filters, updateFilter, availableFilters }: any) => (`
    );
  }

  // Extract renderFilterSection
  renderersCode = renderersCode.replace(
    /const renderFilterSection = \(section: FilterSection\) => {/,
    'export const FilterSectionWrapper = ({ section, expandedSections, toggleSection, filters, updateFilter, availableFilters }: any) => {'
  );
  
  // Replace calls to render inside it
  for (const name of sections) {
    renderersCode = renderersCode.replace(
      new RegExp(`render${name}\\(\\)`, 'g'),
      `<${name} filters={filters} updateFilter={updateFilter} availableFilters={availableFilters} />`
    );
  }

  fs.writeFileSync('components/gallery/search/GalleryFilterSections.tsx', `
import React from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

${renderersCode}
`);

  // 3. Update main file
  let newSrc = src.substring(0, renderersStart) + src.substring(renderersEnd);
  
  // Remove ArtworkCard from main file
  newSrc = newSrc.replace(artworkCardBody, '');
  
  // Add imports
  const imports = `import { BasicSearch, PeriodSearch, StyleSearch, TechnicalSearch, PhysicalSearch, CulturalSearch, CollectionSearch, FilterSectionWrapper } from './search/GalleryFilterSections';
import ArtworkCard from './search/ArtworkCard';\n`;
  newSrc = newSrc.replace('import Image from \'next/image\';', imports + 'import Image from \'next/image\';');
  
  // Fix React calls in main file
  newSrc = newSrc.replace(/renderFilterSection/g, '(section) => <FilterSectionWrapper key={section.id} section={section} expandedSections={expandedSections} toggleSection={toggleSection} filters={filters} updateFilter={updateFilter} availableFilters={availableFilters} />');

  // Fix ArtworkCard missing export
  const newArtworkCard = fs.readFileSync('components/gallery/search/ArtworkCard.tsx', 'utf8');
  fs.writeFileSync('components/gallery/search/ArtworkCard.tsx', newArtworkCard + '\nexport default ArtworkCard;\n');
  
  fs.writeFileSync('components/gallery/AdvancedGallerySearch.tsx', newSrc);
  console.log('Successfully extracted Gallery Filters and ArtworkCard!');
}

refactorSearch();
