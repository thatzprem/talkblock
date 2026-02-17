import { createAdminClient } from "@/lib/supabase/server"
import jwt from "jsonwebtoken"

function getUserId(req: Request): string | null {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as { sub: string }
    return decoded.sub
  } catch { return null }
}

const VALID_CATEGORIES = ["bug", "feature", "general"]

export async function POST(req: Request) {
  const userId = getUserId(req)
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createAdminClient()
  if (!supabase) return Response.json({ error: "Service unavailable" }, { status: 503 })

  const body = await req.json()
  const { category, message, accountName, chainId } = body

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return Response.json({ error: "Invalid category" }, { status: 400 })
  }
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return Response.json({ error: "Message is required" }, { status: 400 })
  }
  if (message.length > 2000) {
    return Response.json({ error: "Message too long (max 2000 characters)" }, { status: 400 })
  }

  // Rate limit: 1 feedback per user per day
  const today = new Date().toISOString().slice(0, 10)
  const { count } = await supabase
    .from("feedback")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", `${today}T00:00:00Z`)
    .lt("created_at", `${today}T23:59:59.999Z`)

  if ((count ?? 0) >= 1) {
    return Response.json({ error: "You can submit one feedback per day" }, { status: 429 })
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: userId,
    account_name: accountName || null,
    chain_id: chainId || null,
    category,
    message: message.trim(),
  })

  if (error) return Response.json({ error: "Failed to submit feedback" }, { status: 500 })
  return Response.json({ success: true }, { status: 201 })
}
