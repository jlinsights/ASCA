import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase Server Client Service
 *
 * Uses singleton pattern similar to devAuth for easier mocking in tests.
 * Export as an object so its methods can be mocked by assigning jest.fn().
 */
class SupabaseServerService {
  /**
   * Creates a Supabase server client with cookie-based session management
   */
  async createClient(): Promise<SupabaseClient> {
    const cookieStore = await cookies()

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
  }
}

// Export singleton instance for use throughout the application
export const supabaseServer = new SupabaseServerService()

// For backward compatibility, export createClient as a method reference
// This allows both patterns: supabaseServer.createClient() and createClient()
export const createClient = supabaseServer.createClient.bind(supabaseServer)