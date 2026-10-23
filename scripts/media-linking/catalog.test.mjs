import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { galleryKey, planGallery, planArtworks } from './catalog.mjs'

function fixture(t, files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'asca-media-test-'))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  for (const file of files) {
    const target = path.join(root, file)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, '')
  }
  return root
}

test('동일 사진의 원본/썸네일/파생 포맷을 하나로 식별한다', () => {
  assert.equal(
    galleryKey('/images/gallery/2025/a/originals/photo-750w.webp'),
    galleryKey('/images/gallery/2025/a/thumbnails/photo.jpg')
  )
  assert.equal(galleryKey('/images/gallery/../private.jpg'), null)
  assert.equal(galleryKey('https://example.com/photo.jpg'), null)
})

test('누락 원본을 보고하고 실제 원본을 파생 파일보다 우선한다', t => {
  const root = fixture(t, [
    'images/gallery/2025/a/photo.jpg',
    'images/gallery/2025/a/photo-750w.webp',
  ])
  const result = planGallery(root, [
    { id: '1', src: '/images/gallery/2025/a/photo-750w.webp' },
    { id: '2', src: '/images/gallery/2025/a/photo.jpg' },
    { id: '3', src: '/images/gallery/2025/a/missing.jpg' },
  ])
  assert.equal(result.matched.length, 1)
  assert.equal(result.matched[0].relative, '/images/gallery/2025/a/photo.jpg')
  assert.equal(result.missing.length, 1)
})

test('유니코드 분해 파일명과 한자 작가명을 DB의 같은 인물로 대조한다', t => {
  const root = fixture(t, [
    `webflow/orientalcalligraphy/images/${'金惠蘭_고린도전서-13장-1절~7절_최우수상.JPG'.normalize('NFD')}`,
  ])
  const result = planArtworks(
    root,
    [{ id: 'w1', artist_id: 'a1', title: '고린도전서 13장 1절~7절' }],
    [{ id: 'a1', name: '김혜란', name_zh: '金惠蘭' }]
  )
  assert.equal(result.matched.length, 1)
})

test('제목만 같고 작가가 다르면 연결하지 않는다', t => {
  const root = fixture(t, ['webflow/orientalcalligraphy/images/다른작가_달이떴다.JPG'])
  const result = planArtworks(
    root,
    [{ id: 'w1', artist_id: 'a1', title: '달이 떴다' }],
    [{ id: 'a1', name: '김선자' }]
  )
  assert.equal(result.matched.length, 0)
})

test('이미 Storage 이미지가 연결된 작품은 덮어쓰지 않는다', t => {
  const root = fixture(t, ['webflow/orientalcalligraphy/images/김선자_달이떴다.JPG'])
  const result = planArtworks(
    root,
    [
      {
        id: 'w1',
        artist_id: 'a1',
        title: '달이 떴다',
        images: { main: { path: 'existing/web.webp' } },
      },
    ],
    [{ id: 'a1', name: '김선자' }]
  )
  assert.equal(result.matched.length, 0)
  assert.equal(result.connected.length, 1)
})

test('같은 제목의 DB 행이 여러 개면 동일 원본을 자동 배정하지 않는다', t => {
  const root = fixture(t, ['webflow/orientalcalligraphy/images/김선자_달이떴다.JPG'])
  const result = planArtworks(
    root,
    [
      { id: 'w1', artist_id: 'a1', title: '달이 떴다' },
      { id: 'w2', artist_id: 'a1', title: '달이 떴다' },
    ],
    [{ id: 'a1', name: '김선자' }]
  )
  assert.equal(result.matched.length, 0)
  assert.equal(result.unmatched.length, 2)
})
