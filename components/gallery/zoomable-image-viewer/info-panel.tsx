'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { ArtworkImage } from '@/lib/types/gallery'

interface InfoPanelProps {
  showInfo: boolean
  image: ArtworkImage
  scale: number
}

export function InfoPanel({ showInfo, image, scale }: InfoPanelProps) {
  if (!showInfo) return null

  return (
    <Card className='absolute top-4 right-4 w-80 max-h-96 overflow-auto bg-silk-cream/95 backdrop-blur-sm z-40'>
      <CardContent className='p-4'>
        <h3 className='font-calligraphy font-semibold text-ink-black mb-3'>Image Information</h3>

        <div className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-ink-black/70'>Dimensions:</span>
            <span className='text-ink-black'>
              {image.metadata.dimensions.width} × {image.metadata.dimensions.height}
            </span>
          </div>

          <div className='flex justify-between'>
            <span className='text-ink-black/70'>Format:</span>
            <span className='text-ink-black uppercase'>{image.metadata.format}</span>
          </div>

          <div className='flex justify-between'>
            <span className='text-ink-black/70'>File Size:</span>
            <span className='text-ink-black'>
              {(image.metadata.file_size / (1024 * 1024)).toFixed(1)} MB
            </span>
          </div>

          <div className='flex justify-between'>
            <span className='text-ink-black/70'>DPI:</span>
            <span className='text-ink-black'>{image.metadata.dpi}</span>
          </div>

          <div className='flex justify-between'>
            <span className='text-ink-black/70'>Zoom Level:</span>
            <span className='text-ink-black'>{(scale * 100).toFixed(0)}%</span>
          </div>

          {image.metadata.camera_info && (
            <div className='pt-2 border-t border-ink-black/20'>
              <div className='text-ink-black/70 mb-1'>Camera Information:</div>
              <div className='text-xs space-y-1'>
                <div>
                  {image.metadata.camera_info.make} {image.metadata.camera_info.model}
                </div>
                <div>Lens: {image.metadata.camera_info.lens}</div>
                <div>
                  {image.metadata.camera_info.focal_length}mm, f/
                  {image.metadata.camera_info.aperture},{image.metadata.camera_info.shutter_speed}s,
                  ISO {image.metadata.camera_info.iso}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
