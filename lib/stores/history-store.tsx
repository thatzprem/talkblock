"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

interface HistoryState {
  recentSearches: string[]
  bookmarks: string[]
  addSearch: (query: string) => void
  addBookmark: (account: string) => void
  removeBookmark: (account: string) => void
  clearHistory: () => void
}

const HistoryContext = createContext<HistoryState | null>(null)

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [bookmarks, setBookmarks] = useState<string[]>([])

  useEffect(() => {
    const savedSearches = localStorage.getItem("recent_searches")
    const savedBookmarks = localStorage.getItem("bookmarks")
    if (savedSearches) {
      try { setRecentSearches(JSON.parse(savedSearches)) } catch {}
    }
    if (savedBookmarks) {
      try { setBookmarks(JSON.parse(savedBookmarks)) } catch {}
    }
  }, [])

  const addSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const next = [query, ...prev.filter((s) => s !== query)].slice(0, 20)
      localStorage.setItem("recent_searches", JSON.stringify(next))
      return next
    })
  }, [])

  const addBookmark = useCallback((account: string) => {
    setBookmarks((prev) => {
      if (prev.includes(account)) return prev
      const next = [account, ...prev]
      localStorage.setItem("bookmarks", JSON.stringify(next))
      return next
    })
  }, [])

  const removeBookmark = useCallback((account: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b !== account)
      localStorage.setItem("bookmarks", JSON.stringify(next))
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setRecentSearches([])
    localStorage.removeItem("recent_searches")
  }, [])

  return (
    <HistoryContext.Provider value={{ recentSearches, bookmarks, addSearch, addBookmark, removeBookmark, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const ctx = useContext(HistoryContext)
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider")
  return ctx
}
