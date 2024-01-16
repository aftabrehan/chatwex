import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getDocs } from 'firebase/firestore'

import AdminControls from '@/components/AdminControls'
import ChatInput from '@/components/ChatInput'
import ChatMembersBadges from '@/components/ChatMembersBadges'
import ChatMessages from '@/components/ChatMessages'
import { sortedMessagesRef } from '@/lib/converters/Message'

import { chatMembersRef } from '@/lib/converters/ChatMembers'
import { authOptions } from '@/auth'

type Props = { params: { chatId: string } }

async function ChatPage({ params: { chatId } }: Props) {
  const session = await getServerSession(authOptions)
  const initialMessages = (await getDocs(sortedMessagesRef(chatId))).docs.map(
    doc => doc.data()
  )

  const hasAccess = (await getDocs(chatMembersRef(chatId))).docs
    .map(doc => doc.id)
    .includes(session?.user.id!)
  if (!hasAccess) redirect('/chat?error=permission')

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
