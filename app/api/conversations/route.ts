import { createAdminClient } from "@/lib/supabase/server"
import { verifyToken } from "@/lib/auth/verify-token"

async function getUserId(req: Request): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createAdminClient()!
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, chain_name, chain_endpoint, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(50)

  if (error) return Response.json({ error: "Failed to fetch conversations" }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  const userId = await getUserId(req)
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const supabase = createAdminClient()!

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      title: body.title || "New conversation",
      chain_name: body.chainName || null,
      chain_endpoint: body.chainEndpoint || null,
    })
    .select()
    .single()

  if (error) return Response.json({ error: "Failed to create conversation" }, { status: 500 })
  return Response.json(data)
}
