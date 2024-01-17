'use client'

import { useState } from 'react'
import { Session } from 'next-auth'
import { signIn, signOut } from 'next-auth/react'
import { StarIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import UserAvatar from './UserAvatar'
import { Button } from './ui/button'
import LoadingSpinner from './LoadingSpinner'
import ManageAccountButton from './ManageAccountButton'

import { useSubscriptionStore } from '@/store/store'

function UserButton({ session }: { session: Session | null }) {
  const [isLoading, setIsLoading] = useState({
    credentials: false,
    google: false,
  })

  const subscription = useSubscriptionStore(state => state.subscription)

  if (!session) {
    const handleLogin = async (type: 'credentials' | 'google') => {
      setIsLoading({ ...isLoading, [type]: true })
      await signIn(type)
      setIsLoading({ ...isLoading, [type]: false })
    }

    return (
      <>
        <Button variant="outline" onClick={() => handleLogin('credentials')}>
          {isLoading.credentials ? <LoadingSpinner /> : 'Demo Login'}
        </Button>
        <Button onClick={() => handleLogin('google')}>
          {isLoading.google ? <LoadingSpinner /> : 'Sign In'}
        </Button>
      </>
    )
  }

  return (
    session && (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <UserAvatar name={session.user?.name} image={session.user?.image} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {subscription === undefined && (
            <DropdownMenuItem>
              <LoadingSpinner />
            </DropdownMenuItem>
          )}

          {subscription?.status === 'active' && (
            <>
              <DropdownMenuLabel className="text-xs flex items-center space-x-1 text-[#E935C1] animate-pulse">
                <StarIcon fill="#E935C1" />
                <p>Pro Member</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ManageAccountButton />
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  )
}

export default UserButton
