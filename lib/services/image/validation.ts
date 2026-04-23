// File validation — pure function

export interface ValidationOptions {
  maxFileSize: number
  allowedFormats: string[]
}

export function validateImageFile(file: File, options: ValidationOptions): void {
  if (file.size > options.maxFileSize) {
    throw new Error(
      `File size exceeds maximum allowed size of ${options.maxFileSize / (1024 * 1024)}MB`
    )
  }

  const extension = file.name.toLowerCase().split('.').pop()
  if (!extension || !options.allowedFormats.includes(extension)) {
    throw new Error(
      `File format not supported. Allowed formats: ${options.allowedFormats.join(', ')}`
    )
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('File is not a valid image')
  }
}
