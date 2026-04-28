import { Loader2 } from 'lucide-react'

export function ExhibitionLoading() {
  return (
    <div
      role='status'
      aria-live='polite'
      className='min-h-[60vh] bg-rice-paper grid place-items-center'
    >
      <div className='flex flex-col items-center gap-4 text-muted-foreground'>
        <Loader2 className='h-8 w-8 animate-spin text-celadon-green motion-reduce:animate-none' />
        <p className='font-serif text-lg'>전시를 불러오는 중...</p>
      </div>
    </div>
  )
}
