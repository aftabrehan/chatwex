/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: true },
  images: {
    domains: ['github.com', 'lh3.googleusercontent.com', 'images.unsplash.com'],
  },
  env: {
    DEMO_USER_PASSWORD: process.env.DEMO_USER_PASSWORD,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    STRIPE_PRO_MEMBERSHIP_PRODUCT_ID:
      process.env.STRIPE_PRO_MEMBERSHIP_PRODUCT_ID,
  },
}

module.exports = nextConfig
