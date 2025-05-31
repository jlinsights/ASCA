import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSS 클래스를 안전하게 병합하는 함수
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 문자열을 슬러그 형태로 변환
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 특수문자 제거
    .replace(/[\s_-]+/g, '-') // 공백과 언더스코어를 하이픈으로
    .replace(/^-+|-+$/g, '') // 시작과 끝의 하이픈 제거
}

/**
 * 디바운스 함수
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = undefined
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

/**
 * 쓰로틀 함수
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 깊은 객체 비교
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  if (!a || !b || (typeof a !== "object" && typeof b !== "object")) {
    return a === b
  }

  if (a === null || a === undefined || b === null || b === undefined) {
    return false
  }

  // 타입 안전성을 위한 체크
  if (typeof a === 'object' && typeof b === 'object' && 
      Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
    return false
  }

  const keys = Object.keys(a as Record<string, unknown>)
  if (keys.length !== Object.keys(b as Record<string, unknown>).length) {
    return false
  }

  return keys.every(k => 
    deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
  )
}

/**
 * 로컬 스토리지 안전 액세스
 */
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    if (typeof window === 'undefined') return defaultValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}

/**
 * 랜덤 ID 생성
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 숫자를 형식화된 문자열로 변환
 */
export function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('ko-KR', options).format(num)
}

/**
 * 파일 크기를 읽기 쉬운 형태로 변환
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * URL 유효성 검사
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * 이메일 유효성 검사
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 텍스트 truncate
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * 배열을 청크로 분할
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * 객체에서 특정 키들만 선택
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * 객체에서 특정 키들을 제외
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}
