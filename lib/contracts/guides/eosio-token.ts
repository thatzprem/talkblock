import type { ContractGuide } from "../index"

export const eosioToken: ContractGuide = {
  contract: "eosio.token",
  chains: ["*"],
  summary: "Standard token contract: transfers, token creation, supply queries",
  guide: `# eosio.token — Token Contract Guide

## Transfer

### transfer — Send tokens
- account: "eosio.token" (or the specific token contract)
- action: "transfer"
- data:
  - from: (sender account)
  - to: (receiver account)
  - quantity: "1.0000 EOS" (MUST match exact precision and symbol)
  - memo: "" (string, can be empty, max 256 chars)

### CRITICAL — Quantity Format
The quantity MUST match the token's exact precision and symbol:
- EOS: "1.0000 EOS" (4 decimals)
- WAX: "1.00000000 WAX" (8 decimals)
- TLOS: "1.0000 TLOS" (4 decimals)
- USDT on EOS: "1.0000 USDT" (4 decimals, contract: tethertether)
- Wrong precision = transaction FAILS with "symbol precision mismatch"

### How to find token precision
1. get_currency_balance on the token contract for any known holder
2. Or query table: code=<token_contract>, table="stat", scope=<SYMBOL> → look at "max_supply" field for precision

## Token Creation (for contract deployers)

### create — Create a new token
- account: (token contract account)
- action: "create"
- data:
  - issuer: (account that can issue)
  - maximum_supply: "1000000.0000 EOS"

### issue — Issue tokens to issuer
- account: (token contract)
- action: "issue"
- data:
  - to: (must be the issuer)
  - quantity: "100.0000 EOS"
  - memo: ""

## Querying Balances
- Table: code=<token_contract>, table="accounts", scope=<account_name>
- Table: code=<token_contract>, table="stat", scope=<SYMBOL> → supply info

## Common Token Contracts by Chain
- EOS: eosio.token (EOS), tethertether (USDT), everipediaiq (IQ)
- WAX: eosio.token (WAX)
- Telos: eosio.token (TLOS), tokens.swaps (various)`,
}
