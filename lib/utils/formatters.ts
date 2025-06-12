/**
 * 통화 형식화 유틸리티
 */
export const formatPrice = (price: number, currency: 'KRW' | 'USD' | 'EUR' | 'JPY' = 'KRW'): string => {
  const formattedNumber = price.toLocaleString()
  
  switch (currency) {
    case 'KRW':
      return `₩${formattedNumber}`
    case 'USD':
      return `$${formattedNumber}`
    case 'EUR':
      return `€${formattedNumber}`
    case 'JPY':
      return `¥${formattedNumber}`
    default:
      return `₩${formattedNumber}`
  }
}

/**
 * 숫자 형식화 (천 단위 구분자)
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

/**
 * 조회수 형식화
 */
export const formatViewCount = (count: number, language: 'ko' | 'en' | 'ja' | 'zh' = 'ko'): string => {
  const formatted = formatNumber(count)
  
  switch (language) {
    case 'ko':
      return `${formatted}회`
    case 'en':
      return `${formatted} views`
    case 'ja':
      return `${formatted}回`
    case 'zh':
      return `${formatted}次`
    default:
      return `${formatted}회`
  }
}

/**
 * 날짜 형식화
 */
export const formatDate = (
  date: Date | string,
  locale: 'ko-KR' | 'en-US' | 'ja-JP' | 'zh-CN' = 'ko-KR',
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  
  return dateObj.toLocaleString(locale, defaultOptions)
}

/**
 * 상대적 시간 형식화 (예: "2시간 전")
 */
export const formatRelativeTime = (
  date: Date | string,
  language: 'ko' | 'en' | 'ja' | 'zh' = 'ko'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  
  const timeUnits = {
    ko: {
      minute: '분',
      hour: '시간',
      day: '일',
      ago: '전',
      now: '방금'
    },
    en: {
      minute: 'minute',
      hour: 'hour', 
      day: 'day',
      ago: 'ago',
      now: 'just now'
    },
    ja: {
      minute: '分',
      hour: '時間',
      day: '日',
      ago: '前',
      now: 'たった今'
    },
    zh: {
      minute: '分钟',
      hour: '小时',
      day: '天',
      ago: '前',
      now: '刚刚'
    }
  }
  
  const units = timeUnits[language]
  
  if (diffInMinutes < 1) {
    return units.now
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}${units.minute} ${units.ago}`
  } else if (diffInHours < 24) {
    return `${diffInHours}${units.hour} ${units.ago}`
  } else if (diffInDays < 30) {
    return `${diffInDays}${units.day} ${units.ago}`
  } else {
    // 30일 이상은 실제 날짜 표시
    return formatDate(dateObj)
  }
}

/**
 * 파일 크기 형식화
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 퍼센티지 형식화
 */
export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${Math.round(percentage)}%`
}

/**
 * 축약된 숫자 형식화 (예: 1.2K, 1.5M)
 */
export const formatCompactNumber = (num: number): string => {
  if (num < 1000) return num.toString()
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`
  return `${(num / 1000000000).toFixed(1)}B`
} 