import { redirect } from 'next/navigation'

export default function ArtworkUploadPage() {
  // Use the real private Storage + owner-validated submission flow.
  redirect('/archive/submit')
}
