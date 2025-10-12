/**
 * SNS 공유 유틸리티 함수
 */

export interface ShareData {
  title: string
  description: string
  imageUrl: string
  url: string
  hashtags?: string[]
}

/**
 * 카카오톡 공유
 */
export const shareToKakao = (data: ShareData) => {
  // 카카오 SDK가 로드되어 있는지 확인
  if (typeof window !== 'undefined' && window.Kakao) {
    try {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          link: {
            mobileWebUrl: data.url,
            webUrl: data.url,
          },
        },
        buttons: [
          {
            title: '자세히 보기',
            link: {
              mobileWebUrl: data.url,
              webUrl: data.url,
            },
          },
        ],
      })
    } catch (error) {
      console.error('카카오톡 공유 실패:', error)
      // 폴백: 카카오톡 웹 공유 URL
      const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(data.url)}`
      window.open(kakaoUrl, '_blank')
    }
  } else {
    // 카카오 SDK가 없는 경우 웹 공유 URL 사용
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(data.url)}`
    window.open(kakaoUrl, '_blank')
  }
}

/**
 * 페이스북 공유
 */
export const shareToFacebook = (data: ShareData) => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(data.title + ' - ' + data.description)}`
  window.open(facebookUrl, '_blank', 'width=600,height=400')
}

/**
 * 인스타그램 공유 (이미지 다운로드 + 클립보드 복사)
 */
export const shareToInstagram = (data: ShareData) => {
  // 인스타그램은 직접 공유 API가 없으므로 이미지 다운로드 + 텍스트 복사
  try {
    // 공유 텍스트 생성
    const shareText = `${data.title}\n\n${data.description}\n\n${data.hashtags?.map(tag => `#${tag}`).join(' ') || ''}\n\n더 보기: ${data.url}`
    
    // 클립보드에 텍스트 복사
    navigator.clipboard.writeText(shareText).then(() => {
      // 이미지 다운로드 시도
      downloadImage(data.imageUrl, `${data.title}.jpg`)
      
      // 사용자에게 안내
      alert('📸 이미지가 다운로드되고 텍스트가 복사되었습니다!\n인스타그램 앱에서 이미지를 업로드하고 복사된 텍스트를 붙여넣으세요.')
    }).catch(() => {
      // 클립보드 복사 실패시 폴백
      prompt('다음 텍스트를 복사하여 인스타그램에 사용하세요:', shareText)
    })
  } catch (error) {
    console.error('인스타그램 공유 준비 실패:', error)
    alert('공유 준비 중 오류가 발생했습니다.')
  }
}

/**
 * 트위터 공유
 */
export const shareToTwitter = (data: ShareData) => {
  const hashtags = data.hashtags?.join(',') || ''
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(data.url)}&hashtags=${encodeURIComponent(hashtags)}`
  window.open(twitterUrl, '_blank', 'width=600,height=400')
}

/**
 * 링크 복사
 */
export const copyLink = (url: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      // 복사 완료 피드백 (컴포넌트에서 처리)
      return true
    }).catch(() => {
      // 폴백: 텍스트 선택
      fallbackCopyTextToClipboard(url)
      return true
    })
  } else {
    fallbackCopyTextToClipboard(url)
    return true
  }
}

/**
 * 네이티브 공유 (모바일)
 */
export const shareNative = async (data: ShareData) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.description,
        url: data.url,
      })
      return true
    } catch (error) {
      console.error('네이티브 공유 실패:', error)
      return false
    }
  }
  return false
}

/**
 * 이미지 다운로드 헬퍼 함수
 */
const downloadImage = async (imageUrl: string, filename: string) => {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('이미지 다운로드 실패:', error)
  }
}

/**
 * 클립보드 복사 폴백 함수
 */
const fallbackCopyTextToClipboard = (text: string) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'
  
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  
  try {
    document.execCommand('copy')
  } catch (err) {
    console.error('클립보드 복사 실패:', err)
  }
  
  document.body.removeChild(textArea)
}

/**
 * URL에서 절대 경로 생성
 */
export const getAbsoluteUrl = (relativePath: string) => {
  if (typeof window !== 'undefined') {
    return new URL(relativePath, window.location.origin).href
  }
  return relativePath
}