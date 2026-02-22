"use client"

import { PanelProvider, usePanels } from "@/lib/stores/panel-store"
import { AuthProvider } from "@/lib/stores/auth-store"
import { ChainProvider } from "@/lib/stores/chain-store"
import { LLMProvider } from "@/lib/stores/llm-store"
import { WalletProvider } from "@/lib/stores/wallet-store"
import { ConversationProvider } from "@/lib/stores/conversation-store"
import { ContextProvider, useDetailContext } from "@/lib/stores/context-store"
import { HistoryProvider } from "@/lib/stores/history-store"
import { DashboardProvider } from "@/lib/stores/dashboard-store"
import { CreditsProvider } from "@/lib/stores/credits-store"
import { Header } from "./header"
import { LeftPanel } from "./left-panel"
import { RightPanel } from "./right-panel"
import { FeedbackDialog } from "@/components/feedback/feedback-dialog"
import { FaqDialog } from "@/components/faq/faq-dialog"

function AppLayout({ children }: { children: React.ReactNode }) {
  const { expanded, type, data } = useDetailContext()
  const { leftOpen, toggleLeft } = usePanels()
  const panelOpen = !!type && !!data

  return (
    <div className="h-screen flex flex-col overflow-x-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden relative">
        {/* Tap-outside backdrop — mobile only */}
        {leftOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-10 md:hidden"
            onClick={toggleLeft}
          />
        )}
        <div className={expanded && panelOpen ? "hidden" : "contents"}>
          <LeftPanel />
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
        </div>
        <RightPanel />
      </div>
      <footer className="border-t px-4 py-1.5 flex items-center justify-between text-[11px] text-muted-foreground/60 shrink-0">
        <span className="hidden sm:block truncate mr-2">TalkToXPR is experimental. AI responses may be inaccurate. Always verify transactions before signing.</span>
        <span className="sm:hidden truncate mr-2">Experimental — verify before signing.</span>
        <div className="flex items-center gap-3 shrink-0">
          <FaqDialog />
          <FeedbackDialog />
        </div>
      </footer>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
    <ChainProvider>
      <WalletProvider>
        <LLMProvider>
          <CreditsProvider>
          <ConversationProvider>
          <ContextProvider>
            <HistoryProvider>
            <DashboardProvider>
              <PanelProvider>
                <AppLayout>{children}</AppLayout>
              </PanelProvider>
            </DashboardProvider>
            </HistoryProvider>
          </ContextProvider>
          </ConversationProvider>
          </CreditsProvider>
        </LLMProvider>
      </WalletProvider>
    </ChainProvider>
    </AuthProvider>
  )
}
