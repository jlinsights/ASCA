'use client'

import Link from 'next/link'
import { useAccount } from '@/components/auth/session-provider'
import { Button } from '../ui/button'
import { useLanguage } from '@/contexts/language-context'
import { LogOut } from 'lucide-react'

interface HeaderMobileAuthProps {
  onCloseMenu: () => void
}

export function HeaderMobileAuth({ onCloseMenu }: HeaderMobileAuthProps) {
  const { isLoaded, isSignedIn, user, signOut, error, refresh } = useAccount()
  const { t } = useLanguage()

  if (error)
    return (
      <div role='alert' className='text-sm text-destructive'>
        {t('authNativeSessionError')}{' '}
        <button onClick={() => void refresh()}>{t('authNativeRetry')}</button>
      </div>
    )

  if (!isLoaded) {
    return (
      <div className='border-t border-[#222222]/10 dark:border-[#fcfcfc]/10 pt-4 mt-4'>
        <div className='h-12 bg-muted animate-pulse rounded' />
      </div>
    )
  }

  return (
    <div className='border-t border-[#222222]/10 dark:border-[#fcfcfc]/10 pt-4 mt-4'>
      {isSignedIn && user ? (
        <div className='space-y-3'>
          <div className='p-3 bg-muted/50 rounded-lg'>
            <p className='text-sm font-medium text-foreground mb-1'>
              {user.displayName || t('siteSignedIn')}
            </p>
            <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
          </div>
          <Link href='/profile'>
            <Button variant='outline' className='w-full justify-start' onClick={onCloseMenu}>
              {t('siteProfile')}
            </Button>
          </Link>
          <Link href='/profile/applications'>
            <Button variant='outline' className='w-full justify-start' onClick={onCloseMenu}>
              {t('siteMyApplications')}
            </Button>
          </Link>
          <Button
            variant='outline'
            className='w-full justify-start text-scholar-red hover:bg-scholar-red/10'
            onClick={() => {
              void signOut().catch(() => {})
              onCloseMenu()
            }}
          >
            <LogOut className='mr-2 h-4 w-4' />
            {t('siteSignOut')}
          </Button>
        </div>
      ) : (
        <div className='space-y-3'>
          <Button asChild variant='outline' className='w-full justify-start'>
            <Link href='/sign-in' onClick={onCloseMenu}>
              {t('siteSignIn')}
            </Link>
          </Button>
          <Button asChild className='w-full justify-start'>
            <Link href='/sign-up' onClick={onCloseMenu}>
              {t('siteSignUp')}
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
