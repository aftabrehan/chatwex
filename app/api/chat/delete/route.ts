import { NextResponse } from 'next/server'
import { adminDb } from '@/firebase-admin'

export async function DELETE(req: Request) {
  const { chatId } = await req.json()

  const ref = adminDb.collection('chats').doc(chatId)

  const bulkWritter = adminDb.bulkWriter()
  const MAX_RETRY_ATTEMPTS = 5

  bulkWritter.onWriteError(error => {
    if (error.failedAttempts < MAX_RETRY_ATTEMPTS) {
      return true
    } else {
      console.log('Failed write at document: ', error.documentRef.path)
      return false
    }
  })

  try {
    await adminDb.recursiveDelete(ref, bulkWritter)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Promise rejected: ', error)
    return NextResponse.json({ succes: false }, { status: 500 })
  }
}
