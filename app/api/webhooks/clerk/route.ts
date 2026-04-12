import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let event: WebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
  }

  const eventType = event.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = event.data

    const primaryEmail = email_addresses?.find(
      e => e.id === event.data.primary_email_address_id
    )?.email_address

    const { error } = await supabaseAdmin.from('user_profiles').upsert(
      {
        clerk_user_id: id,
        email: primaryEmail,
        first_name: first_name || null,
        last_name: last_name || null,
        avatar_url: image_url || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_user_id' }
    )

    if (error) {
      console.error('Failed to sync user to Supabase:', error)
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = event.data

    if (id) {
      await supabaseAdmin
        .from('user_profiles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('clerk_user_id', id)
    }
  }

  return NextResponse.json({ success: true })
}
