'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { onSnapshot } from 'firebase/firestore'

import { subscriptionRef } from '@/lib/converters/Subscription'
import { useSubscriptionStore } from '@/store/store'

function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const setSubscription = useSubscriptionStore(state => state.setSubscription)

  useEffect(() => {
    if (!session) return

    return onSnapshot(
      subscriptionRef(session?.user.id),
      snapshot => {
        if (snapshot.empty) return setSubscription(null)
        else setSubscription(snapshot.docs[0].data())
      },
      error => {
        console.log('Error getting document:', error)
      }
    )
  }, [session, setSubscription])

  return <>{children}</>
}

export default SubscriptionProvider
