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
