import 'server-only'
import { requireEnv } from '@/lib/env'
import { timingSafeEqual } from 'node:crypto'
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

import { adminAuth, adminDB } from './firebase-admin'
import { FirestoreAdapter } from '@auth/firebase-adapter'

export const authOptions: NextAuthOptions = {
  secret: requireEnv('NEXTAUTH_SECRET'),
  pages: { signIn: '/login' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = {
          id: 'demo_user_id',
          name: 'Demo User',
          email: process.env.DEMO_USER_EMAIL!,
          image:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=72&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
        }

        const expected = process.env.DEMO_USER_PASSWORD
        if (
          !expected ||
          !process.env.DEMO_USER_EMAIL ||
          credentials?.email !== user.email ||
          !credentials.password
        )
          return null
        const supplied = Buffer.from(credentials.password)
        const stored = Buffer.from(expected)
        if (
          supplied.length !== stored.length ||
          !timingSafeEqual(supplied, stored)
        )
          return null
        await adminDB
          .collection('users')
          .doc(user.id)
          .set(user, { merge: true })
        return user
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        if (token.sub) {
          session.user.id = token.sub

          const firebaseToken = await adminAuth.createCustomToken(token.sub)
          session.firebaseToken = firebaseToken
        }
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  adapter: FirestoreAdapter(adminDB),
} satisfies NextAuthOptions
