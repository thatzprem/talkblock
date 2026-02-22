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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req)
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const updates: Record<string, unknown> = {}
  if (body.label !== undefined) updates.label = body.label
  if (body.result !== undefined) updates.result = body.result

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "Nothing to update" }, { status: 400 })
  }

  const supabase = createAdminClient()!
  const { error } = await supabase
    .from("bookmarks")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)

  if (error) return Response.json({ error: "Failed to update bookmark" }, { status: 500 })
  return Response.json({ success: true })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req)
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()!

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) return Response.json({ error: "Failed to delete bookmark" }, { status: 500 })
  return Response.json({ success: true })
}
