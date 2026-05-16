import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ARTWORK_CATEGORY_LABELS } from '@/lib/types/artwork-legacy'
import type { ArtworkCategory } from '@/lib/types/artwork-legacy'
import type { ArtworkSectionProps } from './types'

export function ArtworkBasicInfoSection({ formData, setFormData }: ArtworkSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='font-serif'>기본 정보</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Title */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>작품명 (한글) *</Label>
            <Input
              id='title'
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder='예: 춘하추동'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='titleEn'>작품명 (영문)</Label>
            <Input
              id='titleEn'
              value={formData.titleEn}
              onChange={e => setFormData({ ...formData, titleEn: e.target.value })}
              placeholder='예: Four Seasons'
            />
          </div>
        </div>

        {/* Description */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='description'>작품 설명 (한글) *</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder='작품에 대한 설명을 입력하세요'
              rows={4}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='descriptionEn'>작품 설명 (영문)</Label>
            <Textarea
              id='descriptionEn'
              value={formData.descriptionEn}
              onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
              placeholder='Artwork description in English'
              rows={4}
            />
          </div>
        </div>

        {/* Category and Medium */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='category'>카테고리 *</Label>
            <Select
              value={formData.category}
              onValueChange={value =>
                setFormData({ ...formData, category: value as ArtworkCategory })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='카테고리 선택' />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ARTWORK_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label.ko}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='medium'>재료/기법 *</Label>
            <Input
              id='medium'
              value={formData.medium}
              onChange={e => setFormData({ ...formData, medium: e.target.value })}
              placeholder='예: 한지에 먹'
              required
            />
          </div>
        </div>

        {/* Year */}
        <div className='space-y-2'>
          <Label htmlFor='year'>제작연도 *</Label>
          <Input
            id='year'
            type='number'
            value={formData.yearCreated}
            onChange={e => setFormData({ ...formData, yearCreated: parseInt(e.target.value) })}
            min='1900'
            max={new Date().getFullYear()}
            required
          />
        </div>
      </CardContent>
    </Card>
  )
}
