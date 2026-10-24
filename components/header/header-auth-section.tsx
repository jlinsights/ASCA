'use client'

import Link from 'next/link'
import { useAccount } from '@/components/auth/session-provider'
import { Button } from '../ui/button'
import { useLanguage } from '@/contexts/language-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { LogOut, User as UserIcon, Settings } from 'lucide-react'

export function HeaderAuthSection() {
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
    return <div className='w-8 h-8 rounded-full bg-muted animate-pulse' />
  }

  if (!isSignedIn || !user) {
    return (
      <div className='flex items-center space-x-3'>
        <Button asChild variant='ghost' size='sm'>
          <Link href='/sign-in'>{t('siteSignIn')}</Link>
        </Button>
        <Button asChild size='sm'>
          <Link href='/sign-up'>{t('siteSignUp')}</Link>
        </Button>
      </div>
    )
  }

  const userInitial = user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={undefined} alt={user.displayName || ''} />
            <AvatarFallback className='bg-celadon-green text-white'>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {user.displayName || t('siteMyAccount')}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href='/profile' className='cursor-pointer'>
            <UserIcon className='mr-2 h-4 w-4' />
            <span>{t('siteProfile')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/profile/applications' className='cursor-pointer'>
            <Settings className='mr-2 h-4 w-4' />
            <span>{t('siteMyApplications')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void signOut().catch(() => {})}
          className='cursor-pointer text-scholar-red'
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>{t('siteSignOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
