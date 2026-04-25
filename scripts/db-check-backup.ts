/* eslint-disable no-console */
import readline from 'readline'

const isProduction = process.env.NODE_ENV === 'production'
const forceMigration = process.env.FORCE_MIGRATION === 'true'

async function checkBackup() {
  console.log('\x1b[36m%s\x1b[0m', '🔍 Database Safety Check Initiated...')

  if (isProduction) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      '⚠️  WARNING: YOU ARE ABOUT TO RUN A DATABASE MIGRATION IN PRODUCTION!'
    )

    if (forceMigration) {
      console.log('\x1b[33m%s\x1b[0m', '⚡ FORCE_MIGRATION flag detected. Proceeding with caution.')
      return process.exit(0)
    }

    console.log(
      '\x1b[33m%s\x1b[0m',
      '🛑 Have you created a snapshot/backup of the production database?'
    )

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    try {
      const answer = await new Promise<string>(resolve => {
        rl.question('Type "CONFIRM_BACKUP" to proceed: ', resolve)
      })

      if (answer === 'CONFIRM_BACKUP') {
        console.log('\x1b[32m%s\x1b[0m', '✅ Confirmation received. Proceeding with migration...')
        process.exit(0)
      } else {
        console.log('\x1b[31m%s\x1b[0m', '❌ Verification failed. Migration aborted.')
        process.exit(1)
      }
    } finally {
      rl.close()
    }
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✅ Development environment detected. Proceeding safely.')
    process.exit(0)
  }
}

checkBackup().catch(err => {
  console.error(err)
  process.exit(1)
})
