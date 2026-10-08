import ChatList from '@/components/ChatList'
import ChatPermissionError from '@/components/ChatPermissionError'
export default async function ChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <div>
      {error && (
        <div className="m-2">
          <ChatPermissionError />
        </div>
      )}
      <ChatList />
    </div>
  )
}
