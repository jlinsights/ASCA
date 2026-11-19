/** @jest-environment node */
import sharp from 'sharp'
import { ImageRejected, IMAGE_MAX_EDGE, processImage } from '../images'

jest.mock('server-only', () => ({}))

/** 위치(GPS)가 든 EXIF 를 실은 가로 사진. orientation 6 = 90° 돌려 보여야 하는 사진 */
async function phoneJpeg(width = 3000, height = 2000, orientation = 6) {
  return (
    sharp({ create: { width, height, channels: 3, background: '#c33' } })
      // withExif 만으로는 방향이 실리지 않는다 — 방향은 withMetadata 로
      .withMetadata({ orientation })
      .withExifMerge({
        IFD0: { Make: 'TestPhone' },
        IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '37/1 34/1 0/1' },
      })
      .jpeg()
      .toBuffer()
  )
}

describe('processImage', () => {
  it('fixture really carries EXIF with GPS (probe check)', async () => {
    const meta = await sharp(await phoneJpeg()).metadata()
    expect(meta.exif?.length).toBeGreaterThan(0)
    expect(meta.exif!.toString('latin1')).toContain('TestPhone')
    expect(meta.orientation).toBe(6)
  })

  it('strips every bit of metadata and outputs WebP', async () => {
    const out = await processImage(await phoneJpeg())
    const meta = await sharp(out.data).metadata()
    expect(meta.format).toBe('webp')
    expect(meta.exif).toBeUndefined()
    expect(meta.icc).toBeUndefined()
    expect(meta.xmp).toBeUndefined()
    expect(out.data.toString('latin1')).not.toContain('TestPhone')
  })

  it('applies the camera orientation, then fits within the max edge', async () => {
    const out = await processImage(await phoneJpeg(3000, 2000, 6))
    // 90° 돌린 사진이라 세로가 길다
    expect(out.height).toBe(IMAGE_MAX_EDGE)
    expect(out.width).toBe(Math.round((2000 / 3000) * IMAGE_MAX_EDGE))
    const meta = await sharp(out.data).metadata()
    expect([meta.width, meta.height]).toEqual([out.width, out.height])
  })

  it('does not enlarge small images', async () => {
    const small = await sharp({
      create: { width: 400, height: 300, channels: 3, background: '#fff' },
    })
      .png()
      .toBuffer()
    const out = await processImage(small)
    expect([out.width, out.height]).toEqual([400, 300])
    expect(out.data.length).toBeLessThan(2 * 1024 * 1024)
  })

  it('rejects things that are not images, and formats we do not take', async () => {
    await expect(processImage(Buffer.from('not an image'))).rejects.toBeInstanceOf(ImageRejected)
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>')
    await expect(processImage(svg)).rejects.toBeInstanceOf(ImageRejected)
  })

  it('refuses decompression bombs before decoding them', async () => {
    const huge = await sharp({
      create: { width: 9000, height: 9000, channels: 3, background: '#000' },
    })
      .jpeg({ quality: 10 })
      .toBuffer()
    await expect(processImage(huge)).rejects.toBeInstanceOf(ImageRejected)
  })
})
