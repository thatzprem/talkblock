import { createAdminClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/check"
import { SignJWT } from "jose"

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: "Authentication unavailable. Supabase is not configured." },
      { status: 503 }
    )
  }

  const { accountName, chainId } = await req.json()

  if (!accountName || !chainId) {
    return Response.json({ error: "Missing accountName or chainId" }, { status: 400 })
  }

  const supabase = createAdminClient()!

  // Upsert profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert(
      { account_name: accountName, chain_id: chainId, display_name: accountName },
      { onConflict: "account_name,chain_id" }
    )
    .select("id")
    .single()

  if (error || !profile) {
    return Response.json({ error: "Failed to create profile" }, { status: 500 })
  }

  // Sign custom JWT for Supabase RLS
  const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!)
  const token = await new SignJWT({
    sub: profile.id,
    role: "authenticated",
    aud: "authenticated",
    iss: process.env.NEXT_PUBLIC_SUPABASE_URL + "/auth/v1",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)

  // Ensure user_settings row exists
  await supabase
    .from("user_settings")
    .upsert(
      { user_id: profile.id },
      { onConflict: "user_id" }
    )

  return Response.json({
    token,
    user: {
      id: profile.id,
      accountName,
      chainId,
    },
  })
}
