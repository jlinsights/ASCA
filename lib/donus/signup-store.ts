import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.generated'
import type { SignupAccount, SignupStore, SignupSubmission } from './signups'
import { donusAdminClient } from './store'

type Admin = SupabaseClient<Database>

const ACCOUNT_PAGE = 1000
const ROW_PAGE = 1000

async function linkedAccountIds(admin: Admin) {
  const ids: string[] = []
  for (let from = 0; ; from += ROW_PAGE) {
    const { data, error } = await admin
      .from('donus_member_links')
      .select('account_id')
      .order('account_id')
      .range(from, from + ROW_PAGE - 1)
    if (error) throw new Error(`read donus_member_links failed: ${error.message}`)
    for (const row of data ?? []) ids.push(row.account_id)
    if ((data ?? []).length < ROW_PAGE) return ids
  }
}

type Attempt = { account_id: string; submitted_at: string | null; last_attempt_at: string }

async function listAttempts(admin: Admin) {
  const rows: Attempt[] = []
  for (let from = 0; ; from += ROW_PAGE) {
    const { data, error } = await admin
      .from('donus_signup_submissions')
      .select('account_id,submitted_at,last_attempt_at')
      .order('account_id')
      .range(from, from + ROW_PAGE - 1)
    if (error) throw new Error(`read donus_signup_submissions failed: ${error.message}`)
    rows.push(...(data ?? []))
    if ((data ?? []).length < ROW_PAGE) return rows
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
      const [linked, attempts] = await Promise.all([linkedAccountIds(admin), listAttempts(admin)])
      const submitted = attempts.filter(row => row.submitted_at !== null).map(row => row.account_id)
      return new Set([...linked, ...submitted])
    },

    async listFailedAttempts() {
      const attempts = await listAttempts(admin)
      return new Map(
        attempts
          .filter(row => row.submitted_at === null)
          .map(row => [row.account_id, row.last_attempt_at])
      )
    },

    async recordSubmissions(rows: SignupSubmission[]) {
      const now = new Date().toISOString()
      const { error } = await admin.from('donus_signup_submissions').upsert(
        rows.map(row => ({ ...row, submitted_at: now, last_attempt_at: now })),
        { onConflict: 'account_id' }
      )
      if (error) throw new Error(`record submissions failed: ${error.message}`)
    },

    async recordFailures(accountIds: string[]) {
      const now = new Date().toISOString()
      // 보냄 기록은 절대 덮지 않는다(실행이 겹쳐도): 새 계정은 실패 행만 넣고(있으면 건너뜀),
      // 이미 실패 행인 계정만 시도 시각을 고친다
      const inserted = await admin.from('donus_signup_submissions').upsert(
        accountIds.map(account_id => ({ account_id, last_attempt_at: now })),
        { onConflict: 'account_id', ignoreDuplicates: true }
      )
      if (inserted.error) throw new Error(`record failures failed: ${inserted.error.message}`)
      const touched = await admin
        .from('donus_signup_submissions')
        .update({ last_attempt_at: now })
        .in('account_id', accountIds)
        .is('submitted_at', null)
      if (touched.error) throw new Error(`record failures failed: ${touched.error.message}`)
    },
  }
}
