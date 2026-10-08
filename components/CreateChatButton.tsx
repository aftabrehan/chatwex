'use client'

import { useFirebaseReady } from '@/components/FirebaseAuthProvider'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MessageSquarePlusIcon } from 'lucide-react'
import { getDocs, serverTimestamp, setDoc } from 'firebase/firestore'

import { Button } from './ui/button'
import LoadingSpinner from './LoadingSpinner'
import { ToastAction } from './ui/toast'

import { useSubscriptionStore } from '@/store/store'
import { useToast } from './ui/use-toast'
import {
  addChatRef,
  chatMembersCollectionGroupRef,
} from '@/lib/converters/ChatMembers'

function CreateChatButton({ isLarge }: { isLarge?: boolean }) {
  const firebaseReady = useFirebaseReady()
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const subscription = useSubscriptionStore((state) => state.subscription)

  const createNewChat = async () => {
    if (!firebaseReady || !session?.user.id || loading) return
    setLoading(true)

    toast({
      title: 'Creating new chat...',
      description: 'Hold tight while we generate your new chat...',
      duration: 3000,
    })

    try {
      const noOfChats = (
        await getDocs(chatMembersCollectionGroupRef(session.user.id))
      ).docs.map((doc) => doc.data()).length

      const isPro = subscription?.status === 'active'

      if (!isPro && noOfChats >= 3) {
        setLoading(false)
        return toast({
          title: 'Free plan limit exceeded',
          description:
            "You've exceeded the limit of chats for the FREE plan. Plesae upgrade to PRO to continue creating chats!",
          variant: 'destructive',
          action: (
            <ToastAction
              altText="Upgrade"
              onClick={() => router.push('/register')}
            >
              Upgrade to PRO
            </ToastAction>
          ),
        })
      }

      const chatId = crypto.randomUUID()
      await setDoc(addChatRef(chatId, session.user.id), {
        userId: session.user.id!,
        email: session.user.email!,
        timestamp: serverTimestamp(),
        isAdmin: true,
        chatId: chatId,
        image: session.user.image || '',
      })

      toast({ title: 'Success', description: 'Your chat has been created' })
      router.push(`/chat/${chatId}`)
    } catch {
      toast({
        title: 'Error',
        description: 'Unable to create your chat. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLarge)
    return (
      <Button
        variant={'default'}
        onClick={createNewChat}
        disabled={loading || !firebaseReady}
      >
        {loading ? <LoadingSpinner /> : 'Create a New Chat'}
      </Button>
    )

  return (
    <Button
      onClick={createNewChat}
      disabled={loading || !firebaseReady}
      variant={'ghost'}
      aria-label="Create a new chat"
    >
      <MessageSquarePlusIcon />
    </Button>
  )
}

export default CreateChatButton
