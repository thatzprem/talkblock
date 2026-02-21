"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Sparkles, Rocket, User, Coins, Link2, ArrowLeftRight, ChevronRight } from "lucide-react"
import { useWallet } from "@/lib/stores/wallet-store"

const CATEGORIES = [
  {
    label: "Getting Started",
    icon: Rocket,
    prompts: [
      { label: "What can you help with?", text: "What can you help me do on XPR Network?" },
      { label: "Explain XPR Network", text: "What is XPR Network and what makes it unique?" },
      { label: "How to use TalkToXPR", text: "How do I use TalkToXPR to interact with the blockchain?" },
    ],
  },
  {
    label: "My Account",
    icon: User,
    prompts: [
      { label: "View my balances", text: "Show me all token balances for {account}" },
      { label: "Account details", text: "Show me full details for the {account} account" },
      { label: "Recent transactions", text: "Show me recent transactions for {account}" },
      { label: "Staking info", text: "Show me staking information for {account}" },
    ],
  },
  {
    label: "Tokens & Prices",
    icon: Coins,
    prompts: [
      { label: "XPR price", text: "Get the current XPR token price" },
      { label: "My token list", text: "What tokens does {account} hold?" },
      { label: "Total XPR supply", text: "What is the total supply of XPR?" },
    ],
  },
  {
    label: "Blockchain Info",
    icon: Link2,
    prompts: [
      { label: "Chain status", text: "What is the current state of the XPR Network blockchain?" },
      { label: "Block producers", text: "Who are the current block producers on XPR Network?" },
      { label: "Latest block", text: "Show me the latest block info on the chain" },
    ],
  },
  {
    label: "Transfers",
    icon: ArrowLeftRight,
    prompts: [
      { label: "Transfer XPR", text: "Transfer 1 XPR from {account} to " },
      { label: "Transfer XUSDC", text: "Transfer 1 XUSDC from {account} to " },
    ],
  },
]

export function PromptLibrary() {
  const [open, setOpen] = useState(false)
  const { accountName } = useWallet()

  const inject = (text: string) => {
    const resolved = accountName
      ? text.replace(/\{account\}/g, accountName)
      : text.replace(/\s*for \{account\}|\{account\}\s*/g, "")
    window.dispatchEvent(new CustomEvent("inject-prompt", { detail: resolved }))
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-24 right-6 z-50 h-11 w-11 rounded-full shadow-lg border border-border"
          title="Prompt Library"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Prompt Library
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Click any prompt to load it into the chat input.
          </p>
        </SheetHeader>
        <div className="mt-5 space-y-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <div key={cat.label}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Icon className="h-3 w-3" />
                  {cat.label}
                </h3>
                <div className="space-y-1">
                  {cat.prompts.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => inject(p.text)}
                      className="w-full text-left text-sm px-3 py-2 rounded-md border border-border hover:bg-muted hover:border-primary/40 transition-colors flex items-center justify-between gap-2 group"
                    >
                      <span className="truncate">{p.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
