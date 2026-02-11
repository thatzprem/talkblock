# Antelope Explorer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a chat-first, chain-agnostic Antelope blockchain explorer with Wharfkit wallet integration and multi-provider LLM copilot.

**Architecture:** Next.js 14 App Router with a three-panel layout — left nav, center chat, right context panel. The LLM chat is the primary interface with tool-calling for on-chain queries and transaction building. All chain reads go browser-direct to user-specified RPC endpoints. LLM API keys are user-supplied, stored in localStorage, passed via headers to a stateless Next.js API proxy.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Vercel AI SDK v5, Wharfkit (session + contract), Zod

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `components.json`

**Step 1: Initialize Next.js project**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```
Expected: Project files created, dev server works.

**Step 2: Initialize shadcn/ui**

Run:
```bash
npx shadcn@latest init -d
```
Expected: `components.json` created, `lib/utils.ts` created.

**Step 3: Install core dependencies**

Run:
```bash
npm install ai @ai-sdk/react @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google zod @wharfkit/session @wharfkit/contract @wharfkit/web-renderer @wharfkit/wallet-plugin-anchor lucide-react
```
Expected: All packages in `package.json`.

**Step 4: Add essential shadcn components**

Run:
```bash
npx shadcn@latest add button input card dialog tabs scroll-area badge separator sheet tooltip dropdown-menu select label textarea avatar
```
Expected: Components in `components/ui/`.

**Step 5: Verify dev server runs**

Run:
```bash
npm run dev
```
Expected: App loads at `http://localhost:3000`.

**Step 6: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold Next.js project with shadcn/ui, AI SDK, and Wharfkit"
```

---

### Task 2: Three-Panel Layout Shell

**Files:**
- Create: `app/layout.tsx` (modify), `components/layout/app-shell.tsx`, `components/layout/left-panel.tsx`, `components/layout/right-panel.tsx`, `components/layout/header.tsx`
- Create: `lib/stores/panel-store.ts`

**Step 1: Create panel visibility store**

Create `lib/stores/panel-store.ts` — a simple React context to toggle left/right panels:

```typescript
"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface PanelState {
  leftOpen: boolean
  rightOpen: boolean
  toggleLeft: () => void
  toggleRight: () => void
  openRight: () => void
  closeRight: () => void
}

const PanelContext = createContext<PanelState | null>(null)

export function PanelProvider({ children }: { children: ReactNode }) {
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(false)

  return (
    <PanelContext.Provider
      value={{
        leftOpen,
        rightOpen,
        toggleLeft: () => setLeftOpen((v) => !v),
        toggleRight: () => setRightOpen((v) => !v),
        openRight: () => setRightOpen(true),
        closeRight: () => setRightOpen(false),
      }}
    >
      {children}
    </PanelContext.Provider>
  )
}

export function usePanels() {
  const ctx = useContext(PanelContext)
  if (!ctx) throw new Error("usePanels must be used within PanelProvider")
  return ctx
}
```

**Step 2: Create header component**

Create `components/layout/header.tsx`:

```tsx
"use client"

import { usePanels } from "@/lib/stores/panel-store"
import { Button } from "@/components/ui/button"
import { PanelLeft, PanelRight, Settings, Wallet } from "lucide-react"

export function Header() {
  const { toggleLeft, toggleRight } = usePanels()

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleLeft}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">Antelope Explorer</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Chain selector and wallet connect will be added in later tasks */}
        <Button variant="outline" size="sm" id="chain-selector">
          No Chain Connected
        </Button>
        <Button variant="outline" size="sm" id="wallet-connect">
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
        <Button variant="ghost" size="icon" id="settings-btn">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleRight}>
          <PanelRight className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
```

**Step 3: Create left panel**

Create `components/layout/left-panel.tsx`:

```tsx
"use client"

import { usePanels } from "@/lib/stores/panel-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function LeftPanel() {
  const { leftOpen } = usePanels()

  return (
    <aside
      className={cn(
        "border-r bg-muted/30 transition-all duration-300 overflow-hidden",
        leftOpen ? "w-60" : "w-0"
      )}
    >
      <ScrollArea className="h-full p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Links</h3>
            <p className="text-xs text-muted-foreground">Connect a chain to get started</p>
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}
```

**Step 4: Create right panel**

Create `components/layout/right-panel.tsx`:

```tsx
"use client"

import { usePanels } from "@/lib/stores/panel-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function RightPanel() {
  const { rightOpen, closeRight } = usePanels()

  return (
    <aside
      className={cn(
        "border-l bg-muted/30 transition-all duration-300 overflow-hidden",
        rightOpen ? "w-[400px]" : "w-0"
      )}
    >
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Details</h3>
            <Button variant="ghost" size="icon" onClick={closeRight}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Click on any item in the chat to view details here.
          </p>
        </div>
      </ScrollArea>
    </aside>
  )
}
```

**Step 5: Create app shell**

Create `components/layout/app-shell.tsx`:

```tsx
"use client"

import { PanelProvider } from "@/lib/stores/panel-store"
import { Header } from "./header"
import { LeftPanel } from "./left-panel"
import { RightPanel } from "./right-panel"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PanelProvider>
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <LeftPanel />
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
          <RightPanel />
        </div>
      </div>
    </PanelProvider>
  )
}
```

**Step 6: Update app/layout.tsx**

Modify `app/layout.tsx` to wrap with `AppShell`:

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppShell } from "@/components/layout/app-shell"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Antelope Explorer",
  description: "Chat-first Antelope blockchain explorer",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
```

**Step 7: Update app/page.tsx as chat placeholder**

```tsx
export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-muted-foreground">Chat will go here</p>
    </div>
  )
}
```

**Step 8: Verify layout renders**

Run: `npm run dev` — verify three-panel layout with header, collapsible side panels.

**Step 9: Commit**

```bash
git add -A && git commit -m "feat: add three-panel layout shell with collapsible side panels"
```

---

### Task 3: Chain Connection Manager

**Files:**
- Create: `lib/stores/chain-store.ts`, `components/chain/chain-selector.tsx`, `lib/antelope/client.ts`

**Step 1: Create Antelope RPC client wrapper**

Create `lib/antelope/client.ts` — a thin wrapper around fetch calls to Antelope RPC endpoints:

```typescript
export interface ChainInfo {
  chain_id: string
  head_block_num: number
  head_block_producer: string
  server_version_string: string
}

export interface AccountInfo {
  account_name: string
  core_liquid_balance?: string
  ram_quota: number
  ram_usage: number
  cpu_limit: { used: number; available: number; max: number }
  net_limit: { used: number; available: number; max: number }
  cpu_weight: number
  net_weight: number
  permissions: Array<{
    perm_name: string
    parent: string
    required_auth: {
      threshold: number
      keys: Array<{ key: string; weight: number }>
      accounts: Array<{ permission: { actor: string; permission: string }; weight: number }>
    }
  }>
  total_resources?: {
    cpu_weight: string
    net_weight: string
    ram_bytes: number
  }
  voter_info?: {
    producers: string[]
    staked: number
  }
}

export class AntelopeClient {
  constructor(private endpoint: string) {}

  private async rpc(path: string, body?: object) {
    const res = await fetch(`${this.endpoint}/v1/chain/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `RPC error: ${res.status}`)
    }
    return res.json()
  }

  async getInfo(): Promise<ChainInfo> {
    return this.rpc("get_info")
  }

  async getAccount(accountName: string): Promise<AccountInfo> {
    return this.rpc("get_account", { account_name: accountName })
  }

  async getBlock(blockNumOrId: string | number) {
    return this.rpc("get_block", { block_num_or_id: blockNumOrId })
  }

  async getTransaction(id: string) {
    // Note: get_transaction is on history plugin, not all endpoints support it
    const res = await fetch(`${this.endpoint}/v1/history/get_transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `RPC error: ${res.status}`)
    }
    return res.json()
  }

  async getTableRows(params: {
    code: string
    table: string
    scope: string
    limit?: number
    lower_bound?: string
    upper_bound?: string
    key_type?: string
    index_position?: string
    reverse?: boolean
    json?: boolean
  }) {
    return this.rpc("get_table_rows", { json: true, limit: 10, ...params })
  }

  async getAbi(accountName: string) {
    return this.rpc("get_abi", { account_name: accountName })
  }

  async getCurrencyBalance(code: string, account: string, symbol?: string) {
    return this.rpc("get_currency_balance", { code, account, symbol })
  }

  async getProducers(limit = 21, lowerBound = "") {
    return this.rpc("get_producers", {
      json: true,
      limit,
      lower_bound: lowerBound,
    })
  }

  async getBlockInfo(blockNum: number) {
    return this.rpc("get_block_info", { block_num: blockNum })
  }
}
```

**Step 2: Create chain store**

Create `lib/stores/chain-store.ts`:

```typescript
"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { AntelopeClient, ChainInfo } from "@/lib/antelope/client"

const PRESET_CHAINS = [
  { name: "EOS Mainnet", url: "https://eos.greymass.com" },
  { name: "Jungle4 Testnet", url: "https://jungle4.greymass.com" },
  { name: "WAX Mainnet", url: "https://wax.greymass.com" },
  { name: "Telos Mainnet", url: "https://telos.greymass.com" },
  { name: "FIO Mainnet", url: "https://fio.greymass.com" },
  { name: "Libre", url: "https://libre.greymass.com" },
]

interface ChainState {
  endpoint: string | null
  chainInfo: ChainInfo | null
  chainName: string | null
  client: AntelopeClient | null
  presets: typeof PRESET_CHAINS
  connecting: boolean
  error: string | null
  connect: (endpoint: string, name?: string) => Promise<void>
  disconnect: () => void
}

const ChainContext = createContext<ChainState | null>(null)

export function ChainProvider({ children }: { children: ReactNode }) {
  const [endpoint, setEndpoint] = useState<string | null>(null)
  const [chainInfo, setChainInfo] = useState<ChainInfo | null>(null)
  const [chainName, setChainName] = useState<string | null>(null)
  const [client, setClient] = useState<AntelopeClient | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async (url: string, name?: string) => {
    setConnecting(true)
    setError(null)
    try {
      const c = new AntelopeClient(url)
      const info = await c.getInfo()
      setEndpoint(url)
      setChainInfo(info)
      setChainName(name || url)
      setClient(c)
      localStorage.setItem("antelope_endpoint", url)
      localStorage.setItem("antelope_chain_name", name || url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect")
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setEndpoint(null)
    setChainInfo(null)
    setChainName(null)
    setClient(null)
    localStorage.removeItem("antelope_endpoint")
    localStorage.removeItem("antelope_chain_name")
  }, [])

  return (
    <ChainContext.Provider
      value={{
        endpoint,
        chainInfo,
        chainName,
        client,
        presets: PRESET_CHAINS,
        connecting,
        error,
        connect,
        disconnect,
      }}
    >
      {children}
    </ChainContext.Provider>
  )
}

export function useChain() {
  const ctx = useContext(ChainContext)
  if (!ctx) throw new Error("useChain must be used within ChainProvider")
  return ctx
}
```

**Step 3: Create chain selector dialog**

Create `components/chain/chain-selector.tsx`:

```tsx
"use client"

import { useState } from "react"
import { useChain } from "@/lib/stores/chain-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Link2, Link2Off, Check } from "lucide-react"

export function ChainSelector() {
  const { chainName, chainInfo, presets, connecting, error, connect, disconnect } = useChain()
  const [customUrl, setCustomUrl] = useState("")
  const [open, setOpen] = useState(false)

  const handleConnect = async (url: string, name?: string) => {
    await connect(url, name)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {chainInfo ? (
            <>
              <Link2 className="h-4 w-4 mr-2 text-green-500" />
              {chainName}
            </>
          ) : (
            <>
              <Link2Off className="h-4 w-4 mr-2" />
              No Chain Connected
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect to Chain</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Preset Chains</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {presets.map((chain) => (
                <Button
                  key={chain.url}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  disabled={connecting}
                  onClick={() => handleConnect(chain.url, chain.name)}
                >
                  {chainInfo && chainName === chain.name && (
                    <Check className="h-3 w-3 mr-1 text-green-500" />
                  )}
                  {chain.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-sm text-muted-foreground">Custom RPC Endpoint</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="https://your-endpoint.com"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
              <Button
                onClick={() => handleConnect(customUrl)}
                disabled={connecting || !customUrl}
              >
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {chainInfo && (
            <>
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chain ID</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {chainInfo.chain_id.slice(0, 16)}...
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Head Block</span>
                  <span>{chainInfo.head_block_num.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Producer</span>
                  <span>{chainInfo.head_block_producer}</span>
                </div>
                <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => { disconnect(); setOpen(false) }}>
                  Disconnect
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 4: Wire chain provider + selector into layout**

Update `components/layout/app-shell.tsx` to include `ChainProvider`.
Update `components/layout/header.tsx` to use `<ChainSelector />` instead of the placeholder button.

**Step 5: Verify chain connection works**

Run: `npm run dev` — click chain selector, pick "EOS Mainnet", verify it connects and shows chain info.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add chain connection manager with RPC client and preset chains"
```

---

### Task 4: LLM Provider Settings

**Files:**
- Create: `lib/stores/llm-store.ts`, `components/settings/llm-settings.tsx`

**Step 1: Create LLM config store**

Create `lib/stores/llm-store.ts`:

```typescript
"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

export type LLMProvider = "anthropic" | "openai" | "google"

interface LLMConfig {
  provider: LLMProvider
  apiKey: string
  model: string
}

const DEFAULT_MODELS: Record<LLMProvider, string[]> = {
  anthropic: ["claude-sonnet-4-5-20250929", "claude-opus-4-6", "claude-haiku-4-5-20251001"],
  openai: ["gpt-4o", "gpt-4o-mini", "o1", "o3-mini"],
  google: ["gemini-2.0-flash", "gemini-2.0-pro"],
}

interface LLMState {
  config: LLMConfig | null
  availableModels: string[]
  isConfigured: boolean
  setProvider: (provider: LLMProvider) => void
  setApiKey: (key: string) => void
  setModel: (model: string) => void
  getModelsForProvider: (provider: LLMProvider) => string[]
}

const LLMContext = createContext<LLMState | null>(null)

export function LLMProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LLMConfig | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("llm_config")
    if (saved) {
      try {
        setConfig(JSON.parse(saved))
      } catch {}
    }
  }, [])

  const persist = useCallback((cfg: LLMConfig) => {
    setConfig(cfg)
    localStorage.setItem("llm_config", JSON.stringify(cfg))
  }, [])

  const setProvider = useCallback((provider: LLMProvider) => {
    const models = DEFAULT_MODELS[provider]
    persist({
      provider,
      apiKey: config?.provider === provider ? config.apiKey : "",
      model: models[0],
    })
  }, [config, persist])

  const setApiKey = useCallback((apiKey: string) => {
    if (!config) return
    persist({ ...config, apiKey })
  }, [config, persist])

  const setModel = useCallback((model: string) => {
    if (!config) return
    persist({ ...config, model })
  }, [config, persist])

  const getModelsForProvider = useCallback((provider: LLMProvider) => {
    return DEFAULT_MODELS[provider]
  }, [])

  return (
    <LLMContext.Provider
      value={{
        config,
        availableModels: config ? DEFAULT_MODELS[config.provider] : [],
        isConfigured: !!(config?.apiKey && config?.model),
        setProvider,
        setApiKey,
        setModel,
        getModelsForProvider,
      }}
    >
      {children}
    </LLMContext.Provider>
  )
}

// Rename hook to avoid conflict with the Provider component
export function useLLM() {
  const ctx = useContext(LLMContext)
  if (!ctx) throw new Error("useLLM must be used within LLMProvider")
  return ctx
}
```

**Step 2: Create settings dialog**

Create `components/settings/llm-settings.tsx`:

```tsx
"use client"

import { useLLM, LLMProvider as LLMProviderType } from "@/lib/stores/llm-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

const PROVIDERS: { value: LLMProviderType; label: string }[] = [
  { value: "anthropic", label: "Anthropic (Claude)" },
  { value: "openai", label: "OpenAI (GPT)" },
  { value: "google", label: "Google (Gemini)" },
]

export function LLMSettings() {
  const { config, isConfigured, setProvider, setApiKey, setModel, getModelsForProvider } = useLLM()
  const [showKey, setShowKey] = useState(false)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
          {isConfigured && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>LLM Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Provider</Label>
            <Select
              value={config?.provider || ""}
              onValueChange={(v) => setProvider(v as LLMProviderType)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {config?.provider && (
            <>
              <div>
                <Label>API Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type={showKey ? "text" : "password"}
                    placeholder="Enter your API key"
                    value={config.apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Stored locally in your browser. Never sent to our server.
                </p>
              </div>

              <div>
                <Label>Model</Label>
                <Select value={config.model} onValueChange={setModel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelsForProvider(config.provider).map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            {isConfigured ? (
              <Badge variant="default" className="bg-green-600">Configured</Badge>
            ) : (
              <Badge variant="secondary">Not configured</Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 3: Wire LLM provider into app shell and header**

Add `LLMProvider` to `app-shell.tsx`. Replace settings button placeholder in `header.tsx` with `<LLMSettings />`.

**Step 4: Verify settings dialog works**

Run: `npm run dev` — click settings icon, select provider, enter API key, select model.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add LLM provider settings with multi-provider support"
```

---

### Task 5: Chat UI (Center Panel)

**Files:**
- Create: `components/chat/chat-panel.tsx`, `components/chat/chat-input.tsx`, `components/chat/chat-message.tsx`
- Modify: `app/page.tsx`

**Step 1: Create chat message component**

Create `components/chat/chat-message.tsx`:

```tsx
"use client"

import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { Bot, User } from "lucide-react"

interface ChatMessageProps {
  role: "user" | "assistant"
  children: React.ReactNode
}

export function ChatMessage({ role, children }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {role === "assistant" && (
        <Avatar className="h-8 w-8 border flex items-center justify-center bg-primary/10">
          <Bot className="h-4 w-4" />
        </Avatar>
      )}
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%] text-sm",
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {children}
      </div>
      {role === "user" && (
        <Avatar className="h-8 w-8 border flex items-center justify-center bg-muted">
          <User className="h-4 w-4" />
        </Avatar>
      )}
    </div>
  )
}
```

**Step 2: Create chat input component**

Create `components/chat/chat-input.tsx`:

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("")

  const handleSend = () => {
    if (!value.trim() || disabled) return
    onSend(value.trim())
    setValue("")
  }

  return (
    <div className="border-t p-4">
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
          placeholder={placeholder || "Ask anything about the blockchain..."}
          className="min-h-[44px] max-h-[200px] resize-none"
          rows={1}
          disabled={disabled}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          size="icon"
          className="shrink-0"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
```

**Step 3: Create chat panel with useChat hook**

Create `components/chat/chat-panel.tsx`:

```tsx
"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useRef, useEffect, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { useLLM } from "@/lib/stores/llm-store"
import { useChain } from "@/lib/stores/chain-store"
import { Bot, MessageSquare } from "lucide-react"

export function ChatPanel() {
  const { config, isConfigured } = useLLM()
  const { endpoint, chainName } = useChain()
  const scrollRef = useRef<HTMLDivElement>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: {
          "x-llm-provider": config?.provider || "",
          "x-llm-api-key": config?.apiKey || "",
          "x-llm-model": config?.model || "",
          "x-chain-endpoint": endpoint || "",
        },
      }),
    [config?.provider, config?.apiKey, config?.model, endpoint]
  )

  const { messages, sendMessage } = useChat({ transport })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!isConfigured) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Bot className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Welcome to Antelope Explorer</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Configure your LLM provider in Settings to start chatting with the blockchain.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Context tag */}
      {chainName && (
        <div className="px-4 py-1 border-b">
          <span className="text-xs text-muted-foreground">
            Connected to: <span className="font-medium text-foreground">{chainName}</span>
          </span>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="max-w-3xl mx-auto py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {endpoint
                  ? "Ask me anything about the blockchain"
                  : "Connect to a chain to get started, or ask me anything"}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} role={message.role as "user" | "assistant"}>
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    return <span key={i}>{part.text}</span>
                  }
                  return null
                })}
              </ChatMessage>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSend={(text) => sendMessage({ text })}
        disabled={!isConfigured}
        placeholder={
          !endpoint
            ? "Connect to a chain first, or ask a general question..."
            : "Ask anything about the blockchain..."
        }
      />
    </div>
  )
}
```

**Step 4: Update app/page.tsx**

```tsx
import { ChatPanel } from "@/components/chat/chat-panel"

export default function Home() {
  return <ChatPanel />
}
```

**Step 5: Verify chat UI renders**

Run: `npm run dev` — verify chat panel shows welcome state, then after configuring LLM, shows input and empty message area.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add chat UI with useChat hook and message rendering"
```

---

### Task 6: LLM API Route with Chain Tools

**Files:**
- Create: `app/api/chat/route.ts`, `lib/llm/tools.ts`, `lib/llm/provider.ts`

**Step 1: Create provider factory**

Create `lib/llm/provider.ts`:

```typescript
import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

export function createProvider(provider: string, apiKey: string, model: string) {
  switch (provider) {
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey })
      return anthropic(model)
    }
    case "openai": {
      const openai = createOpenAI({ apiKey })
      return openai(model)
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey })
      return google(model)
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}
```

**Step 2: Create chain tools**

Create `lib/llm/tools.ts`:

```typescript
import { tool } from "ai"
import { z } from "zod"
import { AntelopeClient } from "@/lib/antelope/client"

export function createChainTools(endpoint: string | null) {
  if (!endpoint) return {}

  const client = new AntelopeClient(endpoint)

  return {
    get_account: tool({
      description:
        "Get detailed information about an Antelope blockchain account including balances, resources (RAM, CPU, NET), and permissions.",
      parameters: z.object({
        account_name: z.string().describe("The account name to look up (e.g. 'eosio.token')"),
      }),
      execute: async ({ account_name }) => {
        try {
          const account = await client.getAccount(account_name)
          return {
            account_name: account.account_name,
            balance: account.core_liquid_balance || "0",
            ram: { used: account.ram_usage, quota: account.ram_quota },
            cpu: account.cpu_limit,
            net: account.net_limit,
            cpu_staked: account.total_resources?.cpu_weight || "0",
            net_staked: account.total_resources?.net_weight || "0",
            permissions: account.permissions.map((p) => ({
              name: p.perm_name,
              parent: p.parent,
              threshold: p.required_auth.threshold,
              keys: p.required_auth.keys,
              accounts: p.required_auth.accounts,
            })),
            voter_info: account.voter_info || null,
          }
        } catch (e) {
          return { error: e instanceof Error ? e.message : "Failed to fetch account" }
        }
      },
    }),

    get_block: tool({
      description: "Get information about a specific block by block number.",
      parameters: z.object({
        block_num: z.number().describe("The block number to look up"),
      }),
      execute: async ({ block_num }) => {
        try {
          const block = await client.getBlock(block_num)
          return {
            block_num: block.block_num,
            id: block.id,
            timestamp: block.timestamp,
            producer: block.producer,
            confirmed: block.confirmed,
            transaction_count: block.transactions?.length || 0,
            transactions: (block.transactions || []).slice(0, 10).map((tx: any) => ({
              id: typeof tx.trx === "string" ? tx.trx : tx.trx?.id,
              status: tx.status,
              cpu_usage_us: tx.cpu_usage_us,
              net_usage_words: tx.net_usage_words,
            })),
          }
        } catch (e) {
          return { error: e instanceof Error ? e.message : "Failed to fetch block" }
        }
      },
    }),

    get_transaction: tool({
      description: "Look up a transaction by its transaction ID. Note: requires history plugin on the endpoint.",
      parameters: z.object({
        transaction_id: z.string().describe("The transaction ID (hash) to look up"),
      }),
      execute: async ({ transaction_id }) => {
        try {
          const tx = await client.getTransaction(transaction_id)
          return {
            id: tx.id,
            block_num: tx.block_num,
            block_time: tx.block_time,
            actions: tx.trx?.trx?.actions || [],
            status: tx.trx?.receipt?.status,
          }
        } catch (e) {
          return { error: e instanceof Error ? e.message : "Failed to fetch transaction" }
        }
      },
    }),

    get_table_rows: tool({
      description:
        "Query rows from a smart contract table. Use this to read on-chain data from any contract.",
      parameters: z.object({
        code: z.string().describe("The contract account name (e.g. 'eosio.token')"),
        table: z.string().describe("The table name (e.g. 'accounts')"),
        scope: z.string().describe("The scope (usually the account name or contract name)"),
        limit: z.number().optional().describe("Max rows to return (default 10)"),
        lower_bound: z.string().optional().describe("Lower bound for key"),
        upper_bound: z.string().optional().describe("Upper bound for key"),
      }),
      execute: async ({ code, table, scope, limit, lower_bound, upper_bound }) => {
        try {
          return await client.getTableRows({
            code,
            table,
            scope,
            limit,
            lower_bound,
            upper_bound,
          })
        } catch (e) {
          return { error: e instanceof Error ? e.message : "Failed to fetch table rows" }
        }
      },
    }),

    get_abi: tool({
      description:
        "Get the ABI (Application Binary Interface) of a smart contract. Shows available tables, actions, and data structures.",
      parameters: z.object({
        account_name: z.string().describe("The contract account name"),
      }),
      execute: async ({ account_name }) => {
        try {
          const result = await client.getAbi(account_name)
          const abi = result.abi
          if (!abi) return { error: "No ABI found for this account" }
          return {
            account_name: result.account_name,
            tables: abi.tables?.map((t: any) => t.name) || [],
            actions: abi.actions?.map((a: any) => a.name) || [],
            structs: abi.structs?.map((s: any) => ({
              name: s.name,
              fields: s.fields,
            })) || [],
          }
        } catch (e) {
          return { error: e instanceof Error ? e.message : "Failed to fetch ABI" }
        }
      },
    }),

    get_currency_balance: tool({
      description: "Get token balances for an account from a specific token contract.",
      parameters: z.object({
        code: z.string().describe("The token contract (e.g. 'eosio.token')"),
        account: z.string().describe("The account to check balance for"),
        symbol: z.string().optional().describe("Token symbol filter (e.g. 'EOS')"),
      }),
      execute: async ({ code, account, symbol }) => {
        try {
          const balances = await client.getCurrencyBalance(code, account, symbol)
          return { account, balances }
        } catch (e) {
          return { error: e instanceof Error ? e.message : "Failed to fetch balance" }
        }
      },
    }),

    get_producers: tool({
      description: "Get the list of block producers on the chain.",
      parameters: z.object({
        limit: z.number().optional().describe("Max producers to return (default 21)"),
      }),
      execute: async ({ limit }) => {
        try {
          const result = await client.getProducers(limit || 21)
          return {
            producers: result.rows.map((p: any) => ({
              owner: p.owner,
              total_votes: p.total_votes,
              url: p.url,
              is_active: p.is_active,
              unpaid_blocks: p.unpaid_blocks,
            })),
            total_producer_vote_weight: result.total_producer_vote_weight,
          }
        } catch (e) {
          return { error: e instanceof Error ? e.message : "Failed to fetch producers" }
        }
      },
    }),

    build_transaction: tool({
      description:
        "Build a transaction proposal for the user to review and sign. Use this when the user wants to perform any on-chain action (transfer tokens, stake, buy RAM, etc). The transaction will be shown to the user for approval — they must explicitly sign it.",
      parameters: z.object({
        actions: z.array(
          z.object({
            account: z.string().describe("The contract to call"),
            name: z.string().describe("The action name"),
            data: z.record(z.any()).describe("The action data"),
          })
        ).describe("The actions to include in the transaction"),
        description: z.string().describe("Human-readable description of what this transaction does"),
      }),
      execute: async ({ actions, description }) => {
        // Don't execute — return the proposal for client-side rendering
        return {
          type: "transaction_proposal",
          description,
          actions,
          status: "pending_signature",
        }
      },
    }),
  }
}
```

**Step 3: Create API route**

Create `app/api/chat/route.ts`:

```typescript
import { streamText, convertToModelMessages, stepCountIs } from "ai"
import { createProvider } from "@/lib/llm/provider"
import { createChainTools } from "@/lib/llm/tools"

export async function POST(req: Request) {
  const provider = req.headers.get("x-llm-provider")
  const apiKey = req.headers.get("x-llm-api-key")
  const model = req.headers.get("x-llm-model")
  const chainEndpoint = req.headers.get("x-chain-endpoint")

  if (!provider || !apiKey || !model) {
    return new Response("Missing LLM configuration", { status: 400 })
  }

  const { messages } = await req.json()

  const llmModel = createProvider(provider, apiKey, model)
  const tools = createChainTools(chainEndpoint || null)

  const systemPrompt = `You are an Antelope blockchain explorer assistant. You help users understand and interact with Antelope-based blockchains (EOS, WAX, Telos, etc.).

You have access to tools that let you query on-chain data in real-time. Use them to answer questions about accounts, transactions, blocks, smart contracts, and token balances.

When a user wants to perform an action on the blockchain (transfer tokens, stake resources, buy RAM, vote for producers, etc.), use the build_transaction tool to create a transaction proposal. The user will review and sign it with their wallet.

Guidelines:
- Always use tools to fetch real data rather than making assumptions
- Present data clearly and explain what it means
- When building transactions, explain what the transaction will do before proposing it
- If the chain endpoint is not connected, let the user know they need to connect first
- Be concise but informative

${chainEndpoint ? `Connected chain endpoint: ${chainEndpoint}` : "No chain connected — inform the user they should connect to a chain to query on-chain data."}`

  const result = streamText({
    model: llmModel,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
  })

  return result.toUIMessageStreamResponse()
}
```

**Step 4: Verify chat works end-to-end**

Run: `npm run dev` — configure LLM in settings, connect to EOS mainnet, ask "What is the balance of eosio.token?".

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add LLM API route with Antelope chain tools and multi-provider support"
```

---

### Task 7: Rich Inline Cards

**Files:**
- Create: `components/chat/cards/account-card.tsx`, `components/chat/cards/block-card.tsx`, `components/chat/cards/transaction-card.tsx`, `components/chat/cards/table-card.tsx`, `components/chat/cards/tx-proposal-card.tsx`, `components/chat/cards/tool-result-renderer.tsx`
- Modify: `components/chat/chat-panel.tsx`

**Step 1: Create individual card components**

Create each card component in `components/chat/cards/`. Each renders tool result data in a styled `Card` from shadcn/ui with relevant fields displayed.

- `account-card.tsx` — displays account name, balance, RAM/CPU/NET usage bars, permission list. Clickable to open in right panel.
- `block-card.tsx` — block number, timestamp, producer, transaction count.
- `transaction-card.tsx` — tx ID (truncated), actions summary, status badge.
- `table-card.tsx` — formatted table of rows with column headers from data keys.
- `tx-proposal-card.tsx` — shows action details, description, and a **"Sign & Broadcast"** button. This is the key component — it connects to Wharfkit in Task 8.

**Step 2: Create tool result renderer**

Create `components/chat/cards/tool-result-renderer.tsx` — a switch component that receives a tool name + result and renders the appropriate card.

```tsx
"use client"

import { AccountCard } from "./account-card"
import { BlockCard } from "./block-card"
import { TransactionCard } from "./transaction-card"
import { TableCard } from "./table-card"
import { TxProposalCard } from "./tx-proposal-card"

interface ToolResultRendererProps {
  toolName: string
  result: any
}

export function ToolResultRenderer({ toolName, result }: ToolResultRendererProps) {
  if (result?.error) {
    return (
      <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
        Error: {result.error}
      </div>
    )
  }

  switch (toolName) {
    case "get_account":
      return <AccountCard data={result} />
    case "get_block":
      return <BlockCard data={result} />
    case "get_transaction":
      return <TransactionCard data={result} />
    case "get_table_rows":
      return <TableCard data={result} />
    case "get_currency_balance":
      return <AccountCard data={result} />
    case "get_producers":
      return <TableCard data={{ rows: result.producers }} />
    case "get_abi":
      return <TableCard data={{ rows: result.structs, meta: { tables: result.tables, actions: result.actions } }} />
    case "build_transaction":
      return <TxProposalCard data={result} />
    default:
      return <pre className="text-xs bg-muted p-2 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>
  }
}
```

**Step 3: Update chat-panel.tsx to render tool results**

Modify the message rendering loop to handle tool-call parts using `ToolResultRenderer`.

**Step 4: Verify cards render in chat**

Run: `npm run dev` — ask "show me the eosio account", verify account card renders inline.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add rich inline cards for tool results in chat"
```

---

### Task 8: Wharfkit Wallet Integration

**Files:**
- Create: `lib/stores/wallet-store.ts`, `components/wallet/wallet-button.tsx`
- Modify: `components/layout/header.tsx`, `components/layout/app-shell.tsx`, `components/chat/cards/tx-proposal-card.tsx`

**Step 1: Create wallet store**

Create `lib/stores/wallet-store.ts` — wraps Wharfkit `SessionKit`. Manages login, logout, session persistence, and `transact`.

Key points:
- SessionKit is initialized with the current chain from `chain-store`
- Uses `@wharfkit/web-renderer` for the wallet UI
- Uses `@wharfkit/wallet-plugin-anchor` for Anchor wallet
- `transact` method takes actions array, calls `session.transact()`, returns result

**Step 2: Create wallet button component**

Create `components/wallet/wallet-button.tsx` — shows "Connect Wallet" or connected account name. Login/logout via dropdown.

**Step 3: Wire wallet into tx-proposal-card**

Update `components/chat/cards/tx-proposal-card.tsx`:
- "Sign & Broadcast" button calls `wallet.transact(actions)`
- Shows loading state during signing
- Shows success (tx ID) or error after broadcast
- Renders result inline in the card

**Step 4: Wire into header and app shell**

Replace wallet placeholder in header with `<WalletButton />`. Add `WalletProvider` to `app-shell.tsx`.

**Step 5: Verify wallet flow**

Run: `npm run dev` — connect to Jungle4, connect Anchor wallet, ask LLM to "transfer 0.0001 EOS to bob", verify proposal card appears with Sign button.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add Wharfkit wallet integration with transaction signing"
```

---

### Task 9: Context Panel (Right Side Detail Views)

**Files:**
- Create: `lib/stores/context-store.ts`, `components/context/account-detail.tsx`, `components/context/block-detail.tsx`, `components/context/transaction-detail.tsx`, `components/context/contract-detail.tsx`
- Modify: `components/layout/right-panel.tsx`, `components/chat/cards/*.tsx`

**Step 1: Create context store**

Create `lib/stores/context-store.ts` — tracks what's currently displayed in the right panel:

```typescript
interface ContextState {
  type: "account" | "block" | "transaction" | "contract" | null
  data: any
  setContext: (type: string, data: any) => void
  clearContext: () => void
}
```

The LLM system prompt should include context about what's being viewed.

**Step 2: Create detail view components**

Each detail component shows a full view of the data:
- `account-detail.tsx` — full account info with permissions tree, resources bars, token balances, linked actions
- `block-detail.tsx` — full block with transaction list
- `transaction-detail.tsx` — full transaction with action traces
- `contract-detail.tsx` — ABI with tables list, actions list, struct definitions

**Step 3: Wire right panel to context store**

Update `right-panel.tsx` to render the appropriate detail component based on `context.type`.

**Step 4: Make inline cards clickable**

Update each card in `components/chat/cards/` to call `setContext()` and `openRight()` on click, opening the detail view in the right panel.

**Step 5: Inject context into LLM**

Update `chat-panel.tsx` to pass current context data as a header or in the message payload so the LLM knows what the user is viewing.

**Step 6: Verify context panel**

Run: `npm run dev` — ask about an account, click the account card, verify right panel opens with full detail.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add context panel with detail views and LLM context awareness"
```

---

### Task 10: Left Navigation Panel

**Files:**
- Modify: `components/layout/left-panel.tsx`
- Create: `lib/stores/history-store.ts`

**Step 1: Create history/bookmarks store**

Create `lib/stores/history-store.ts` — stores recent searches and bookmarked accounts in localStorage.

**Step 2: Update left panel**

Update `components/layout/left-panel.tsx`:
- Chain info section (chain ID, head block, producer — live updating)
- Recent searches list (clickable — sends query to chat)
- Bookmarked accounts (clickable — opens in right panel)
- Quick action buttons: "Search Account", "Latest Block", "Producers"

**Step 3: Verify left panel**

Run: `npm run dev` — verify chain info shows, recent searches populate after queries.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add left nav panel with chain info, history, and bookmarks"
```

---

### Task 11: Polish and Dark Theme

**Files:**
- Modify: `app/globals.css`, `tailwind.config.ts`

**Step 1: Configure dark theme as default**

Ensure `html` has `class="dark"`. Update CSS variables in `globals.css` for a polished dark theme with good contrast.

**Step 2: Add markdown rendering for LLM responses**

Install `react-markdown` and `remark-gfm`. Update `ChatMessage` to render assistant messages as markdown (code blocks, tables, lists).

Run: `npm install react-markdown remark-gfm`

**Step 3: Add loading states**

- Typing indicator when LLM is generating
- Skeleton cards while tool results are loading
- Pulse animation on "Sign & Broadcast" button during signing

**Step 4: Responsive design**

- On mobile: left panel hidden by default, right panel overlays as sheet
- Chat input sticks to bottom
- Cards stack vertically

**Step 5: Verify polish**

Run: `npm run dev` — verify dark theme, markdown rendering, loading states, mobile layout.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add dark theme, markdown rendering, loading states, and responsive layout"
```

---

## Summary

| Task | Description | Depends On |
|------|-------------|------------|
| 1 | Project scaffolding | — |
| 2 | Three-panel layout shell | 1 |
| 3 | Chain connection manager | 2 |
| 4 | LLM provider settings | 2 |
| 5 | Chat UI (center panel) | 3, 4 |
| 6 | LLM API route with chain tools | 5 |
| 7 | Rich inline cards | 6 |
| 8 | Wharfkit wallet integration | 7 |
| 9 | Context panel (right side) | 7 |
| 10 | Left navigation panel | 3 |
| 11 | Polish and dark theme | all |
