'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-start bg-background px-4 pt-28 md:pt-36 pb-12'>
      <div className='w-full max-w-md'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-serif font-bold text-foreground mb-2'>회원가입</h1>
          <p className='text-muted-foreground'>새 계정을 만드세요</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-card border border-border shadow-md rounded-lg',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              formButtonPrimary: 'bg-celadon-green hover:bg-celadon-green/90',
              formFieldInput: 'bg-background border-border text-foreground',
              formFieldLabel: 'text-foreground',
              footerActionLink: 'text-celadon-green hover:text-celadon-green/80',
              socialButtonsBlockButton: 'border-border text-foreground hover:bg-muted',
              dividerLine: 'bg-border',
              dividerText: 'text-muted-foreground',
            },
          }}
        />
      </div>
    </div>
  )
}
