import { seedMembershipTiers } from './seed-membership-tiers'
import { seedPartners } from './seed-partners'
import { seedContestResults } from './seed-contest-results'

async function main() {
  const args = process.argv.slice(2)
  const target = args[0]

  try {
    if (!target || target === 'all') {
      await seedMembershipTiers()
      await seedPartners()
      await seedContestResults()
    } else if (target === 'membership') {
      await seedMembershipTiers()
    } else if (target === 'partners') {
      await seedPartners()
    } else if (target === 'contest') {
      await seedContestResults()
    } else {
      console.error(`❌ Unknown seed target: ${target}`)
      console.log('Usage: npx tsx lib/db/seed [all|membership|partners|contest]')
      process.exit(1)
    }

    console.log('\n🎉 Seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

main()
