# AGENTS.md

## Cursor Cloud specific instructions

### Services Overview

| Service | How to Run | Notes |
|---------|-----------|-------|
| Next.js Dev Server | `npm run dev` | Port 3000, uses Webpack mode (not Turbopack) |
| PostgreSQL | `sudo service postgresql start` | Required for DB-connected features |
| Drizzle Studio | `npm run db:studio` | Optional DB GUI |

### Environment Setup

- **PostgreSQL**: The app uses PostgreSQL (Drizzle ORM + `postgres` driver). A local PG instance is provisioned in the VM with user `asca_dev`, password `asca_dev`, database `asca_dev` on `localhost:5432`.
- **Clerk Auth**: Requires a properly formatted publishable key (`pk_test_<base64>`) where the decoded value ends with `$` and contains a `.` (e.g., `pk_test_Y2xlcmsubG9jYWxob3N0LmRldiQ=`). Invalid format causes middleware 500 errors.
- **Supabase**: Placeholder env vars are sufficient for the dev server to start; real Supabase features (auth helpers, storage) will not work without valid credentials.
- **`.env.local`** is the environment file loaded by both Next.js and Drizzle config.

### Key Gotchas

1. **`npm install --legacy-peer-deps`** is required due to React 19 + various Radix UI peer dependency conflicts.
2. **Middleware 500**: If the app returns 500 on all routes, check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is in valid format (see above).
3. **DB schema push**: Run `npx drizzle-kit push --force` to apply schema. The `npm run db:push` script also runs a backup check (`tsx scripts/db-check-backup.ts`) which may fail if no prior DB exists — use the direct drizzle-kit command in that case.
4. **Tests**: Jest tests use `jest.setup.js` which provides test env defaults. No real DB connection is needed — tests mock the DB via pg-mem. Some realtime/WebSocket tests may timeout (known issue, not blocking).
5. **Dev server startup**: `npm run dev` uses `--webpack` flag (not Turbopack) to avoid ESM conflicts with Clerk. Server is ready in ~1s.

### Common Commands

Refer to `docs/CLAUDE.md` and the project `README.md` for the full command reference. Key commands:

- **Lint**: `npm run lint`
- **Type check**: `npm run type-check`
- **Test (unit)**: `npm test`
- **Dev server**: `npm run dev`
- **DB push schema**: `npx drizzle-kit push --force`
- **Pre-commit check**: `npm run pre-commit`
