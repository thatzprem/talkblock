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
                We appreciate you taking the time to help improve TalkToXPR.
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
