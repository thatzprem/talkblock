"use client"

import { useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChatPanel } from "@/components/chat/chat-panel"
import { PromptLibrary } from "@/components/chat/prompt-library"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { usePanels } from "@/lib/stores/panel-store"
import { useChain } from "@/lib/stores/chain-store"
import { useDetailContext } from "@/lib/stores/context-store"
import { fetchAccountData, fetchBlockData, fetchTxData } from "@/lib/antelope/lookup"

function DeepLinkHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { presets, connect, chainName, endpoint, hyperionEndpoint, connecting } = useChain()
  const { setView } = usePanels()
  const { setContext } = useDetailContext()
  const handledRef = useRef(false)

  const txParam = searchParams.get("tx")
  const accountParam = searchParams.get("account")
  const blockParam = searchParams.get("block")
  const chainParam = searchParams.get("chain")

  const hasParam = txParam || accountParam || blockParam

  useEffect(() => {
    if (!hasParam || handledRef.current) return

    // If we need to connect to a different chain first, do that
    if (chainParam && chainParam !== chainName) {
      const preset = presets.find((p) => p.name === chainParam)
      if (preset) {
        connect(preset.url, preset.name, preset.hyperion)
        return // Wait for connection to complete
      }
    }

    // If still connecting or no endpoint yet, wait
    if (connecting || !endpoint) return

    handledRef.current = true
    // Set cookie so middleware won't redirect on subsequent navigations
    document.cookie = "chain_selected=1; path=/; max-age=31536000; SameSite=Lax"
    setView("chat")
    router.replace("/")

    // Fetch and open detail panel directly (no LLM needed)
    if (accountParam) {
      fetchAccountData(accountParam, endpoint)
        .then((data) => setContext("account", data))
        .catch(() => {})
    }
    if (blockParam) {
      fetchBlockData(blockParam, endpoint)
        .then((data) => setContext("block", data))
        .catch(() => {})
    }
    if (txParam) {
      fetchTxData(txParam, endpoint, hyperionEndpoint)
        .then((data) => { if (data) setContext("transaction", data) })
        .catch(() => {})
    }
  }, [hasParam, txParam, accountParam, blockParam, chainParam, chainName, endpoint, hyperionEndpoint, connecting, presets, connect, setView, setContext, router])

  return null
}

export default function Home() {
  const { view } = usePanels()
  return (
    <>
      <Suspense>
        <DeepLinkHandler />
      </Suspense>
      <div className={view === "chat" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}>
        <ChatPanel />
      </div>
      {view === "dashboard" && <DashboardView />}
      <PromptLibrary />
    </>
  )
}
