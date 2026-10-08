'use client'

import { useFirebaseReady } from '@/components/FirebaseAuthProvider'
import { useEffect, useState } from 'react'
import { getDocs } from 'firebase/firestore'

import { chatMemberAdminRef } from '@/lib/converters/ChatMembers'

function useAdminId({ chatId }: { chatId: string }) {
  const ready = useFirebaseReady()
  const [adminId, setAdminId] = useState<string>('')

  useEffect(() => {
    if (!ready) return
    let active = true
    const fetchAdminStatus = async () => {
      const adminId = (await getDocs(chatMemberAdminRef(chatId))).docs.map(
        (doc) => doc.id
      )[0]

      if (active) setAdminId(adminId ?? '')
    }

    void fetchAdminStatus().catch(() => {
      if (active) setAdminId('')
    })
    return () => {
      active = false
    }
  }, [chatId, ready])

  return adminId
}

export default useAdminId
