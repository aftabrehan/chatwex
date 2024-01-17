import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

import { adminAuth, adminDB } from './firebase-admin'
import { FirestoreAdapter } from '@auth/firebase-adapter'

// @ts-ignore
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'johndoe' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize() {
        const user = {
          id: '1',
          name: 'John Doe',
          email: 'johndoe@example.com',
          image:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=72&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
        }

        if (user) return user
        else return null
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
  // @ts-ignore
  adapter: FirestoreAdapter(adminDB),
} satisfies NextAuthOptions
