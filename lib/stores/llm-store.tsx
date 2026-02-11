"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

export type LLMProviderType = "anthropic" | "openai" | "google"

interface LLMConfig {
  provider: LLMProviderType
  apiKey: string
  model: string
}

const DEFAULT_MODELS: Record<LLMProviderType, string[]> = {
  anthropic: ["claude-sonnet-4-5-20250929", "claude-opus-4-6", "claude-haiku-4-5-20251001"],
  openai: ["gpt-4o", "gpt-4o-mini", "o1", "o3-mini"],
  google: ["gemini-2.0-flash", "gemini-2.0-pro"],
}

interface LLMState {
  config: LLMConfig | null
  availableModels: string[]
  isConfigured: boolean
  setProvider: (provider: LLMProviderType) => void
  setApiKey: (key: string) => void
  setModel: (model: string) => void
  getModelsForProvider: (provider: LLMProviderType) => string[]
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

  const setProvider = useCallback((provider: LLMProviderType) => {
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

  const getModelsForProvider = useCallback((provider: LLMProviderType) => {
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

export function useLLM() {
  const ctx = useContext(LLMContext)
  if (!ctx) throw new Error("useLLM must be used within LLMProvider")
  return ctx
}
