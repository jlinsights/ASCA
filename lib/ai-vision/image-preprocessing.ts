// 이미지 전처리 유틸리티

import type { ImagePreprocessingConfig } from './types'

export class ImagePreprocessor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
  }

  /**
   * 서예 작품 이미지 전처리
   */
  async preprocessCalligraphyImage(
    file: File,
    config: ImagePreprocessingConfig = {}
  ): Promise<{
    originalImageData: ImageData
    processedImageData: ImageData
    originalBlob: Blob
    processedBlob: Blob
  }> {
    const image = await this.loadImage(file)
    
    // 캔버스 크기 설정
    const { width, height } = this.calculateDimensions(image, config.resize)
    this.canvas.width = width
    this.canvas.height = height
    
    // 원본 이미지 그리기
    this.ctx.drawImage(image, 0, 0, width, height)
    const originalImageData = this.ctx.getImageData(0, 0, width, height)
    
    // 전처리 단계별 적용
    let processedImageData = this.cloneImageData(originalImageData)
    
    if (config.contrast?.enabled) {
      processedImageData = this.adjustContrast(processedImageData, config.contrast.factor)
    }
    
    if (config.brightness?.enabled) {
      processedImageData = this.adjustBrightness(processedImageData, config.brightness.factor)
    }
    
    if (config.denoise?.enabled) {
      processedImageData = this.denoise(processedImageData, config.denoise.strength)
    }
    
    if (config.sharpen?.enabled) {
      processedImageData = this.sharpen(processedImageData, config.sharpen.strength)
    }
    
    if (config.binarization?.enabled) {
      processedImageData = this.binarize(
        processedImageData, 
        config.binarization.threshold,
        config.binarization.adaptive
      )
    }
    
    // Blob 생성
    this.ctx.putImageData(originalImageData, 0, 0)
    const originalBlob = await this.canvasToBlob()
    
    this.ctx.putImageData(processedImageData, 0, 0)
    const processedBlob = await this.canvasToBlob()
    
    return {
      originalImageData,
      processedImageData,
      originalBlob,
      processedBlob
    }
  }

  /**
   * 파일에서 이미지 로드
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 이미지 크기 계산
   */
  private calculateDimensions(
    image: HTMLImageElement,
    resizeConfig?: { width: number; height: number; maintainAspectRatio: boolean }
  ): { width: number; height: number } {
    if (!resizeConfig) {
      return { width: image.width, height: image.height }
    }

    if (!resizeConfig.maintainAspectRatio) {
      return { width: resizeConfig.width, height: resizeConfig.height }
    }

    const aspectRatio = image.width / image.height
    let { width, height } = resizeConfig

    if (width / height > aspectRatio) {
      width = height * aspectRatio
    } else {
      height = width / aspectRatio
    }

    return { width, height }
  }

  /**
   * ImageData 복제
   */
  private cloneImageData(imageData: ImageData): ImageData {
    return new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    )
  }

  /**
   * 대비 조정
   */
  private adjustContrast(imageData: ImageData, factor: number): ImageData {
    const data = imageData.data
    const adjustment = (factor - 1) * 128

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] * factor - adjustment))     // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor - adjustment)) // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor - adjustment)) // B
    }

    return imageData
  }

  /**
   * 밝기 조정
   */
  private adjustBrightness(imageData: ImageData, factor: number): ImageData {
    const data = imageData.data
    const adjustment = (factor - 1) * 255

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + adjustment))     // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment)) // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment)) // B
    }

    return imageData
  }

  /**
   * 노이즈 제거 (가우시안 블러)
   */
  private denoise(imageData: ImageData, strength: number): ImageData {
    const { width, height, data } = imageData
    const output = new Uint8ClampedArray(data)
    
    const radius = Math.ceil(strength * 3)
    const kernel = this.createGaussianKernel(radius)
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 3; c++) { // RGB 채널만
          let sum = 0
          let weightSum = 0
          
          for (let ky = -radius; ky <= radius; ky++) {
            for (let kx = -radius; kx <= radius; kx++) {
              const px = Math.min(width - 1, Math.max(0, x + kx))
              const py = Math.min(height - 1, Math.max(0, y + ky))
              const weight = kernel[ky + radius][kx + radius]
              
              sum += data[(py * width + px) * 4 + c] * weight
              weightSum += weight
            }
          }
          
          output[(y * width + x) * 4 + c] = sum / weightSum
        }
      }
    }
    
    return new ImageData(output, width, height)
  }

  /**
   * 가우시안 커널 생성
   */
  private createGaussianKernel(radius: number): number[][] {
    const size = radius * 2 + 1
    const kernel: number[][] = []
    const sigma = radius / 3
    const twoSigmaSquare = 2 * sigma * sigma
    
    for (let y = 0; y < size; y++) {
      kernel[y] = []
      for (let x = 0; x < size; x++) {
        const distance = (x - radius) ** 2 + (y - radius) ** 2
        kernel[y][x] = Math.exp(-distance / twoSigmaSquare)
      }
    }
    
    return kernel
  }

  /**
   * 샤프닝
   */
  private sharpen(imageData: ImageData, strength: number): ImageData {
    const { width, height, data } = imageData
    const output = new Uint8ClampedArray(data)
    
    // 라플라시안 커널
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ]
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0
          
          for (let ky = 0; ky < 3; ky++) {
            for (let kx = 0; kx < 3; kx++) {
              const px = x + kx - 1
              const py = y + ky - 1
              sum += data[(py * width + px) * 4 + c] * kernel[ky][kx]
            }
          }
          
          const original = data[(y * width + x) * 4 + c]
          const sharpened = original + (sum - original) * strength
          output[(y * width + x) * 4 + c] = Math.min(255, Math.max(0, sharpened))
        }
      }
    }
    
    return new ImageData(output, width, height)
  }

  /**
   * 이진화
   */
  private binarize(
    imageData: ImageData, 
    threshold: number = 128, 
    adaptive: boolean = false
  ): ImageData {
    const { width, height, data } = imageData
    const output = new Uint8ClampedArray(data)
    
    if (adaptive) {
      // 적응적 이진화
      const blockSize = 15
      const C = 10
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const localThreshold = this.calculateLocalThreshold(data, width, height, x, y, blockSize, C)
          const gray = this.getGrayscale(data, y * width + x)
          const binary = gray < localThreshold ? 0 : 255
          
          const idx = (y * width + x) * 4
          output[idx] = binary     // R
          output[idx + 1] = binary // G
          output[idx + 2] = binary // B
        }
      }
    } else {
      // 전역 이진화
      for (let i = 0; i < data.length; i += 4) {
        const gray = this.getGrayscale(data, i / 4)
        const binary = gray < threshold ? 0 : 255
        
        output[i] = binary     // R
        output[i + 1] = binary // G
        output[i + 2] = binary // B
      }
    }
    
    return new ImageData(output, width, height)
  }

  /**
   * 그레이스케일 값 계산
   */
  private getGrayscale(data: Uint8ClampedArray, pixelIndex: number): number {
    const i = pixelIndex * 4
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }

  /**
   * 지역 임계값 계산 (적응적 이진화용)
   */
  private calculateLocalThreshold(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    x: number,
    y: number,
    blockSize: number,
    C: number
  ): number {
    const halfBlock = Math.floor(blockSize / 2)
    let sum = 0
    let count = 0
    
    for (let dy = -halfBlock; dy <= halfBlock; dy++) {
      for (let dx = -halfBlock; dx <= halfBlock; dx++) {
        const nx = Math.min(width - 1, Math.max(0, x + dx))
        const ny = Math.min(height - 1, Math.max(0, y + dy))
        
        sum += this.getGrayscale(data, ny * width + nx)
        count++
      }
    }
    
    return (sum / count) - C
  }

  /**
   * 캔버스를 Blob으로 변환
   */
  private canvasToBlob(): Promise<Blob> {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob!)
      }, 'image/png')
    })
  }

  /**
   * 기본 전처리 설정
   */
  static getDefaultConfig(): ImagePreprocessingConfig {
    return {
      resize: {
        width: 1024,
        height: 1024,
        maintainAspectRatio: true
      },
      contrast: {
        enabled: true,
        factor: 1.2
      },
      brightness: {
        enabled: false,
        factor: 1.0
      },
      sharpen: {
        enabled: true,
        strength: 0.3
      },
      denoise: {
        enabled: true,
        strength: 0.2
      },
      binarization: {
        enabled: false,
        threshold: 128,
        adaptive: false
      }
    }
  }

  /**
   * 서예 특화 전처리 설정
   */
  static getCalligraphyConfig(): ImagePreprocessingConfig {
    return {
      resize: {
        width: 1024,
        height: 1024,
        maintainAspectRatio: true
      },
      contrast: {
        enabled: true,
        factor: 1.5 // 먹과 종이의 대비 강화
      },
      brightness: {
        enabled: false,
        factor: 1.0
      },
      sharpen: {
        enabled: true,
        strength: 0.5 // 붓질 경계 선명화
      },
      denoise: {
        enabled: true,
        strength: 0.3 // 종이 질감 노이즈 제거
      },
      binarization: {
        enabled: true,
        threshold: 140,
        adaptive: true // 먹의 농담 보존
      }
    }
  }
}

/**
 * 이미지 품질 평가
 */
export class ImageQualityAssessor {
  /**
   * 서예 이미지 품질 평가
   */
  static assessCalligraphyImageQuality(imageData: ImageData): {
    score: number // 0-100
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    // 해상도 검사
    if (imageData.width < 512 || imageData.height < 512) {
      issues.push('해상도가 낮습니다')
      recommendations.push('최소 512x512 이상의 해상도로 촬영하세요')
      score -= 20
    }

    // 대비 검사
    const contrast = this.calculateContrast(imageData)
    if (contrast < 0.3) {
      issues.push('대비가 부족합니다')
      recommendations.push('조명을 개선하거나 대비를 높여주세요')
      score -= 15
    }

    // 블러 검사
    const sharpness = this.calculateSharpness(imageData)
    if (sharpness < 0.5) {
      issues.push('이미지가 흐립니다')
      recommendations.push('카메라를 고정하고 초점을 맞춰 촬영하세요')
      score -= 20
    }

    // 기울기 검사
    const skew = this.calculateSkew(imageData)
    if (skew > 5) {
      issues.push('이미지가 기울어져 있습니다')
      recommendations.push('수평을 맞춰 촬영하세요')
      score -= 10
    }

    // 노이즈 검사
    const noise = this.calculateNoise(imageData)
    if (noise > 0.3) {
      issues.push('노이즈가 많습니다')
      recommendations.push('조명을 개선하고 ISO를 낮춰 촬영하세요')
      score -= 15
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    }
  }

  private static calculateContrast(imageData: ImageData): number {
    const { data } = imageData
    let min = 255, max = 0

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      min = Math.min(min, gray)
      max = Math.max(max, gray)
    }

    return (max - min) / 255
  }

  private static calculateSharpness(imageData: ImageData): number {
    const { width, height, data } = imageData
    let sharpness = 0
    let count = 0

    // 라플라시안 필터를 사용한 선명도 측정
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = this.getGray(data, width, x, y)
        const laplacian = Math.abs(
          4 * center - 
          this.getGray(data, width, x - 1, y) -
          this.getGray(data, width, x + 1, y) -
          this.getGray(data, width, x, y - 1) -
          this.getGray(data, width, x, y + 1)
        )
        
        sharpness += laplacian
        count++
      }
    }

    return Math.min(1, (sharpness / count) / 50)
  }

  private static calculateSkew(imageData: ImageData): number {
    // 간단한 기울기 검출 - 실제로는 더 복잡한 알고리즘 필요
    // 여기서는 예시로 0을 반환
    return 0
  }

  private static calculateNoise(imageData: ImageData): number {
    const { width, height, data } = imageData
    let noise = 0
    let count = 0

    // 고주파 성분을 이용한 노이즈 측정
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = this.getGray(data, width, x, y)
        const variance = Math.abs(center - this.getGray(data, width, x - 1, y)) +
                        Math.abs(center - this.getGray(data, width, x + 1, y)) +
                        Math.abs(center - this.getGray(data, width, x, y - 1)) +
                        Math.abs(center - this.getGray(data, width, x, y + 1))
        
        noise += variance
        count++
      }
    }

    return Math.min(1, (noise / count) / 100)
  }

  private static getGray(data: Uint8ClampedArray, width: number, x: number, y: number): number {
    const i = (y * width + x) * 4
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
}