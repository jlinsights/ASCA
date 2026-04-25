import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Image as ImageIcon,
  FileText,
  Eye,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Plus,
  Globe,
} from 'lucide-react'
import type { Artwork } from '@/lib/types/gallery'

export const OverviewTab = ({ galleryStats, expandedSections, toggleSection, artworks }: any) => {
  return (
    <div className='space-y-6'>
      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='border-celadon-green/20'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-ink-black/70'>Total Artworks</p>
                <p className='text-2xl font-bold text-ink-black'>{galleryStats.total_artworks}</p>
              </div>
              <ImageIcon className='w-8 h-8 text-celadon-green' />
            </div>
            <div className='mt-4 flex items-center gap-2'>
              <Badge variant='outline' className='text-xs'>
                {galleryStats.published_artworks} published
              </Badge>
              <Badge variant='outline' className='text-xs'>
                {galleryStats.draft_artworks} drafts
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className='border-temple-gold/20'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-ink-black/70'>Collections</p>
                <p className='text-2xl font-bold text-ink-black'>
                  {galleryStats.total_collections}
                </p>
              </div>
              <FileText className='w-8 h-8 text-temple-gold' />
            </div>
            <div className='mt-4'>
              <Badge variant='outline' className='text-xs'>
                {galleryStats.active_exhibitions} active exhibitions
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className='border-summer-jade/20'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-ink-black/70'>Total Views</p>
                <p className='text-2xl font-bold text-ink-black'>
                  {galleryStats.total_views.toLocaleString()}
                </p>
              </div>
              <Eye className='w-8 h-8 text-summer-jade' />
            </div>
            <div className='mt-4 flex items-center gap-1 text-xs text-summer-jade'>
              <TrendingUp className='w-3 h-3' />
              <span>+{galleryStats.monthly_growth}% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-autumn-gold/20'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-ink-black/70'>Storage Used</p>
                <p className='text-2xl font-bold text-ink-black'>{galleryStats.storage_used}GB</p>
              </div>
              <BarChart3 className='w-8 h-8 text-autumn-gold' />
            </div>
            <div className='mt-4'>
              <div className='w-full bg-ink-black/10 rounded-full h-2'>
                <div
                  className='bg-autumn-gold h-2 rounded-full'
                  style={{
                    width: `${(galleryStats.storage_used / galleryStats.storage_limit) * 100}%`,
                  }}
                />
              </div>
              <p className='text-xs text-ink-black/60 mt-1'>
                {galleryStats.storage_limit - galleryStats.storage_used}GB remaining
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className='cursor-pointer' onClick={() => toggleSection('recent')}>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg'>Recent Activity</CardTitle>
            {expandedSections.has('recent') ? (
              <ChevronDown className='w-4 h-4' />
            ) : (
              <ChevronRight className='w-4 h-4' />
            )}
          </div>
        </CardHeader>
        {expandedSections.has('recent') && (
          <CardContent>
            <div className='space-y-4'>
              {artworks.slice(0, 5).map((artwork: any) => (
                <div
                  key={artwork.id}
                  className='flex items-center gap-4 p-3 bg-silk-cream/30 rounded-lg'
                >
                  <div className='w-12 h-12 bg-celadon-green/20 rounded-lg flex items-center justify-center'>
                    <ImageIcon className='w-6 h-6 text-celadon-green' />
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-medium text-ink-black'>{artwork.title.original}</h4>
                    <p className='text-sm text-ink-black/70'>{artwork.artist.name}</p>
                  </div>
                  <div className='text-right'>
                    <Badge variant='outline' className='text-xs'>
                      {artwork.metadata.status}
                    </Badge>
                    <p className='text-xs text-ink-black/60 mt-1'>
                      {new Date(artwork.metadata.created_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Button className='h-20 flex flex-col gap-2 bg-celadon-green text-ink-black hover:bg-celadon-green/80'>
              <Plus className='w-6 h-6' />
              <span>Add Artwork</span>
            </Button>
            <Button
              variant='outline'
              className='h-20 flex flex-col gap-2 border-temple-gold text-temple-gold hover:bg-temple-gold hover:text-ink-black'
            >
              <FileText className='w-6 h-6' />
              <span>Create Collection</span>
            </Button>
            <Button
              variant='outline'
              className='h-20 flex flex-col gap-2 border-autumn-gold text-autumn-gold hover:bg-autumn-gold hover:text-ink-black'
            >
              <Globe className='w-6 h-6' />
              <span>New Exhibition</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
