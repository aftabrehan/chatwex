import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"
import { describe, expect, it } from "vitest"
const source = readFileSync(
  new URL("../next.config.js", import.meta.url),
  "utf8",
)
function config(env: Record<string, string>) {
  const sandboxModule = { exports: {} as { env: Record<string, string> } }
  runInNewContext(source, { module: sandboxModule, process: { env } })
  return sandboxModule.exports.env
}
describe("Vercel environment migration", () => {
  it("uses legacy cloud configuration when public names are absent", () => {
    const env = config({
      FIREBASE_API_KEY: "legacy-key",
      FIREBASE_PROJECT_ID: "demo-project",
      STRIPE_PRO_MEMBERSHIP_PRODUCT_ID: "price_test",
    })
    expect(env.NEXT_PUBLIC_FIREBASE_API_KEY).toBe("legacy-key")
    expect(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID).toBe("demo-project")
    expect(env.NEXT_PUBLIC_STRIPE_PRICE_ID).toBe("price_test")
  })
  it("prefers explicit public configuration", () => {
    expect(
      config({
        NEXT_PUBLIC_FIREBASE_API_KEY: "new-key",
        FIREBASE_API_KEY: "old-key",
      }).NEXT_PUBLIC_FIREBASE_API_KEY,
    ).toBe("new-key")
  })
  it("excludes private credentials and demo credentials from browser injection", () => {
    expect(
      config({
        FIREBASE_PRIVATE_KEY: "private-key",
        FIREBASE_CLIENT_EMAIL: "service-account",
        GOOGLE_CLIENT_SECRET: "oauth-secret",
        STRIPE_SECRET_KEY: "stripe-secret",
        NEXTAUTH_SECRET: "session-secret",
        DEMO_USER_PASSWORD: "demo-password",
      }),
    ).toEqual({})
  })
})
