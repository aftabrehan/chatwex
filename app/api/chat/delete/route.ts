import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { adminDB } from '@/firebase-admin'
import { authOptions } from '@/auth'

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const origin = req.headers.get('origin')
  if (origin && origin !== new URL(req.url).origin)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  let chatId: unknown
  try {
    ;({ chatId } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (typeof chatId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(chatId)) {
    return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 })
  }
  try {
    const ref = adminDB.collection('chats').doc(chatId)
    const member = await ref.collection('members').doc(session.user.id).get()
    if (!member.exists || member.data()?.isAdmin !== true)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await adminDB.recursiveDelete(ref)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Chat deletion failed:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
