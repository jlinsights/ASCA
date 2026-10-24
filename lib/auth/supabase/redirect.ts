/** Accept only local paths for redirects after login, confirmation, or recovery. */
export function safeAuthRedirect(destination: string | null | undefined): string {
  const fallback = '/profile'
  if (!destination?.startsWith('/')) return fallback

  // Check nested encodings too: a later decoder must not turn a local URL into
  // a protocol-relative URL, backslash URL, or a URL containing control bytes.
  let decoded = destination
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      if (decoded.startsWith('//') || /[\\\u0000-\u0020\u007f]/.test(decoded)) return fallback
      const next = decodeURIComponent(decoded)
      if (next === decoded) return destination
      decoded = next
    }
  } catch {
    return fallback
  }
  return fallback
}
