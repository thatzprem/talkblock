"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type View = "chat" | "dashboard"

interface PanelState {
  leftOpen: boolean
  view: View
  toggleLeft: () => void
  setView: (view: View) => void
}

const PanelContext = createContext<PanelState | null>(null)

export function PanelProvider({ children }: { children: ReactNode }) {
  // Default closed; open on desktop after mount (avoids SSR hydration mismatch)
  const [leftOpen, setLeftOpen] = useState(false)
  useEffect(() => {
    setLeftOpen(window.innerWidth >= 768)
  }, [])
  const [view, setView] = useState<View>("chat")

  return (
    <PanelContext.Provider
      value={{
        leftOpen,
        view,
        toggleLeft: () => setLeftOpen((v) => !v),
        setView,
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
