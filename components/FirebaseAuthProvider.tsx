'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { signInWithCustomToken, signOut } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/firebase'
const FirebaseReadyContext = createContext(false)
export const useFirebaseReady = () => useContext(FirebaseReadyContext)

export default function FirebaseAuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const [user, loading] = useAuthState(auth)
  const [error, setError] = useState(false)
  const token = session?.firebaseToken
  useEffect(() => {
    if (status === 'loading' || loading) return
    let active = true
    const sync = async () => {
      try {
        if (token && auth.currentUser?.uid !== session?.user.id)
          await signInWithCustomToken(auth, token)
        else if (!token && auth.currentUser) await signOut(auth)
        if (active) setError(false)
      } catch (cause) {
        console.error(
          'Firebase authentication failed:',
          cause instanceof FirebaseError ? cause.code : 'unknown'
        )
        if (active) setError(true)
      }
    }
    void sync()
    return () => {
      active = false
    }
  }, [token, status, loading, session?.user.id])
  const ready =
    !error &&
    !loading &&
    status === 'authenticated' &&
    user?.uid === session?.user.id
  return (
    <FirebaseReadyContext.Provider value={ready}>
      {error && (
        <p role="alert" className="p-4 text-center">
          Unable to connect to live chat. Please reload and try again.
        </p>
      )}
      {children}
    </FirebaseReadyContext.Provider>
  )
}
