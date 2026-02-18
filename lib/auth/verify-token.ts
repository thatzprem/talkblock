import { jwtVerify } from "jose"

export async function verifyToken(token: string): Promise<string | null> {
  const secret = process.env.SUPABASE_JWT_SECRET
  if (!secret) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    return payload.sub as string
  } catch {
    return null
  }
}
