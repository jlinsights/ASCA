import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Eye, MoreHorizontal, Plus } from 'lucide-react'

export const CollectionsTab = ({ collections }: any) => {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg'>Collections ({collections.length})</CardTitle>
            <Button size='sm' className='bg-temple-gold text-ink-black hover:bg-temple-gold/80'>
              <Plus className='w-4 h-4 mr-1' />
              Create Collection
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {collections.map((collection: any) => (
              <Card key={collection.id} className='hover:shadow-lg transition-shadow duration-200'>
                <CardContent className='p-6'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <h4 className='font-calligraphy font-semibold text-ink-black mb-2'>
                        {collection.title}
                      </h4>
                      <p className='text-sm text-ink-black/70 line-clamp-2'>
                        {collection.description}
                      </p>
                    </div>
                    <Badge variant='outline' className='text-xs'>
                      {collection.metadata.visibility}
                    </Badge>
                  </div>

                  <div className='space-y-2 mb-4'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-ink-black/70'>Artworks:</span>
                      <span className='font-medium'>{collection.artworks.length}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-ink-black/70'>Views:</span>
                      <span className='font-medium'>{collection.metadata.view_count}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-ink-black/70'>Curator:</span>
                      <span className='font-medium'>{collection.curator.name}</span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button size='sm' variant='outline' className='flex-1'>
                      <Edit className='w-3 h-3 mr-1' />
                      Edit
                    </Button>
                    <Button size='sm' variant='outline' className='flex-1'>
                      <Eye className='w-3 h-3 mr-1' />
                      View
                    </Button>
                    <Button size='sm' variant='outline' className='h-8 w-8 p-0'>
                      <MoreHorizontal className='w-3 h-3' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
