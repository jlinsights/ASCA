'use client'

import Link from 'next/link'
import { useUser, useClerk, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '../ui/button'
import { LogOut } from 'lucide-react'

interface HeaderMobileAuthProps {
  onCloseMenu: () => void
}

export function HeaderMobileAuth({ onCloseMenu }: HeaderMobileAuthProps) {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()

  if (!isLoaded) {
    return (
      <div className='border-t border-[#222222]/10 dark:border-[#fcfcfc]/10 pt-4 mt-4'>
        <div className='h-12 bg-muted animate-pulse rounded' />
      </div>
    )
  }

  return (
    <div className='border-t border-[#222222]/10 dark:border-[#fcfcfc]/10 pt-4 mt-4'>
      {isSignedIn ? (
        <div className='space-y-3'>
          <div className='p-3 bg-muted/50 rounded-lg'>
            <p className='text-sm font-medium text-foreground mb-1'>
              {user.fullName || '로그인됨'}
            </p>
            <p className='text-xs text-muted-foreground truncate'>
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
          <Link href='/profile/edit'>
            <Button variant='outline' className='w-full justify-start' onClick={onCloseMenu}>
              프로필
            </Button>
          </Link>
          <Link href='/profile/applications'>
            <Button variant='outline' className='w-full justify-start' onClick={onCloseMenu}>
              내 신청
            </Button>
          </Link>
          <Button
            variant='outline'
            className='w-full justify-start text-scholar-red hover:bg-scholar-red/10'
            onClick={() => {
              signOut({ redirectUrl: '/' })
              onCloseMenu()
            }}
          >
            <LogOut className='mr-2 h-4 w-4' />
            로그아웃
          </Button>
        </div>
      ) : (
        <div className='space-y-3'>
          <SignInButton mode='redirect'>
            <Button variant='outline' className='w-full justify-start' onClick={onCloseMenu}>
              로그인
            </Button>
          </SignInButton>
          <SignUpButton mode='redirect'>
            <Button
              className='w-full justify-start bg-celadon-green hover:bg-celadon-green/90'
              onClick={onCloseMenu}
            >
              회원가입
            </Button>
          </SignUpButton>
        </div>
      )}
    </div>
  )
}
