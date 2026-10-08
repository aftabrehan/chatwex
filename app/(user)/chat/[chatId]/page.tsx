import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { adminDB } from '@/firebase-admin'
import type { Message } from '@/lib/converters/Message'

import AdminControls from '@/components/AdminControls'
import ChatInput from '@/components/ChatInput'
import ChatMembersBadges from '@/components/ChatMembersBadges'
import ChatMessages from '@/components/ChatMessages'

import { authOptions } from '@/auth'

type Props = { params: Promise<{ chatId: string }> }

async function ChatPage({ params }: Props) {
  const { chatId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user.id) redirect('/login')
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(chatId)) redirect('/chat?error=permission')
  const chat = adminDB.collection('chats').doc(chatId)
  const membership = await chat.collection('members').doc(session.user.id).get()
  if (!membership.exists) redirect('/chat?error=permission')
  const snapshot = await chat
    .collection('messages')
    .orderBy('timestamp', 'asc')
    .get()
  const initialMessages = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      input: data.input,
      user: data.user,
      translated: data.translated ?? null,
      timestamp: data.timestamp?.toDate() ?? null,
    }
  }) as Message[]

  return (
    <>
      <AdminControls chatId={chatId} />
      <ChatMembersBadges chatId={chatId} />

      <div className="flex-1">
        <ChatMessages
          chatId={chatId}
          session={session}
          initialMessages={initialMessages}
        />
      </div>
      <ChatInput chatId={chatId} />
    </>
  )
}

export default ChatPage
