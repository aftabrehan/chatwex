import ChatList from '@/components/ChatList'
import ChatPermissionError from '@/components/ChatPermissionError'

type Props = {
  params: {}
  searchParams: { error: string }
}

function ChatsPage({ searchParams: { error } }: Props) {
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

export default ChatsPage
