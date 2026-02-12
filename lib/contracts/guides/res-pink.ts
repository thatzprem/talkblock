import type { ContractGuide } from "../index"

export const resPink: ContractGuide = {
  contract: "res.pink",
  chains: ["wax"],
  summary: "WAX resource helper: powerup CPU/NET on WAX network",
  guide: `# res.pink — WAX Resource Powerup

## noop — Free CPU/NET powerup
On WAX, the res.pink contract provides free CPU/NET for basic transactions.
- account: "res.pink"
- action: "noop"
- data: {} (no parameters needed)
- NOTE: Add this as the FIRST action in your transaction. It pays for CPU/NET for the remaining actions. Many WAX transactions include this action.

## boost — Boost resources for heavy transactions
- account: "boost.wax"
- action: "noop"
- data: {}
- NOTE: Alternative/additional free resource provider on WAX.`,
}
