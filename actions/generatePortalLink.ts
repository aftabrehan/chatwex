'use server'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'

import { adminDB } from '@/firebase-admin'
import { authOptions } from '@/auth'

export async function generatePortalLink() {
  const session = await getServerSession(authOptions)

  if (!session?.user.id) return console.error('No user Id found')

  const {
    user: { id },
  } = session

  if (id === 'demo_user_id')
    throw new Error('Billing is unavailable for the shared demo account')
  const origin = process.env.NEXTAUTH_URL
  if (!origin) throw new Error('NEXTAUTH_URL is required')
  const returnUrl = new URL('/register', origin).toString()
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const doc = await adminDB.collection('customers').doc(id).get()

  if (!doc.exists || !doc.data()?.stripeId)
    return console.error('No customer record found with userId: ', id)
  const stripeId = doc.data()!.stripeId

  const stripeSession = await stripe.billingPortal.sessions.create({
    customer: stripeId,
    return_url: returnUrl,
  })

  redirect(stripeSession.url)
}
