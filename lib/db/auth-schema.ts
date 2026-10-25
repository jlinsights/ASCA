import { sql } from 'drizzle-orm'
import { check, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// auth.users FK, triggers, grants, RLS, and RPC are defined in the reviewed SQL
// migration. Do not apply the entire legacy Drizzle schema to ASCA-2026.
export const accountProfiles = pgTable(
  'account_profiles',
  {
    id: uuid('id').primaryKey(),
    displayName: text('display_name').notNull().default(''),
    locale: text('locale', { enum: ['ko', 'en', 'ja', 'zh'] })
      .notNull()
      .default('ko'),
    role: text('role', { enum: ['member', 'admin'] })
      .notNull()
      .default('member'),
    disabledAt: timestamp('disabled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    check('account_profiles_display_name_length', sql`char_length(${table.displayName}) <= 100`),
    check('account_profiles_locale', sql`${table.locale} in ('ko', 'en', 'ja', 'zh')`),
    check('account_profiles_role', sql`${table.role} in ('member', 'admin')`),
  ]
)

/** Trusted migration mapping only; never filled from user_metadata or client input. */
export const authIdentityLinks = pgTable('auth_identity_links', {
  accountId: uuid('account_id')
    .primaryKey()
    .references(() => accountProfiles.id, { onDelete: 'cascade' }),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  linkedAt: timestamp('linked_at', { withTimezone: true }).notNull().defaultNow(),
})

export type AccountProfile = typeof accountProfiles.$inferSelect
