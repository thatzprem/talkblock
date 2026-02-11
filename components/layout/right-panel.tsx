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
