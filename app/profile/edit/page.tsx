import { Suspense } from 'react'
import { ProfileEditClient } from './profile-edit-client'

export default function ProfileEditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProfileEditClient />
    </Suspense>
  )
}
