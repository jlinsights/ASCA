'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react'

// Enhanced Input Component with advanced validation
const inputVariants = cva(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
  {
    variants: {
      variant: {
        default: '',
        success: 'border-green-500 focus-visible:ring-green-500',
        error: 'border-destructive focus-visible:ring-destructive',
        warning: 'border-yellow-500 focus-visible:ring-yellow-500',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 text-xs',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ValidationRule {
  test: (value: string) => boolean
  message: string
  type?: 'error' | 'warning'
}

interface EnhancedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  description?: string
  error?: string
  success?: string
  warning?: string
  validationRules?: ValidationRule[]
  showValidation?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onValidationChange?: (isValid: boolean, errors: string[]) => void
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      className,
      variant,
      size,
      type = 'text',
      label,
      description,
      error,
      success,
      warning,
      validationRules = [],
      showValidation = true,
      isLoading = false,
      leftIcon,
      rightIcon,
      onValidationChange,
      onChange,
      onBlur,
      value,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState('')
    const [validationErrors, setValidationErrors] = React.useState<string[]>([])
    const [validationWarnings, setValidationWarnings] = React.useState<string[]>([])
    const [isTouched, setIsTouched] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)

    const currentValue = value !== undefined ? String(value) : internalValue
    const isPasswordType = type === 'password'

    // Validate input
    const validateInput = React.useCallback((inputValue: string) => {
      const errors: string[] = []
      const warnings: string[] = []

      validationRules.forEach(rule => {
        if (!rule.test(inputValue)) {
          if (rule.type === 'warning') {
            warnings.push(rule.message)
          } else {
            errors.push(rule.message)
          }
        }
      })

      setValidationErrors(errors)
      setValidationWarnings(warnings)
      
      const isValid = errors.length === 0
      onValidationChange?.(isValid, errors)
      
      return isValid
    }, [validationRules, onValidationChange])

    // Handle value changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      
      if (showValidation && isTouched) {
        validateInput(newValue)
      }
      
      onChange?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsTouched(true)
      if (showValidation) {
        validateInput(currentValue)
      }
      onBlur?.(e)
    }

    // Determine variant based on validation state
    const getVariant = () => {
      if (error || (showValidation && isTouched && validationErrors.length > 0)) {
        return 'error'
      }
      if (warning || (showValidation && isTouched && validationWarnings.length > 0)) {
        return 'warning'
      }
      if (success || (showValidation && isTouched && validationErrors.length === 0 && currentValue)) {
        return 'success'
      }
      return variant || 'default'
    }

    const inputId = React.useId()
    const descriptionId = React.useId()
    const errorId = React.useId()

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            type={isPasswordType && showPassword ? 'text' : type}
            className={cn(
              inputVariants({ variant: getVariant(), size, className }),
              leftIcon && 'pl-10',
              (rightIcon || isPasswordType || isLoading) && 'pr-10'
            )}
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-describedby={cn(
              description && descriptionId,
              (error || validationErrors.length > 0) && errorId
            )}
            aria-invalid={error || validationErrors.length > 0 ? 'true' : 'false'}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            
            {isPasswordType && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
            
            {rightIcon && !isPasswordType && !isLoading && (
              <div className="text-muted-foreground">{rightIcon}</div>
            )}
            
            {showValidation && isTouched && !isLoading && (
              <>
                {validationErrors.length > 0 && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                {validationErrors.length === 0 && validationWarnings.length === 0 && currentValue && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </>
            )}
          </div>
        </div>
        
        {description && (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        
        {/* Error Messages */}
        {(error || (showValidation && isTouched && validationErrors.length > 0)) && (
          <div id={errorId} className="space-y-1">
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {showValidation && isTouched && validationErrors.map((err, index) => (
              <p key={index} className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {err}
              </p>
            ))}
          </div>
        )}
        
        {/* Warning Messages */}
        {(warning || (showValidation && isTouched && validationWarnings.length > 0)) && (
          <div className="space-y-1">
            {warning && (
              <p className="text-xs text-yellow-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {warning}
              </p>
            )}
            {showValidation && isTouched && validationWarnings.map((warn, index) => (
              <p key={index} className="text-xs text-yellow-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {warn}
              </p>
            ))}
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {success}
          </p>
        )}
      </div>
    )
  }
)
EnhancedInput.displayName = 'EnhancedInput'

// Enhanced Textarea Component
interface EnhancedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: string
  error?: string
  success?: string
  warning?: string
  validationRules?: ValidationRule[]
  showValidation?: boolean
  showCharCount?: boolean
  maxLength?: number
  onValidationChange?: (isValid: boolean, errors: string[]) => void
}

const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  (
    {
      className,
      label,
      description,
      error,
      success,
      warning,
      validationRules = [],
      showValidation = true,
      showCharCount = false,
      maxLength,
      onValidationChange,
      onChange,
      onBlur,
      value,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState('')
    const [validationErrors, setValidationErrors] = React.useState<string[]>([])
    const [validationWarnings, setValidationWarnings] = React.useState<string[]>([])
    const [isTouched, setIsTouched] = React.useState(false)

    const currentValue = value !== undefined ? String(value) : internalValue
    const charCount = currentValue.length

    // Validate textarea
    const validateTextarea = React.useCallback((inputValue: string) => {
      const errors: string[] = []
      const warnings: string[] = []

      validationRules.forEach(rule => {
        if (!rule.test(inputValue)) {
          if (rule.type === 'warning') {
            warnings.push(rule.message)
          } else {
            errors.push(rule.message)
          }
        }
      })

      setValidationErrors(errors)
      setValidationWarnings(warnings)
      
      const isValid = errors.length === 0
      onValidationChange?.(isValid, errors)
      
      return isValid
    }, [validationRules, onValidationChange])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      
      if (showValidation && isTouched) {
        validateTextarea(newValue)
      }
      
      onChange?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsTouched(true)
      if (showValidation) {
        validateTextarea(currentValue)
      }
      onBlur?.(e)
    }

    const getVariant = () => {
      if (error || (showValidation && isTouched && validationErrors.length > 0)) {
        return 'border-destructive focus-visible:ring-destructive'
      }
      if (warning || (showValidation && isTouched && validationWarnings.length > 0)) {
        return 'border-yellow-500 focus-visible:ring-yellow-500'
      }
      if (success || (showValidation && isTouched && validationErrors.length === 0 && currentValue)) {
        return 'border-green-500 focus-visible:ring-green-500'
      }
      return ''
    }

    const inputId = React.useId()
    const descriptionId = React.useId()
    const errorId = React.useId()

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <textarea
            id={inputId}
            ref={ref}
            className={cn(
              'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
              getVariant(),
              className
            )}
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={maxLength}
            aria-describedby={cn(
              description && descriptionId,
              (error || validationErrors.length > 0) && errorId
            )}
            aria-invalid={error || validationErrors.length > 0 ? 'true' : 'false'}
            {...props}
          />
          
          {showCharCount && maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {charCount}/{maxLength}
            </div>
          )}
        </div>
        
        {description && (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        
        {/* Error Messages */}
        {(error || (showValidation && isTouched && validationErrors.length > 0)) && (
          <div id={errorId} className="space-y-1">
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {showValidation && isTouched && validationErrors.map((err, index) => (
              <p key={index} className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {err}
              </p>
            ))}
          </div>
        )}
        
        {/* Warning Messages */}
        {(warning || (showValidation && isTouched && validationWarnings.length > 0)) && (
          <div className="space-y-1">
            {warning && (
              <p className="text-xs text-yellow-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {warning}
              </p>
            )}
            {showValidation && isTouched && validationWarnings.map((warn, index) => (
              <p key={index} className="text-xs text-yellow-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {warn}
              </p>
            ))}
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {success}
          </p>
        )}
      </div>
    )
  }
)
EnhancedTextarea.displayName = 'EnhancedTextarea'

// Form Validation Hook
export function useFormValidation(initialValues: Record<string, any> = {}) {
  const [values, setValues] = React.useState(initialValues)
  const [errors, setErrors] = React.useState<Record<string, string[]>>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const setValue = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const setError = (name: string, error: string[]) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const setTouched = (name: string, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }))
  }

  const getFieldProps = (name: string) => ({
    name,
    value: values[name] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(name, e.target.value)
    },
    onBlur: () => setTouched(name, true),
    error: touched[name] && errors[name]?.[0],
  })

  const validateField = (name: string, rules: ValidationRule[]) => {
    const value = values[name] || ''
    const fieldErrors: string[] = []

    rules.forEach(rule => {
      if (!rule.test(value)) {
        fieldErrors.push(rule.message)
      }
    })

    setError(name, fieldErrors)
    return fieldErrors.length === 0
  }

  const validateForm = (validationSchema: Record<string, ValidationRule[]>) => {
    let isValid = true
    const newErrors: Record<string, string[]> = {}

    Object.entries(validationSchema).forEach(([fieldName, rules]) => {
      const value = values[fieldName] || ''
      const fieldErrors: string[] = []

      rules.forEach(rule => {
        if (!rule.test(value)) {
          fieldErrors.push(rule.message)
        }
      })

      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    setValue,
    setError,
    setTouched,
    getFieldProps,
    validateField,
    validateForm,
    reset,
  }
}

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value: string) => value.trim().length > 0,
    message,
  }),
  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    test: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message,
  }),
  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value: string) => value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),
  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value: string) => value.length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),
  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    test: (value: string) => {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))
    },
    message,
  }),
  password: (message = 'Password must contain at least 8 characters, including uppercase, lowercase, and numbers'): ValidationRule => ({
    test: (value: string) => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
      return passwordRegex.test(value)
    },
    message,
  }),
  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    test: (value: string) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message,
  }),
}

export { EnhancedInput, EnhancedTextarea }