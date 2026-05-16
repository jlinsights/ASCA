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
import type { ArtworkSectionProps } from './types'

export function ArtworkSaleSection({ formData, setFormData }: ArtworkSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='font-serif'>판매 정보</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <input
            type='checkbox'
            id='isForSale'
            checked={formData.isForSale}
            onChange={e => setFormData({ ...formData, isForSale: e.target.checked })}
            className='rounded'
          />
          <Label htmlFor='isForSale'>판매 가능</Label>
        </div>

        {formData.isForSale && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='price'>가격</Label>
              <Input
                id='price'
                type='number'
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder='0'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='currency'>통화</Label>
              <Select
                value={formData.currency}
                onValueChange={value => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='KRW'>KRW (원)</SelectItem>
                  <SelectItem value='USD'>USD ($)</SelectItem>
                  <SelectItem value='EUR'>EUR (€)</SelectItem>
                  <SelectItem value='JPY'>JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
