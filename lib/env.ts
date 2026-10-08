import 'server-only'

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value)
    throw new Error(
      `Missing required environment variable: ${name}. Check .env.local against .env.example.`
    )
  return value
}
