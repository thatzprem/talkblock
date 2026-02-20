"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { HelpCircle, ChevronDown } from "lucide-react"

const FAQS = [
  {
    section: "Getting Started",
    items: [
      {
        q: "What is TalkToXPR?",
        a: "TalkToXPR is an AI-powered blockchain explorer for Antelope chains. Instead of navigating menus and forms, you ask questions in plain English and get structured, interactive results.",
      },
      {
        q: "Do I need a wallet to use it?",
        a: "Not necessarily. You can bring your own API key (BYOK) and use the app without a wallet. However, connecting an Anchor wallet gives you 5 free AI requests per day and lets you sign transactions directly.",
      },
      {
        q: "Which wallets are supported?",
        a: "Anchor wallet via Wharfkit. When you click \"Connect Wallet\", the Anchor signing request will appear.",
      },
      {
        q: "Which blockchains can I explore?",
        a: "EOS, WAX, Telos, Jungle4 (testnet), FIO, and Libre are built in. You can also connect to any Antelope chain by entering a custom RPC endpoint.",
      },
    ],
  },
  {
    section: "Using the Chat",
    items: [
      {
        q: "What can I ask?",
        a: "Anything about the blockchain: account details, token balances, transaction history, block info, producer rankings, contract tables, and more. You can also ask the AI to build transactions for you.",
      },
      {
        q: "Can I sign transactions from the chat?",
        a: "Yes. The AI builds a transaction proposal with editable fields. You review the details, then sign and broadcast with your connected wallet.",
      },
      {
        q: "What are the clickable items in responses?",
        a: "Account names, transaction IDs, table names, and action names in AI responses are interactive. Click any of them to open a detailed view in the right panel.",
      },
    ],
  },
  {
    section: "AI & Credits",
    items: [
      {
        q: "Which AI models are available?",
        a: "Built-in mode uses Chutes (free). For BYOK, you can use Anthropic (Claude), OpenAI (GPT), Google (Gemini), or Chutes with your own API key.",
      },
      {
        q: "How do free credits work?",
        a: "Each wallet account gets 5 free AI requests per day, per chain. The count resets daily at midnight UTC.",
      },
      {
        q: "How do I get more credits?",
        a: "Purchase credits with TLOS on Telos Mainnet. 1 TLOS = 250,000 tokens. You can pay from any chain — a standalone Telos wallet handles the payment without switching your current chain.",
      },
      {
        q: "Are my API keys safe?",
        a: "Yes. BYOK keys are stored only in your browser's localStorage. They are never sent to the server.",
      },
    ],
  },
  {
    section: "Features",
    items: [
      {
        q: "What is the Dashboard?",
        a: "Bookmark any result from the chat to save it as a card. Switch to the Dashboard view to see all your bookmarks in a grid with drag-and-drop reordering, auto-refresh, and data age labels.",
      },
      {
        q: "Can I share an account or transaction link?",
        a: "Yes. In the detail panel, click the link icon next to an account name or transaction ID to copy a shareable URL. Opening the link auto-connects to the correct chain.",
      },
      {
        q: "What do the colored dots on the sidebar mean?",
        a: "They indicate chain health. Green means both RPC and Hyperion are reachable. Yellow means RPC only. Orange means Hyperion only. Red means neither is responding.",
      },
    ],
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left"
    >
      <div className="flex items-start justify-between gap-2 py-2">
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <p className="text-sm text-muted-foreground pb-3 pr-6">{a}</p>
      )}
    </button>
  )
}

export function FaqDialog({ trigger }: { trigger?: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0">
            <HelpCircle className="h-3 w-3" />
            <span>FAQ</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Frequently Asked Questions</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-6 pb-6 space-y-5">
          {FAQS.map((section) => (
            <div key={section.section}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{section.section}</h3>
              <div className="divide-y divide-border">
                {section.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
