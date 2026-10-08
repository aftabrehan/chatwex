# Chatwex

Portfolio chat app with Google and demo sign-in, Firebase chat and translation,
Stripe test subscriptions, Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Local setup

Use Node.js 24 (`nvm use`) and npm. Node.js 22.12 or newer is required.

1. Copy `.env.example` to `.env.local` and fill in your demo/test service configuration.
2. Run `npm ci`.
3. Run `npm run dev` and open http://localhost:3000.

Production verification: `npm run build`, then `npm start`.
Checks: `npm run lint`, `npm run typecheck`, and `npm test`.

Use `/login` for Google sign-in or enter the demo credentials displayed in the
bottom tip box. The demo is a public, shared account. Do not store private data
there. Its stable Firebase UID is retained so existing portfolio chats remain
available. Rotating the local demo password and NextAuth secret does not change
Vercel's environment; production rotation belongs to the deployment step.

## Service configuration

- `NEXTAUTH_URL` must match the app origin. Local default: `http://localhost:3000`.
- Register `http://localhost:3000/api/auth/callback/google` in the Google OAuth client.
- Firebase Admin service-account values stay server-only. The browser SDK uses
  the explicit `NEXT_PUBLIC_FIREBASE_*` values from the same Firebase project.
- Firebase must allow custom-token authentication. Firestore rules must permit
  each signed-in user to read their own customer/subscription documents and
  chats in which they are a member. Writes must enforce membership and admin
  restrictions independently of the UI. Existing cloud rules are not managed
  by this repository and require console review before deployment.
- Collection-group queries on `members.userId` require the corresponding
  Firestore index. Firestore supplies a console link if an index is missing.
- Stripe configuration needs `STRIPE_SECRET_KEY` in test mode and
  `NEXT_PUBLIC_STRIPE_PRICE_ID` containing a `price_` identifier. The Firebase
  Stripe payments extension and billing portal must be configured. The shared
  demo account cannot use billing; Google accounts can exercise test checkout.
- Translation requires the existing Firebase translation extension to be active.

Public variables are baked into the browser bundle. Rebuild after changing them.
The demo tip is rendered from server environment values, not Next.js `env` injection.

## Dependency audit

The upgrade uses native `fetch` for application HTTP requests. Axios is absent.
Google's distinct `gaxios` transport remains inside the Firebase dependency tree.

`npm audit --omit=dev` reports no production dependency vulnerabilities at the
verified lockfile. The full audit retains five high-severity entries in the
Next.js ESLint chain (`eslint-config-next` → `@next/eslint-plugin-next` →
`fast-glob` → `micromatch` → `braces`). The underlying advisory
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
has no patched `braces` release at verification time. Keep the official lint rules
and recheck when upstream releases a fix; do not downgrade Next.js or disable
rules to hide the finding.

Firebase Admin remains on 13.10 because the current official authentication
adapter supports majors 12 and 13. ESLint remains on 9.39 because Next.js's React,
accessibility, and import plugins do not declare ESLint 10 compatibility.
Security overrides select patched gRPC and CommonJS-compatible UUID releases;
clean installation, authorization tests, and live Firebase login/reads verify them.

Vercel deployment is deferred until the local work is reviewed. Copy the new
public variable names and rotated demo/NextAuth values into Vercel before the
later deployment, then validate OAuth, Firestore rules/indexes, translation,
and Stripe test checkout there.

## Local verification notes

Lint, TypeScript, ten deletion-authorization regression tests, clean `npm ci`,
and the production build pass. Local HTTP demo sign-in, NextAuth session creation,
Firebase acceptance of the issued custom token, and authenticated chat rendering
return successful responses. Stripe's configured price is active in test mode.
The user also confirmed demo login and chat-list loading in their regular browser.
The in-app automation browser encountered a Firebase `auth/network-request-failed`
error with both Turbopack and Webpack production builds; this does not reproduce
in the user's regular browser. Google OAuth, new-message translation, invitations,
and a complete Stripe test checkout still require functional verification with
appropriate test accounts and the configured cloud extensions.

The build also accepts the legacy Vercel `FIREBASE_*` browser configuration and
`STRIPE_PRO_MEMBERSHIP_PRODUCT_ID` names through an explicit public-only mapping
in `next.config.js`. Explicit `NEXT_PUBLIC_*` values take precedence. Service-account
keys, OAuth secrets, Stripe secrets, and session/demo credentials are excluded
from this mapping. This supports existing deployments during the env-name migration.
