import { createAdminClient } from "@/lib/supabase/server"
import { verifyToken } from "@/lib/auth/verify-token"

async function getUserId(req: Request): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req)
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()!

  const { data: conv } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (!conv) return Response.json({ error: "Not found" }, { status: 404 })

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })

  return Response.json({ ...conv, messages: messages || [] })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req)
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const supabase = createAdminClient()!

  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (!conv) return Response.json({ error: "Not found" }, { status: 404 })

  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: id,
      role: body.role,
      parts: body.parts,
    })

  if (error) return Response.json({ error: "Failed to save message" }, { status: 500 })

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id)

  return Response.json({ success: true })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req)
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()!

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) return Response.json({ error: "Failed to delete" }, { status: 500 })
  return Response.json({ success: true })
}
