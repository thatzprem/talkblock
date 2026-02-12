import type { ContractGuide } from "../index"

export const dgoods: ContractGuide = {
  contract: "dgoods",
  chains: ["eos", "wax", "telos"],
  summary: "dGoods NFT standard: create, issue, transfer, and burn digital goods",
  guide: `# dGoods — Digital Goods / NFT Standard

## Transfer

### transfernft — Send an NFT
- account: (dgoods contract account)
- action: "transfernft"
- data:
  - from: (sender)
  - to: (receiver)
  - dgood_ids: [1, 2, 3] (array of dGood IDs — numbers, not strings)
  - memo: ""

## Create Token Category

### create — Define a new token category
- account: (dgoods contract)
- action: "create"
- data:
  - issuer: (account)
  - category: "art" (category name)
  - token_name: "mypiece" (token name within category)
  - fungible: false (true for fungible, false for NFT)
  - burnable: true
  - transferable: true
  - max_supply: "100 MYTOKEN" (for fungible) or "0 MYTOKEN" (0 = unlimited for NFTs)

## Issue / Mint

### issue — Mint NFTs or fungible tokens
- account: (dgoods contract)
- action: "issue"
- data:
  - to: (receiver)
  - category: "art"
  - token_name: "mypiece"
  - quantity: "1 MYTOKEN" (for fungible) or "1" (for NFT, mints 1 copy)
  - relative_uri: "https://..." (metadata URI)
  - memo: ""`,
}
