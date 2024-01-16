'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MessageSquarePlusIcon } from 'lucide-react'
import { getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'

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
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const subscription = useSubscriptionStore(state => state.subscription)

  const createNewChat = async () => {
    if (!session?.user.id) return
    setLoading(true)

    toast({
      title: 'Creating new chat...',
      description: 'Hold tight while we generate your new chat...',
      duration: 3000,
    })

    const noOfChats = (
      await getDocs(chatMembersCollectionGroupRef(session.user.id))
    ).docs.map(doc => doc.data()).length

    const isPro = subscription?.status === 'active'

    if (!isPro && noOfChats >= 3) {
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

    const chatId = uuidv4()
    await setDoc(addChatRef(chatId, session.user.id), {
      userId: session.user.id!,
      email: session.user.email!,
      timestamp: serverTimestamp(),
      isAdmin: true,
      chatId: chatId,
      image: session.user.image || '',
    })
      .then(() => {
        toast({
          title: 'Success',
          description: 'Your chat has been created',
          className: 'bg-green-600 text-white',
          duration: 2000,
        })
        router.push(`/chat/${chatId}`)
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'There was an error creating your chat!',
          variant: 'destructive',
        })
      })
      .finally(() => setLoading(false))
  }

  if (isLarge)
    return (
      <Button variant={'default'} onClick={createNewChat}>
        {loading ? <LoadingSpinner /> : 'Create a New Chat'}
      </Button>
    )

  return (
    <Button onClick={createNewChat} variant={'ghost'}>
      <MessageSquarePlusIcon />
    </Button>
  )
}

export default CreateChatButton
