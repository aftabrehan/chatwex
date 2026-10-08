import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  if (await getServerSession(authOptions)) redirect('/chat')
  const { callbackUrl } = await searchParams
  const destination =
    callbackUrl?.startsWith('/') && !callbackUrl.startsWith('//')
      ? callbackUrl
      : '/chat'
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <LoginForm
        callbackUrl={destination}
        demoEmail={process.env.DEMO_USER_EMAIL ?? ''}
        demoPassword={process.env.DEMO_USER_PASSWORD ?? ''}
      />
    </main>
  )
}
