/** @type {import('next').NextConfig} */
module.exports = {
  // Support the existing Vercel configuration during the public-variable migration.
  // Only browser-safe SDK configuration belongs here; server credentials stay private.
  env: Object.fromEntries(
    Object.entries({
      NEXT_PUBLIC_FIREBASE_API_KEY:
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
        process.env.FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        process.env.FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID:
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
        process.env.FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        process.env.FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
        process.env.FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID:
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
      NEXT_PUBLIC_STRIPE_PRICE_ID:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ||
        process.env.STRIPE_PRO_MEMBERSHIP_PRODUCT_ID,
    }).filter(([, value]) => Boolean(value)),
  ),
  images: {
    remotePatterns: [
      "github.com",
      "lh3.googleusercontent.com",
      "images.unsplash.com",
    ].map((hostname) => ({ protocol: "https", hostname })),
  },
}
