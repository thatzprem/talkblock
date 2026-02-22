"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal, Loader2 } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  isProcessing?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, isProcessing, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const handler = (e: Event) => setValue((e as CustomEvent<string>).detail)
    window.addEventListener("inject-prompt", handler)
    return () => window.removeEventListener("inject-prompt", handler)
  }, [])

  // Track elapsed time while processing
  useEffect(() => {
    if (isProcessing) {
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      setElapsed(0)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isProcessing])

  const handleSend = () => {
    if (!value.trim() || disabled || isProcessing) return
    onSend(value.trim())
    setValue("")
  }

  const statusMessage = elapsed < 8
    ? "Thinking…"
    : elapsed < 20
    ? "Fetching data from the chain…"
    : "This is taking a moment — complex queries can take up to 30s"

  return (
    <div className="border-t">
      {isProcessing && (
        <div className="px-4 pt-2 pb-0 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-1.5">
            <Loader2 className="h-3 w-3 animate-spin shrink-0 text-primary" />
            <span className="flex-1">{statusMessage}</span>
            <span className="font-mono tabular-nums shrink-0">{elapsed}s</span>
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={isProcessing ? "Waiting for response…" : (placeholder || "Ask anything about the blockchain...")}
            className="min-h-[44px] max-h-[200px] resize-none"
            rows={1}
            disabled={disabled || isProcessing}
          />
          <Button
            onClick={handleSend}
            disabled={disabled || isProcessing || !value.trim()}
            size="icon"
            className="shrink-0"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
