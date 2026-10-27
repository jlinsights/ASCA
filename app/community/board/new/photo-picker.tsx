'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useLanguage } from '@/contexts/language-context'
import {
  PhotoUploadError,
  shrinkPhoto,
  uploadPhoto,
  type PhotoFailure,
} from '@/lib/community/photo-upload'
import { IMAGES_MAX, type ThreadImage } from '@/lib/community/threads'
import { PlusMark } from '../_components/thread-parts'

export interface PickedPhoto {
  key: string
  /** 브라우저에서 줄인 사진의 미리보기(blob:) — 서버 주소가 아니다 */
  preview: string
  image: ThreadImage | null
}

type PickerFailure = PhotoFailure | 'limit'

const FAILURE_KEYS: Record<PickerFailure, string> = {
  unreadable: 'boardPhotoErrorUnreadable',
  tooLarge: 'boardPhotoErrorTooLarge',
  pending: 'boardPhotoErrorPending',
  needName: 'boardNeedName',
  rate: 'boardPhotoErrorRate',
  generic: 'boardPhotoErrorGeneric',
  limit: 'boardPhotoErrorLimit',
}

let nextKey = 0

/** 고른 사진을 한 장씩 줄여 올리고, 올린 순서를 지킨다 */
export function usePhotoPicker() {
  const [photos, setPhotos] = useState<PickedPhoto[]>([])
  const [failure, setFailure] = useState<PickerFailure | null>(null)
  // 고른 순간부터 마지막 사진을 다 올릴 때까지 — 줄이는 중에는 아직 미리보기 칸이 없다
  const [processing, setProcessing] = useState(false)
  const previews = useRef(new Set<string>())

  useEffect(() => {
    const urls = previews.current
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [])

  const add = useCallback(
    async (files: File[]) => {
      setFailure(null)
      const room = IMAGES_MAX - photos.length
      if (files.length > room) setFailure('limit')
      setProcessing(true)
      try {
        for (const file of files.slice(0, Math.max(0, room))) {
          const key = `photo-${nextKey++}`
          try {
            const shrunk = await shrinkPhoto(file)
            const preview = URL.createObjectURL(shrunk)
            previews.current.add(preview)
            setPhotos(current => [...current, { key, preview, image: null }])
            const image = await uploadPhoto(shrunk)
            setPhotos(current => current.map(p => (p.key === key ? { ...p, image } : p)))
          } catch (error) {
            setPhotos(current => current.filter(p => p.key !== key))
            setFailure(error instanceof PhotoUploadError ? error.reason : 'generic')
          }
        }
      } finally {
        setProcessing(false)
      }
    },
    [photos.length]
  )

  const remove = useCallback((key: string) => {
    setPhotos(current => {
      const gone = current.find(p => p.key === key)
      if (gone) {
        URL.revokeObjectURL(gone.preview)
        previews.current.delete(gone.preview)
      }
      return current.filter(p => p.key !== key)
    })
  }, [])

  return {
    photos,
    failure,
    add,
    remove,
    uploading: processing || photos.some(p => !p.image),
    imageIds: photos.flatMap(p => (p.image ? [p.image.id] : [])),
  }
}

interface PhotoPickerProps {
  photos: PickedPhoto[]
  failure: PickerFailure | null
  disabled?: boolean
  onAdd: (files: File[]) => void
  onRemove: (key: string) => void
}

export function PhotoPicker({ photos, failure, disabled, onAdd, onRemove }: PhotoPickerProps) {
  const { t } = useLanguage()
  const full = photos.length >= IMAGES_MAX
  // 올리는 중에 또 고르면 남은 자리 계산이 어긋난다 — 다 올린 뒤에 고르게 한다
  const locked = disabled || photos.some(photo => !photo.image)

  function pick(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    // 같은 사진을 빼고 다시 고를 수 있게 비운다
    event.target.value = ''
    if (files.length) onAdd(files)
  }

  return (
    <div className='cb-form__field'>
      <p className='cb-form__label' id='cb-photos-label'>
        <span>{t('boardPhotos')}</span>
        <span className='cb-form__count' aria-hidden='true'>
          {photos.length}/{IMAGES_MAX}
        </span>
      </p>
      <ul className='cb-photos' aria-labelledby='cb-photos-label'>
        {photos.map((photo, index) => {
          const n = String(index + 1)
          return (
            <li key={photo.key} className='cb-photos__item' aria-busy={!photo.image}>
              {/* eslint-disable-next-line @next/next/no-img-element -- blob: 미리보기 */}
              <img src={photo.preview} alt={t('boardPhotoN').replace('{n}', n)} />
              {!photo.image && (
                <span className='cb-photos__status' role='status'>
                  {t('boardPhotoUploading')}
                </span>
              )}
              <button
                type='button'
                className='cb-photos__remove'
                aria-label={t('boardPhotoRemove').replace('{n}', n)}
                disabled={!photo.image}
                onClick={() => onRemove(photo.key)}
              >
                ×
              </button>
            </li>
          )
        })}
        {!full && (
          <li>
            <label className='cb-photos__add' aria-disabled={locked || undefined}>
              <input
                type='file'
                accept='image/*'
                multiple
                className='sr-only'
                disabled={locked}
                aria-describedby='cb-photos-hint'
                onChange={pick}
              />
              <PlusMark size={20} />
              <span>{t('boardPhotoAdd')}</span>
            </label>
          </li>
        )}
      </ul>
      <p id='cb-photos-hint' className='cb-form__hint'>
        {t('boardPhotosHint')}
      </p>
      {failure && (
        <p role='alert' className='m-0 text-destructive'>
          {t(FAILURE_KEYS[failure])}
        </p>
      )}
    </div>
  )
}
