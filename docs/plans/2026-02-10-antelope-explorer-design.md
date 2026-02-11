# Antelope Web Explorer — Design Document

## Overview

A chat-first, chain-agnostic Antelope blockchain explorer with wallet integration and LLM copilot. The LLM conversation is the primary interface — explorer views are supporting panels.

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS + shadcn/ui** for styling/components
- **Wharfkit** for wallet connection and transaction signing
- **Vercel AI SDK** for multi-provider LLM chat (Claude, GPT, Google, etc.)

## Layout

```
┌──────────────────────────────────────┐
│  [Chain Selector]     [Wallet Connect]│
├─────────┬────────────────┬───────────┤
│         │                │           │
│  Quick  │   LLM Chat     │  Context  │
│  Links  │   (center)     │  Panel    │
│  Nav    │                │  (detail  │
│         │  Messages      │   view of │
│         │  + inline      │   account,│
│         │  tx proposals  │   tx,     │
│         │  + data cards  │   block)  │
│         │                │           │
│         │  [input bar]   │           │
├─────────┴────────────────┴───────────┘
```

- **Center column** — chat with the LLM. Rich inline cards for accounts, transactions, blocks, and transaction proposals.
- **Right panel** — detail/context view that opens when clicking inline cards. Collapsible.
- **Left panel** — minimal nav with quick actions, recent searches, bookmarks. Collapsible.

## LLM Chat System

### Multi-Provider Support

Users configure their LLM in a settings modal:
- Provider selector (Anthropic, OpenAI, Google, etc.)
- API key input (stored in browser localStorage, never sent to server)
- Model selector per provider

### Data Flow

1. Chat requests go to Next.js API route (`/api/chat`) which forwards to selected provider via Vercel AI SDK
2. User's API key passed via request header — server is a stateless proxy
3. Conversation history maintained client-side

### LLM Tools (Function Calling)

| Tool | Description |
|------|-------------|
| `get_account` | Fetch account info (balances, resources, permissions) |
| `get_transaction` | Look up transaction by ID |
| `get_block` | Fetch block by number |
| `get_table_rows` | Query contract tables |
| `get_abi` | Fetch contract ABI |
| `get_currency_balance` | Token balances for an account |
| `get_producers` | Block producer list |
| `build_transaction` | Build a transaction proposal for user to sign |

Tool results render as **rich cards** inline in chat. `build_transaction` renders a proposal card with a **"Sign & Broadcast"** button.

## Context Awareness

- When user opens an account/transaction/block in the right panel, that data is injected into LLM context
- Chat input shows a tag like `Viewing: eosio.token`
- Enables natural follow-ups: "what does this contract do?", "show recent transfers"

## Inline Rich Cards

- **Account card** — name, balances, resources; clickable to open in right panel
- **Transaction card** — action summary, status, block number
- **Block card** — producer, timestamp, transaction count
- **Table data card** — formatted rows from contract tables
- **Transaction proposal card** — action details + "Sign & Broadcast" button; shows result after broadcast

## Chain Connection

- User enters an RPC endpoint URL or picks from preset list of known chains
- All chain reads go directly from browser to RPC endpoint (no backend proxy)
- Chain info (chain ID, name) auto-detected on connect

## Wallet Flow

1. User clicks "Connect Wallet" → Wharfkit session kit opens wallet selector
2. Session persists in browser; connected account shown in header
3. LLM proposes transaction → user clicks "Sign & Broadcast" → Wharfkit signs → broadcasts to RPC → result card in chat

## Transaction Building

All transaction building flows through the LLM chat. No manual action forms. User describes what they want in natural language, LLM builds the transaction, user reviews and signs.

## Explorer Features

- Search (accounts, transactions, blocks)
- Account details (balances, resources, permissions)
- Transaction viewer
- Block viewer
- ABI viewer + table browser
- Token transfers (via LLM)
- RAM/CPU/NET management (via LLM)
- Multisig proposals
- Block producer info

## Scope Boundaries (v1)

**Included:**
- Fully client-side + direct RPC
- Multi-provider LLM with user-supplied API keys
- Wharfkit wallet integration
- Chain-agnostic (any Antelope RPC endpoint)

**Deferred to later versions:**
- Backend database
- User accounts / authentication
- Transaction history storage
- Indexing / Hyperion integration
