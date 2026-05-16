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
import type { ArtworkStatus } from '@/lib/types/artwork-legacy'
import type { ArtworkSectionProps } from './types'

export function ArtworkExtraSection({ formData, setFormData }: ArtworkSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='font-serif'>추가 정보</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='tags'>태그</Label>
          <Input
            id='tags'
            value={formData.tags}
            onChange={e => setFormData({ ...formData, tags: e.target.value })}
            placeholder='태그를 쉼표로 구분하여 입력하세요'
          />
          <p className='text-xs text-muted-foreground'>예: 서예, 전통, 현대적</p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='status'>공개 상태</Label>
          <Select
            value={formData.status}
            onValueChange={value => setFormData({ ...formData, status: value as ArtworkStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='draft'>임시저장</SelectItem>
              <SelectItem value='published'>공개</SelectItem>
              <SelectItem value='archived'>보관</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
