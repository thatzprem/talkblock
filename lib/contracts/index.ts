/**
 * Contract guide registry.
 *
 * Curated knowledge about Antelope smart contracts that the LLM can
 * look up on-demand via the get_contract_guide tool. Each guide covers
 * action workflows, parameter formats, table scopes, and common gotchas
 * so the LLM can build correct transactions without guessing.
 *
 * Guides live in ./guides.ts — edit that file to add or update guides.
 */

export interface ContractGuide {
  /** Contract account name (e.g. "eosio.system") */
  contract: string
  /** Chain names this guide applies to. Use ["*"] for all Antelope chains. */
  chains: string[]
  /** One-line description */
  summary: string
  /** Full guide text — this is what the LLM reads */
  guide: string
}

import { GUIDES } from "./guides"

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/**
 * Find a guide by contract name, optionally filtered by chain.
 * Chain matching: guide applies if chains includes "*" or includes
 * a chain name that is a substring of the provided chain hint
 * (e.g. chain="eos" matches "EOS Mainnet").
 */
export function getContractGuide(contract: string, chainHint?: string): ContractGuide | null {
  const lower = contract.toLowerCase()
  const chainLower = chainHint?.toLowerCase() || ""

  for (const g of GUIDES) {
    if (g.contract.toLowerCase() !== lower) continue
    // Check chain match
    if (g.chains.includes("*")) return g
    if (chainLower && g.chains.some((c) => chainLower.includes(c) || c.includes(chainLower))) return g
    if (!chainLower) return g // no chain filter, return first match
  }
  return null
}

/**
 * List all available guides, optionally filtered by chain.
 */
export function listAvailableGuides(chainHint?: string): { contract: string; summary: string }[] {
  const chainLower = chainHint?.toLowerCase() || ""
  return GUIDES
    .filter((g) => {
      if (g.chains.includes("*")) return true
      if (!chainLower) return true
      return g.chains.some((c) => chainLower.includes(c) || c.includes(chainLower))
    })
    .map((g) => ({ contract: g.contract, summary: g.summary }))
}
