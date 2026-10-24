import type { AuthError } from '@supabase/supabase-js'

const INVALID_SESSION_CODES = new Set([
  'bad_jwt',
  'session_not_found',
  'session_expired',
  'refresh_token_not_found',
  'refresh_token_already_used',
  'user_not_found',
  'user_banned',
])

export function isInvalidSession(error: AuthError): boolean {
  return (
    error.name === 'AuthSessionMissingError' ||
    (error.name === 'AuthApiError' && !!error.code && INVALID_SESSION_CODES.has(error.code))
  )
}

export class AccountAuthError extends Error {
  constructor(
    public readonly code: 'AUTH_UNAVAILABLE' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'MFA_REQUIRED',
    public readonly status: 401 | 403 | 503
  ) {
    super(code)
    this.name = 'AccountAuthError'
  }
}
