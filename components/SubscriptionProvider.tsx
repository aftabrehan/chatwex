'use client'

import { useFirebaseReady } from '@/components/FirebaseAuthProvider'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { onSnapshot } from 'firebase/firestore'

import { subscriptionRef } from '@/lib/converters/Subscription'
import { useSubscriptionStore } from '@/store/store'

function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const firebaseReady = useFirebaseReady()
  const { data: session } = useSession()
  const setSubscription = useSubscriptionStore((state) => state.setSubscription)

  useEffect(() => {
    if (!session) {
      setSubscription(null)
      return
    }

    if (!firebaseReady) return
    return onSnapshot(
      subscriptionRef(session?.user.id),
      (snapshot) => {
        if (snapshot.empty) return setSubscription(null)
        else setSubscription(snapshot.docs[0].data())
      },
      (error) => {
        console.error('Error getting subscription:', error)
        setSubscription(null)
      }
    )
  }, [session, setSubscription, firebaseReady])

  return <>{children}</>
}

export default SubscriptionProvider
