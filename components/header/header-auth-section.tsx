'use client'

import Link from 'next/link'
import { useUser, useClerk, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '../ui/button'
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
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()

  if (!isLoaded) {
    return (
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'var(--framer-surface-1)',
          animation: 'pulse 2s infinite',
        }}
      />
    )
  }

  if (!isSignedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SignInButton mode='redirect'>
          <button className='btn-framer-secondary' style={{ padding: '8px 14px', minHeight: '36px' }}>
            로그인
          </button>
        </SignInButton>
        <SignUpButton mode='redirect'>
          <button className='btn-framer-primary' style={{ padding: '8px 14px', minHeight: '36px' }}>
            시작하기
          </button>
        </SignUpButton>
      </div>
    )
  }

  const userInitial =
    user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user.imageUrl} alt={user.fullName || ''} />
            <AvatarFallback className='bg-celadon-green text-white'>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{user.fullName || '내 계정'}</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href='/profile/edit' className='cursor-pointer'>
            <UserIcon className='mr-2 h-4 w-4' />
            <span>프로필</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/profile/applications' className='cursor-pointer'>
            <Settings className='mr-2 h-4 w-4' />
            <span>내 신청</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: '/' })}
          className='cursor-pointer text-scholar-red'
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
