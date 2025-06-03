import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema-pg.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://postgres.fiaoduraycyjselasmdn:2Y6@mXc9U5gUk6A@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  },
  verbose: true,
  strict: true,
});
