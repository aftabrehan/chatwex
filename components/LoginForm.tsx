'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginForm({
  callbackUrl,
  demoEmail,
  demoPassword,
}: {
  callbackUrl: string
  demoEmail: string
  demoPassword: string
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const data = new FormData(event.currentTarget)
    try {
      const result = await signIn('credentials', {
        email: data.get('email'),
        password: data.get('password'),
        redirect: false,
        callbackUrl,
      })
      if (result?.error || !result?.ok)
        setError('Unable to sign in. Check your credentials and try again.')
      else window.location.assign(callbackUrl)
    } catch {
      setError('Unable to sign in. Please try again.')
    } finally {
      setPending(false)
    }
  }
  return (
    <section className="w-full max-w-md space-y-6 rounded-xl border p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Sign in to Chatwex</h1>
      <Button
        className="w-full"
        onClick={() => signIn('google', { callbackUrl })}
      >
        Continue with Google
      </Button>
      <form onSubmit={login} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <Button className="w-full" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      {demoEmail && demoPassword && (
        <aside className="rounded-lg bg-indigo-50 p-4 text-sm text-indigo-950 space-y-2">
          <p className="font-semibold">Try the demo</p>
          <p>
            Use these public credentials to explore the portfolio demo. This is
            a shared account.
          </p>
          <p>
            Email: <code className="break-all">{demoEmail}</code>
          </p>
          <p>
            Password: <code className="break-all">{demoPassword}</code>
          </p>
        </aside>
      )}
    </section>
  )
}
