// 공통 에러 타입 및 API 에러 핸들러

export class AppError extends Error {
  statusCode: number
  code?: string | undefined
  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    }
  }
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Internal server error',
    statusCode: 500,
  }
} 