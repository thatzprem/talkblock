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
