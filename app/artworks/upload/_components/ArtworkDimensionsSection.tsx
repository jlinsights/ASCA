import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ArtworkFormData, ArtworkSectionProps } from './types'

export function ArtworkDimensionsSection({ formData, setFormData }: ArtworkSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='font-serif'>크기</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='width'>가로 *</Label>
            <Input
              id='width'
              type='number'
              value={formData.width}
              onChange={e => setFormData({ ...formData, width: e.target.value })}
              placeholder='0'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='height'>세로 *</Label>
            <Input
              id='height'
              type='number'
              value={formData.height}
              onChange={e => setFormData({ ...formData, height: e.target.value })}
              placeholder='0'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='depth'>두께</Label>
            <Input
              id='depth'
              type='number'
              value={formData.depth}
              onChange={e => setFormData({ ...formData, depth: e.target.value })}
              placeholder='0'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='unit'>단위</Label>
            <Select
              value={formData.unit}
              onValueChange={value =>
                setFormData({ ...formData, unit: value as ArtworkFormData['unit'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='cm'>cm</SelectItem>
                <SelectItem value='mm'>mm</SelectItem>
                <SelectItem value='inch'>inch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
