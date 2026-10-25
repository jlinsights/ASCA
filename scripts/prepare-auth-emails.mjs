/** Local/CI fixture configuration only. Never calls the hosted Management API. */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { recoveryEmailTemplate, RECOVERY_EMAIL_SUBJECT } from '../lib/auth/recovery-email.ts'

const configPath = resolve('supabase/config.toml')
let config = await readFile(configPath, 'utf8')
if (/^project_id\s*=\s*"[^"\n]+"/m.test(config) === false)
  throw Error('Local Supabase configuration required')
await mkdir(resolve('supabase/.temp/auth-templates'), { recursive: true })
await writeFile(resolve('supabase/.temp/auth-templates/recovery.html'), recoveryEmailTemplate())
if (!config.includes('[auth.email]'))
  config +=
    '\n[auth.email]\nenable_confirmations = true\nsecure_password_change = true\notp_expiry = 3600\nmax_frequency = "1s"\n'
if (!config.includes('[auth.email.template.recovery]'))
  config += `\n[auth.email.template.recovery]\nsubject = ${JSON.stringify(RECOVERY_EMAIL_SUBJECT)}\ncontent_path = "./supabase/.temp/auth-templates/recovery.html"\n`
if (!config.includes('additional_redirect_urls'))
  config = config.replace(
    /^(site_url\s*=.*)$/m,
    '$1\nadditional_redirect_urls = ["http://127.0.0.1:3105/auth/callback**", "http://localhost:3105/auth/callback**"]\nminimum_password_length = 12'
  )
await writeFile(configPath, config)
console.log('Local recovery template prepared: Korean subject, one-hour link, office contact.')
