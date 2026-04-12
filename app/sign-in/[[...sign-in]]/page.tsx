'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-serif font-bold text-foreground mb-2'>로그인</h1>
          <p className='text-muted-foreground'>계정에 로그인하세요</p>
        </div>
        <SignIn
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
