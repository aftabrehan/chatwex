import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware'
import type { NextFetchEvent } from 'next/server'

const authenticate = withAuth({ pages: { signIn: '/login' } })

export default function proxy(
  request: NextRequestWithAuth,
  event: NextFetchEvent
) {
  return authenticate(request, event)
}

export const config = {
  matcher: ['/chat', '/chat/:path*', '/register'],
}
