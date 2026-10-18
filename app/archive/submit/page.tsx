import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { SubmissionForm } from '@/components/archive/submission-form'
export const dynamic = 'force-dynamic'
export default async function Page() {
  const identity = await archiveIdentity()
  if (!identity) return <SubmissionForm artists={[]} access='login' />
  const db = archiveWriter()
  let query = db.from('artists').select('id,name').order('name').limit(100)
  if (!identity.admin) query = query.eq('claimed_by_user_id', identity.userId)
  const { data, error } = await query
  if (error) throw error
  return <SubmissionForm artists={data} access={data.length ? 'ready' : 'unclaimed'} />
}
