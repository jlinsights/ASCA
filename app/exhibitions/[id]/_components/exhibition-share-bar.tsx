'use client'

import { Facebook, Twitter, Instagram, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExhibitionShareBarProps {
  title: string
  url?: string
}

export function ExhibitionShareBar({ title, url }: ExhibitionShareBarProps) {
  const shareUrl =
    url ?? (typeof window === 'object' ? window.location.href : '')

  const handle = async (platform: 'facebook' | 'twitter' | 'instagram' | 'copy') => {
    if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        '_blank'
      )
    } else if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
        '_blank'
      )
    } else if (platform === 'instagram') {
      try {
        await navigator.clipboard.writeText(shareUrl)
        window.open('https://www.instagram.com', '_blank')
        alert('인스타그램이 새 창에서 열렸습니다. 링크가 복사되었으니 게시물이나 스토리에 붙여넣어 공유해보세요!')
      } catch {
        alert('링크 복사에 실패했습니다.')
      }
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('링크가 복사되었습니다.')
      } catch {
        alert('링크 복사에 실패했습니다.')
      }
    }
  }

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="전시 공유">
      <Button variant="outline" size="sm" aria-label="Facebook" onClick={() => handle('facebook')}>
        <Facebook className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" aria-label="Twitter" onClick={() => handle('twitter')}>
        <Twitter className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" aria-label="Instagram" onClick={() => handle('instagram')}>
        <Instagram className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" aria-label="Copy link" onClick={() => handle('copy')}>
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
