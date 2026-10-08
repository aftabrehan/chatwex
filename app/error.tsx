'use client'
import { Button } from '@/components/ui/button'
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <main className="flex-1 p-8 text-center space-y-4">
      <h1 className="text-xl font-semibold">Unable to load this page</h1>
      <p>Please check your connection and try again.</p>
      <Button onClick={retry}>Try again</Button>
    </main>
  )
}
