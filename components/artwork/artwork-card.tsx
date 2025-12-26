'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Heart, 
  Edit, 
  Trash2, 
  MoreVertical,
  ExternalLink,
  Star
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Artwork } from '@/types/artwork'
import { ARTWORK_CATEGORY_LABELS, ARTWORK_STATUS_LABELS } from '@/types/artwork'

interface ArtworkCardProps {
  artwork: Artwork
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onToggleFeatured?: (id: string) => void
  showActions?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

export function ArtworkCard({
  artwork,
  onEdit,
  onDelete,
  onToggleFeatured,
  showActions = false,
  variant = 'default'
}: ArtworkCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const categoryLabel = ARTWORK_CATEGORY_LABELS[artwork.category]?.ko || artwork.category
  const statusInfo = ARTWORK_STATUS_LABELS[artwork.status]
  
  const mainImage = artwork.images.main
  
  return (
    <Card className="group overflow-hidden border border-celadon-green/20 hover:border-celadon-green/40 transition-all duration-300 hover:shadow-lg bg-rice-paper dark:bg-card">
      <CardHeader className="p-0 relative">
        {/* 작품 이미지 */}
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-gray/10">
          <Image
            src={mainImage.url}
            alt={mainImage.alt || artwork.title}
            fill
            className={`object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoadingComplete={() => setImageLoaded(true)}
          />
          
          {/* 상태 배지 */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={`${statusInfo.color} text-white`}>
              {statusInfo.ko}
            </Badge>
            {artwork.isFeatured && (
              <Badge className="bg-temple-gold text-ink-black">
                <Star className="w-3 h-3 mr-1" />
                대표작
              </Badge>
            )}
          </div>
          
          {/* 통계 (호버 시 표시) */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {artwork.views !== undefined && artwork.views > 0 && (
              <div className="bg-ink-black/70 backdrop-blur-sm text-rice-paper px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {artwork.views}
              </div>
            )}
            {artwork.likes !== undefined && artwork.likes > 0 && (
              <div className="bg-ink-black/70 backdrop-blur-sm text-rice-paper px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {artwork.likes}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* 카테고리 */}
        <Badge variant="outline" className="mb-2 text-xs border-celadon-green/30 text-celadon-green">
          {categoryLabel}
        </Badge>
        
        {/* 제목 */}
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1 line-clamp-1">
          {artwork.title}
        </h3>
        
        {/* 영문 제목 (있는 경우) */}
        {artwork.titleEn && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
            {artwork.titleEn}
          </p>
        )}
        
        {/* 설명 */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {artwork.description}
        </p>
        
        {/* 작품 정보 */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>재료/기법:</span>
            <span className="font-medium text-foreground">{artwork.medium}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>크기:</span>
            <span className="font-medium text-foreground">
              {artwork.dimensions.width} × {artwork.dimensions.height}
              {artwork.dimensions.depth && ` × ${artwork.dimensions.depth}`}
              {artwork.dimensions.unit}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>제작연도:</span>
            <span className="font-medium text-foreground">{artwork.yearCreated}</span>
          </div>
          
          {/* 가격 정보 */}
          {artwork.isForSale && artwork.price && (
            <div className="flex items-center justify-between pt-2 border-t border-celadon-green/10">
              <span className="text-scholar-red font-medium">판매가:</span>
              <span className="font-serif font-bold text-scholar-red">
                ₩{artwork.price.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        
        {/* 태그 */}
        {artwork.tags && artwork.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {artwork.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {artwork.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{artwork.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        {/* 상세보기 버튼 */}
        <Button 
          asChild 
          variant="ghost" 
          size="sm"
          className="text-celadon-green hover:text-celadon-green/80"
        >
          <Link href={`/artworks/${artwork.id}`}>
            상세보기
            <ExternalLink className="w-3 h-3 ml-1" />
          </Link>
        </Button>
        
        {/* 액션 메뉴 (작가 본인만) */}
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(artwork.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  수정
                </DropdownMenuItem>
              )}
              {onToggleFeatured && (
                <DropdownMenuItem onClick={() => onToggleFeatured(artwork.id)}>
                  <Star className="w-4 h-4 mr-2" />
                  {artwork.isFeatured ? '대표작 해제' : '대표작 설정'}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(artwork.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardFooter>
    </Card>
  )
}
