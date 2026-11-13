import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.generated'
import type { SignupAccount, SignupStore, SignupSubmission } from './signups'
import { donusAdminClient } from './store'

type Admin = SupabaseClient<Database>

const ACCOUNT_PAGE = 1000
const ROW_PAGE = 1000

async function pagedAccountIds(
  admin: Admin,
  table: 'donus_member_links' | 'donus_signup_submissions'
) {
  const ids: string[] = []
  for (let from = 0; ; from += ROW_PAGE) {
    const { data, error } = await admin
      .from(table)
      .select('account_id')
      .order('account_id')
      .range(from, from + ROW_PAGE - 1)
    if (error) throw new Error(`read ${table} failed: ${error.message}`)
    for (const row of data ?? []) ids.push(row.account_id)
    if ((data ?? []).length < ROW_PAGE) return ids
  }
}

/** 신규 가입 보내기용 저장소(service_role). 이메일·이름은 메모리에서만 쓴다. */
export function createSupabaseSignupStore(admin: Admin = donusAdminClient()): SignupStore {
  return {
    async listSignupAccounts(): Promise<SignupAccount[]> {
      const profiles = new Map<string, { name: string; disabled: boolean }>()
      for (let from = 0; ; from += ROW_PAGE) {
        const { data, error } = await admin
          .from('account_profiles')
          .select('id,display_name,disabled_at')
          .order('id')
          .range(from, from + ROW_PAGE - 1)
        if (error) throw new Error(`read account_profiles failed: ${error.message}`)
        for (const row of data ?? [])
          profiles.set(row.id, { name: row.display_name ?? '', disabled: row.disabled_at !== null })
        if ((data ?? []).length < ROW_PAGE) break
      }
      const accounts: SignupAccount[] = []
      for (let page = 1; ; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: ACCOUNT_PAGE })
        if (error) throw new Error(`listUsers failed: ${error.message}`)
        for (const user of data.users) {
          const profile = profiles.get(user.id)
          // 확인된 이메일·프로필이 있는 계정만 — 남의 이메일로 가입만 해 둔 계정은 보내지 않는다
          if (!profile || !user.email_confirmed_at || user.is_anonymous) continue
          accounts.push({
            id: user.id,
            email: user.email ?? null,
            name: profile.name,
            createdAt: user.created_at,
            disabled: profile.disabled,
          })
        }
        if (data.users.length < ACCOUNT_PAGE) return accounts
      }
    },

    async listHandledAccountIds() {
      const [linked, submitted] = await Promise.all([
        pagedAccountIds(admin, 'donus_member_links'),
        pagedAccountIds(admin, 'donus_signup_submissions'),
      ])
      return new Set([...linked, ...submitted])
    },

    async recordSubmissions(rows: SignupSubmission[]) {
      const now = new Date().toISOString()
      const { error } = await admin.from('donus_signup_submissions').upsert(
        rows.map(row => ({ ...row, submitted_at: now })),
        { onConflict: 'account_id' }
      )
      if (error) throw new Error(`record submissions failed: ${error.message}`)
    },
  }
}
