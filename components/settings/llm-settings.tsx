"use client"

import { useLLM, LLMProviderType } from "@/lib/stores/llm-store"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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
        <Button variant="ghost" size="icon" className="relative">
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
                  <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
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
