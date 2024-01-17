'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { addDoc, collection, onSnapshot } from 'firebase/firestore'

import LoadingSpinner from './LoadingSpinner'
import ManageAccountButton from './ManageAccountButton'

import { useSubscriptionStore } from '@/store/store'
import { db } from '@/firebase'

function CheckoutButton() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const subscription = useSubscriptionStore(state => state.subscription)

  const isLoadingSubscription = subscription === undefined
  const isSubscribed = subscription?.status === 'active'

  const createCheckoutSession = async () => {
    if (!session?.user.id) return

    setLoading(true)

    if (session?.user.id === 'demo_user_id') {
      alert(
        'Feel free to sign out of the demo account and create a new one. After that, you can easily proceed with the upgrade.'
      )
      setLoading(false)
      return
    }

    //push a document into firestore db
    const docRef = await addDoc(
      collection(db, 'customers', session.user.id, 'checkout_sessions'),
      {
        price: process.env.STRIPE_PRO_MEMBERSHIP_PRODUCT_ID,
        success_url: window.location.origin,
        cancel_url: window.location.origin,
      }
    )

    // ... stripe extension on firebase will create a checkout session
    return onSnapshot(docRef, snap => {
      const data = snap.data()

      if (data?.error)
        alert(
          'Cant fetch membership plan details, please try again in a minute.'
        )
      if (data?.url) window.location.assign(data?.url)

      setLoading(false)
    })
  }

  return (
    <div className="flex flex-col space-y-2">
      {isSubscribed && (
        <>
          <hr className="mt-5" />
          <p className="pt-5 text-center text-xs text-indigo-600">
            You are subscribed to PRO
          </p>
        </>
      )}

      <div className="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2 text-center text-sm font-semibold leading-6 text-white shaodw-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer disabled:opacity-80 disabled:bg-indigo-600/50 disabled:text-white disabled:cursor-default">
        {isSubscribed ? (
          <ManageAccountButton />
        ) : isLoadingSubscription || loading ? (
          <LoadingSpinner />
        ) : (
          <button onClick={createCheckoutSession}>
            {session?.user.id ? 'Upgrade' : 'Sign Up'}
          </button>
        )}
      </div>
    </div>
  )
}

export default CheckoutButton
