import { NextRequest, NextResponse } from 'next/server'
import { ImagePreprocessor, ImageQualityAssessor } from '@/lib/ai-vision/image-preprocessing'
import type { UploadResponse } from '@/lib/ai-vision/types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: '파일이 업로드되지 않았습니다'
        } as UploadResponse,
        { status: 400 }
      )
    }

    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          error: '이미지 파일만 업로드 가능합니다'
        } as UploadResponse,
        { status: 400 }
      )
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: '파일 크기는 10MB 이하여야 합니다'
        } as UploadResponse,
        { status: 400 }
      )
    }

    // 이미지 전처리
    const preprocessor = new ImagePreprocessor()
    const preprocessingConfig = ImagePreprocessor.getCalligraphyConfig()
    
    const {
      originalImageData,
      processedImageData,
      originalBlob,
      processedBlob
    } = await preprocessor.preprocessCalligraphyImage(file, preprocessingConfig)

    // 이미지 품질 평가
    const qualityAssessment = ImageQualityAssessor.assessCalligraphyImageQuality(originalImageData)
    
    if (qualityAssessment.score < 50) {
      return NextResponse.json(
        {
          success: false,
          error: `이미지 품질이 낮습니다: ${qualityAssessment.issues.join(', ')}`,
          recommendations: qualityAssessment.recommendations
        } as UploadResponse & { recommendations: string[] },
        { status: 400 }
      )
    }

    // 실제 프로덕션에서는 S3, CloudFlare Images 등에 업로드
    // 여기서는 임시로 파일명만 생성
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const imageUrl = `/api/ai-vision/images/${imageId}`
    const preprocessedImageUrl = `/api/ai-vision/images/${imageId}_processed`

    // TODO: 실제 파일 저장 로직 구현
    // - originalBlob과 processedBlob를 클라우드 스토리지에 저장
    // - 데이터베이스에 이미지 메타데이터 저장

    return NextResponse.json({
      success: true,
      imageId,
      imageUrl,
      preprocessedImageUrl,
      qualityScore: qualityAssessment.score,
      qualityIssues: qualityAssessment.issues,
      recommendations: qualityAssessment.recommendations
    } as UploadResponse & {
      qualityScore: number
      qualityIssues: string[]
      recommendations: string[]
    })

  } catch (error) {
    console.error('Image upload error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: '이미지 업로드 중 오류가 발생했습니다'
      } as UploadResponse,
      { status: 500 }
    )
  }
}