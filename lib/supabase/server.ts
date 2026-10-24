import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

class SupabaseServerService {
  /** Routes/actions must opt into writable cookies; RSCs rely on proxy refresh. */
  async createClient({ writable = false }: { writable?: boolean } = {}) {
    const store = await cookies()
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: { secure: process.env.NODE_ENV === 'production' },
        cookies: {
          getAll: () => store.getAll(),
          setAll: values => {
            if (!writable) return
            values.forEach(({ name, value, options }) => store.set(name, value, options))
          },
        },
      }
    )
  }
}

export const supabaseServer = new SupabaseServerService()
export const createClient = supabaseServer.createClient.bind(supabaseServer)
