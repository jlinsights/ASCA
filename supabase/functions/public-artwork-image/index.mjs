/* global Deno */
import { createClient } from 'npm:@supabase/supabase-js@2.53.0'
import { publicArtworkImage } from '../_shared/public-artwork-image.mjs'

const key = Deno.env.get('SUPABASE_ANON_KEY') || ''
// This is a configuration guard, not token authentication. The platform-provided
// key must represent anon; the handler must never inherit service privileges.
const payload = key.split('.')[1]?.replaceAll('-', '+').replaceAll('_', '/')
if (!payload || JSON.parse(atob(payload)).role !== 'anon')
  throw Error('Anon configuration required')
const anon = createClient(Deno.env.get('SUPABASE_URL'), key, {
  auth: { persistSession: false, autoRefreshToken: false },
})
Deno.serve(request => publicArtworkImage(request, anon))
