'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { GalleryItem } from '@/lib/types/gallery/gallery-legacy'
import {
  shareToKakao,
  shareToFacebook,
  shareToInstagram,
  shareToTwitter,
  copyLink,
  shareNative,
  getAbsoluteUrl,
  getHighQualityImageUrl,
} from '@/lib/utils/sns-share'

interface SocialShareProps {
  item: GalleryItem
  isOpen: boolean
  onClose: () => void
  className?: string
}

export default function SocialShare({ item, isOpen, onClose, className = '' }: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // 공유 데이터 준비 (고화질 이미지 사용)
  const shareData = {
    title: `${item.title} - 동양서예협회`,
    description: item.description,
    imageUrl: getHighQualityImageUrl(item.src, 1920, 95), // 고화질 이미지
    url: getAbsoluteUrl(`/gallery?image=${item.id}`),
    hashtags: ['동양서예협회', '서예', '전통예술', ...item.tags.slice(0, 3)],
  }

  // SNS 공유 핸들러들
  const handleKakaoShare = () => {
    setIsSharing(true)
    shareToKakao(shareData)
    setTimeout(() => setIsSharing(false), 1000)
  }

  const handleFacebookShare = () => {
    setIsSharing(true)
    shareToFacebook(shareData)
    setTimeout(() => setIsSharing(false), 1000)
  }

  const handleInstagramShare = () => {
    setIsSharing(true)
    shareToInstagram(shareData)
    setTimeout(() => setIsSharing(false), 2000)
  }

  const handleTwitterShare = () => {
    setIsSharing(true)
    shareToTwitter(shareData)
    setTimeout(() => setIsSharing(false), 1000)
  }

  const handleCopyLink = () => {
    copyLink(shareData.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = async () => {
    setIsSharing(true)
    const success = await shareNative(shareData)
    if (!success) {
      // 네이티브 공유 실패시 링크 복사로 폴백
      handleCopyLink()
    }
    setTimeout(() => setIsSharing(false), 1000)
  }

  const shareButtons = [
    {
      id: 'kakao',
      name: '카카오톡',
      icon: '💬',
      color: 'bg-yellow-400 hover:bg-yellow-500',
      textColor: 'text-yellow-900',
      onClick: handleKakaoShare,
    },
    {
      id: 'facebook',
      name: '페이스북',
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white',
      onClick: handleFacebookShare,
    },
    {
      id: 'instagram',
      name: '인스타그램',
      icon: '📸',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      textColor: 'text-white',
      onClick: handleInstagramShare,
    },
    {
      id: 'twitter',
      name: '트위터',
      icon: '🐦',
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white',
      onClick: handleTwitterShare,
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`social-share ${className}`}
        >
          {/* 메인 공유 컨테이너 */}
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-80 max-w-sm mx-auto'>
            {/* 헤더 */}
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>작품 공유하기</h3>
              <button
                onClick={onClose}
                className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                aria-label='닫기'
              >
                ✕
              </button>
            </div>

            {/* 작품 미리보기 */}
            <div className='flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg'>
              <div className='relative w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0'>
                <Image src={item.src} alt={item.title} fill sizes='48px' className='object-cover' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='font-medium text-gray-900 text-sm truncate'>{item.title}</p>
                <p className='text-gray-500 text-xs truncate'>{item.description}</p>
              </div>
            </div>

            {/* SNS 버튼들 */}
            <div className='space-y-3 mb-4'>
              <div className='grid grid-cols-2 gap-3'>
                {shareButtons.map(button => (
                  <motion.button
                    key={button.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={button.onClick}
                    disabled={isSharing}
                    className={`
                      ${button.color} ${button.textColor}
                      flex items-center justify-center space-x-2 
                      py-3 px-4 rounded-xl font-medium text-sm
                      transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      shadow-sm hover:shadow-md
                    `}
                  >
                    <span className='text-lg'>{button.icon}</span>
                    <span>{button.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 구분선 */}
            <div className='border-t border-gray-200 my-4'></div>

            {/* 추가 공유 옵션 */}
            <div className='space-y-2'>
              {/* 네이티브 공유 (모바일에서만 표시) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleNativeShare}
                  disabled={isSharing}
                  className='w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm text-gray-700 transition-colors'
                >
                  <span>📤</span>
                  <span>기본 공유</span>
                </motion.button>
              )}

              {/* 링크 복사 */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCopyLink}
                className={`
                  w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium text-sm transition-all
                  ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                <span>{copied ? '✅' : '🔗'}</span>
                <span>{copied ? '링크 복사됨!' : '링크 복사'}</span>
              </motion.button>
            </div>

            {/* 로딩 상태 */}
            {isSharing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='absolute inset-0 bg-white bg-opacity-90 rounded-2xl flex items-center justify-center'
              >
                <div className='flex items-center space-x-2 text-gray-600'>
                  <div className='animate-spin w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full'></div>
                  <span className='text-sm'>공유 중...</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
