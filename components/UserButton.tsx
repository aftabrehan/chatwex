'use client'

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
  const subscription = useSubscriptionStore(state => state.subscription)

  if (!session)
    return (
      <Button variant="outline" onClick={() => signIn()}>
        Sign In
      </Button>
    )

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

          <DropdownMenuItem onClick={() => signOut()}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  )
}

export default UserButton
