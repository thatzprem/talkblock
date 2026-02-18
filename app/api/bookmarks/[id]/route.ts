import { createAdminClient } from "@/lib/supabase/server"
import { verifyToken } from "@/lib/auth/verify-token"

async function getUserId(req: Request): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  return verifyToken(token)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req)
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
