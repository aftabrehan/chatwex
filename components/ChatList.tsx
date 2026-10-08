import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import ChatListRows from './ChatListRows'
import { authOptions } from '@/auth'
import { adminDB } from '@/firebase-admin'
import type { ChatMembers } from '@/lib/converters/ChatMembers'

export default async function ChatList() {
  const session = await getServerSession(authOptions)
  if (!session?.user.id) redirect('/login')
  const snapshot = await adminDB
    .collectionGroup('members')
    .where('userId', '==', session.user.id)
    .get()
  const initialChats = snapshot.docs.map((doc) => ({
    ...doc.data(),
    userId: doc.id,
    timestamp: null,
  })) as ChatMembers[]
  return <ChatListRows initialChats={initialChats} />
}
