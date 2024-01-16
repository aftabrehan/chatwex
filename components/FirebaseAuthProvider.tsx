'use client'

import { useEffect } from 'react'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { signInWithCustomToken } from 'firebase/auth'

import { auth } from '@/firebase'

async function syncFirebaseAuth(session: Session) {
  if (session && session.firebaseToken) {
    try {
      await signInWithCustomToken(auth, session.firebaseToken)
    } catch (error) {
      console.log('Error signing in with custom error token:', error)
    }
  } else auth.signOut()
}

function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) return

    syncFirebaseAuth(session)
  }, [session])
  return <>{children}</>
}

export default FirebaseAuthProvider
