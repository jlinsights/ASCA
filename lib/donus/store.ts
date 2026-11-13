import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.generated'
import type { AccountEmail, MemberLink } from './member-links'
import type { LinkStore, MemberStatus, StoredLink } from './sync'

type Admin = SupabaseClient<Database>

/** 계정 목록 한 페이지 크기(auth admin API) */
const ACCOUNT_PAGE = 1000
/** 연결 목록 한 페이지 크기(PostgREST 기본 응답 한도 이하) */
const LINK_PAGE = 1000

export function donusAdminClient(): Admin {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role unavailable')
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** donus_member_links 를 service_role 로 읽고 쓴다. 계정 이메일은 메모리에서만 쓴다. */
export function createSupabaseLinkStore(admin: Admin = donusAdminClient()): LinkStore {
  return {
    async listAccounts(): Promise<AccountEmail[]> {
      const accounts: AccountEmail[] = []
      for (let page = 1; ; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: ACCOUNT_PAGE })
        if (error) throw new Error(`listUsers failed: ${error.message}`)
        for (const user of data.users) {
          // 확인된 이메일만 대조한다 — 남의 이메일로 가입만 해 두고 연결을 가로채지 못하게
          if (user.email_confirmed_at && !user.is_anonymous)
            accounts.push({ id: user.id, email: user.email ?? null })
        }
        if (data.users.length < ACCOUNT_PAGE) return accounts
      }
    },

    async listLinks() {
      // PostgREST 응답 한도에 잘리지 않게 정렬해서 끝까지 넘긴다 — 빠진 manual 연결이 덮이지 않게
      const links: StoredLink[] = []
      for (let from = 0; ; from += LINK_PAGE) {
        const { data, error } = await admin
          .from('donus_member_links')
          .select(
            'account_id,member_idx,member_code,link_source,dues_paid_year,dues_history_checked,synced_at'
          )
          .order('account_id')
          .range(from, from + LINK_PAGE - 1)
        if (error) throw new Error(`read links failed: ${error.message}`)
        for (const row of data ?? [])
          links.push({
            ...row,
            link_source: row.link_source === 'manual' ? 'manual' : 'email',
          })
        if ((data ?? []).length < LINK_PAGE) return links
      }
    },

    async removeLinks(accountIds: string[]) {
      const { error } = await admin
        .from('donus_member_links')
        .delete()
        .in('account_id', accountIds)
        .eq('link_source', 'email')
      if (error) throw new Error(`remove links failed: ${error.message}`)
    },

    async upsertLinks(links: MemberLink[]) {
      const now = new Date().toISOString()
      const { error } = await admin.from('donus_member_links').upsert(
        links.map(link => ({ ...link, linked_at: now, synced_at: now })),
        { onConflict: 'account_id' }
      )
      if (error) throw new Error(`upsert links failed: ${error.message}`)
    },

    async updateStatuses(statuses: MemberStatus[]) {
      const now = new Date().toISOString()
      for (const { account_id, ...status } of statuses) {
        const { error } = await admin
          .from('donus_member_links')
          .update({ ...status, synced_at: now })
          .eq('account_id', account_id)
        if (error) throw new Error(`update status failed: ${error.message}`)
      }
    },
  }
}
