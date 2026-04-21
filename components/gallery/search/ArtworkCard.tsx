
import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import type { Artwork } from '@/lib/types/gallery';

const ArtworkCard: React.FC<{ 
  artwork: Artwork; 
  viewMode: 'grid' | 'list' 
}> = ({ artwork, viewMode }) => {
  const primaryImage = artwork.images.find(img => img.type === 'primary') || artwork.images[0];

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <div className="flex">
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={primaryImage?.urls.small || '/placeholder-artwork.jpg'}
              alt={artwork.title.english}
              fill
              sizes="96px"
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
          <CardContent className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-calligraphy font-semibold text-ink-black mb-1">
                  {artwork.title.original}
                </h3>
                <p className="text-sm text-ink-black/70 mb-1">{artwork.title.english}</p>
                <p className="text-sm text-ink-black/60">{artwork.artist.name}</p>
                {artwork.historical_context.creation_date.period && (
                  <p className="text-xs text-ink-black/50">
                    {artwork.historical_context.creation_date.period}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className="text-xs">{artwork.artistic_analysis.style.name.english}</Badge>
                <div className="flex items-center gap-1 text-xs text-ink-black/60">
                  <Clock className="w-3 h-3" />
                  <span>{artwork.physical_details.dimensions.width} × {artwork.physical_details.dimensions.height} cm</span>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={primaryImage?.urls.medium || '/placeholder-artwork.jpg'}
          alt={artwork.title.english}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-calligraphy font-semibold text-ink-black mb-2 line-clamp-1">
          {artwork.title.original}
        </h3>
        <p className="text-sm text-ink-black/70 mb-1 line-clamp-1">{artwork.title.english}</p>
        <p className="text-sm text-ink-black/60 mb-3">{artwork.artist.name}</p>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {artwork.artistic_analysis.style.name.english}
          </Badge>
          <div className="text-xs text-ink-black/60">
            {artwork.physical_details.dimensions.width} × {artwork.physical_details.dimensions.height} cm
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtworkCard;
