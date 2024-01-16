'use client'

import { useRouter } from 'next/navigation'

import { Button } from './ui/button'

import { useSubscriptionStore } from '@/store/store'

function UpgradeBanner() {
  const subscription = useSubscriptionStore(state => state.subscription)

  const isPro = subscription?.status === 'active'
  const router = useRouter()

  if (subscription === undefined || isPro) return null

  return (
    <Button
      onClick={() => router.push('/register')}
      className="w-full rounded-none bg-gradient-to-r from-[#7775D6] to-[#E935C1] text-center text-white px-5 py-2 hover:from-[#7775D6] hover:to-[#E935C1] hover:shadow-md hover:opacity-75 transition-all"
    >
      Upgrade to PRO to unlock all features!
    </Button>
  )
}

export default UpgradeBanner
