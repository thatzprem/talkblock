# Feedback System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let authenticated users submit feedback (bug reports, feature requests, general feedback) stored in Supabase, with 1-per-account-per-day rate limiting.

**Architecture:** A `feedback` Supabase table stores submissions tied to `user_id` + `account_name`. A single `POST /api/feedback` route handles auth, rate limiting, and insertion. A `FeedbackDialog` component in the footer provides the UI.

**Tech Stack:** Supabase (storage), Next.js API route, shadcn Dialog + Textarea + Select, JWT auth (existing pattern)

---

### Task 1: Create Supabase migration for feedback table

**Files:**
- Create: `supabase/migrations/20250217000000_feedback.sql`

**Step 1: Write the migration**

```sql
CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  account_name text NOT NULL,
  chain_id text,
  category text NOT NULL CHECK (category IN ('bug', 'feature', 'general')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
```

**Step 2: Apply the migration**

Run: `npx supabase db push --linked`

**Step 3: Commit**

```bash
git add supabase/migrations/20250217000000_feedback.sql
git commit -m "feat: add feedback table migration"
```

---

### Task 2: Create the API route

**Files:**
- Create: `app/api/feedback/route.ts`
- Reference: `app/api/bookmarks/route.ts` (auth pattern), `lib/supabase/server.ts` (admin client)

**Step 1: Write the API route**

The route:
1. Extracts `user_id` from JWT (same `getUserId` pattern as bookmarks)
2. Validates `category` and `message` from request body
3. Checks rate limit: query `feedback` table for rows with same `user_id` + today's date
4. If limit reached, return 429
5. Otherwise, insert and return 201

```typescript
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
```

**Step 2: Commit**

```bash
git add app/api/feedback/route.ts
git commit -m "feat: add feedback API route with rate limiting"
```

---

### Task 3: Create the FeedbackDialog component

**Files:**
- Create: `components/feedback/feedback-dialog.tsx`
- Reference: `components/billing/purchase-credits-dialog.tsx` (dialog pattern)

**Step 1: Write the component**

The dialog:
1. Uses shadcn Dialog, Button, Textarea, Label
2. Category selector with 3 options (Bug Report, Feature Request, General Feedback)
3. Message textarea with 2000 char limit
4. Submit button — disabled without wallet, shows loading state
5. Success/error states
6. Resets on close

```tsx
"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Check, AlertCircle, MessageSquare } from "lucide-react"
import { useWallet } from "@/lib/stores/wallet-store"
import { useChain } from "@/lib/stores/chain-store"

const CATEGORIES = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "general", label: "General Feedback" },
]

type SubmitState = "idle" | "submitting" | "success" | "error"

export function FeedbackDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { accountName } = useWallet()
  const { chainInfo } = useChain()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState("general")
  const [message, setMessage] = useState("")
  const [state, setState] = useState<SubmitState>("idle")
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!message.trim() || !accountName) return
    setState("submitting")
    setError("")

    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          category,
          message: message.trim(),
          accountName,
          chainId: chainInfo?.chain_id || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit")

      setState("success")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit")
      setState("error")
    }
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setState("idle")
      setError("")
      setMessage("")
      setCategory("general")
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => v ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0">
            <MessageSquare className="h-3 w-3" />
            <span>Feedback</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
        </DialogHeader>

        {state === "success" ? (
          <div className="text-center py-6 space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="font-medium">Thanks for your feedback!</p>
              <p className="text-sm text-muted-foreground mt-1">
                We appreciate you taking the time to help improve Talkblock.
              </p>
            </div>
            <Button onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {!accountName && (
              <div className="flex items-center gap-2 text-sm text-amber-500 bg-amber-500/10 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Connect a wallet to submit feedback.</span>
              </div>
            )}

            <div>
              <Label className="mb-2 block">Category</Label>
              <div className="flex gap-2">
                {CATEGORIES.map((c) => (
                  <Button
                    key={c.value}
                    variant={category === c.value ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setCategory(c.value)}
                  >
                    {c.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Message</Label>
              <Textarea
                placeholder="Tell us what's on your mind..."
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {message.length}/2000
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!accountName || !message.trim() || state === "submitting"}
            >
              {state === "submitting" ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Commit**

```bash
git add components/feedback/feedback-dialog.tsx
git commit -m "feat: add feedback dialog component"
```

---

### Task 4: Add Feedback link to the footer

**Files:**
- Modify: `components/layout/app-shell.tsx:39-50`

**Step 1: Add the FeedbackDialog to the footer**

Import `FeedbackDialog` and add it between the disclaimer and GitHub link:

```tsx
import { FeedbackDialog } from "@/components/feedback/feedback-dialog"
```

Update the footer to:
```tsx
<footer className="border-t px-4 py-1.5 flex items-center justify-between text-[11px] text-muted-foreground/60 shrink-0">
  <span>Talkblock is experimental. AI responses may be inaccurate. Always verify transactions before signing.</span>
  <div className="flex items-center gap-3 shrink-0 ml-4">
    <FeedbackDialog />
    <a
      href="https://github.com/sdabas9/talkblock"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      <Github className="h-3 w-3" />
      <span>GitHub</span>
    </a>
  </div>
</footer>
```

**Step 2: Commit**

```bash
git add components/layout/app-shell.tsx
git commit -m "feat: add feedback link to footer"
```
