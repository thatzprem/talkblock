# Talkblock

Chat-first blockchain explorer for [Antelope](https://antelope.io) chains. Ask questions in natural language, get structured results, sign transactions, and build a personal dashboard from bookmarked data.

**Live at [talkblock.me](https://talkblock.me)**

## Features

### Chat Interface
- Natural language queries about accounts, blocks, transactions, contracts, token balances, producers, and more
- Streaming responses with inline tool-result cards
- Quick-start suggestions that adapt to your connected wallet
- Conversation history with auto-save (server-side when authenticated, localStorage otherwise)
- Message optimization — older tool results are summarized to reduce token usage

### Multi-Chain Support
Connect to any Antelope chain out of the box:
- EOS Mainnet
- WAX Mainnet
- Telos Mainnet
- Jungle4 Testnet
- FIO Mainnet
- Libre
- Any custom RPC/Hyperion endpoint

### 23 AI Tools
The AI has access to a full suite of on-chain query and transaction tools:

**Core RPC (9 tools):** account lookup, block details, transaction lookup, table queries with secondary index support, ABI inspection, currency balance, producer list, transaction builder, and curated contract guides.

**Hyperion-powered (14 tools):** full action history, token transfers, created accounts, account creator, all token balances, key-to-account lookup, table deltas, voter lists, multisig proposals, permission links, transacted-accounts network analysis, historical ABI snapshots, and enhanced transaction traces.

### Contract Guides
8 curated knowledge guides the AI loads on-demand for accurate transaction building:
- `eosio.system` — staking, RAM, REX, voting, account creation, PowerUp
- `eosio.token` — token transfers, balance queries
- `eosio.msig` — multisig proposals, approvals, execution
- `atomicassets` — NFT collections, schemas, templates, minting (WAX/EOS)
- `telos.decide` — governance: treasuries, ballots, voting, committees
- `dgoods` — dGoods NFT standard
- `res.pink` — resource market/rental
- `thezeosalias` — CLOAK privacy protocol (EOS)

### Dashboard
- Bookmark any chat result and view it as a card on your dashboard
- 2-column grid with drag-and-drop reordering
- Rename cards with custom labels
- Auto-refresh on mount with manual refresh button
- Data age labels ("Refreshed 2m ago" / "Saved 3d ago")

### Transaction Building & Signing
- AI builds transaction proposals with editable input fields
- Sign and broadcast via Anchor wallet (Wharfkit)
- cleos command preview with copy button
- On error, the AI automatically retries with corrected parameters
- Shareable transaction links — copy a URL that auto-connects to the chain and opens the transaction

### Clickable Entities
Inline code in chat responses is automatically interactive:
- **Account names** — open the account detail panel
- **Transaction IDs** — open the transaction detail panel
- **Table names** — open the table explorer
- **Action names** — open the action builder

### Detail Panel
A slide-in panel on the right for deep exploration:
- **Account** — balance, RAM/CPU/NET resource bars, staking, permissions, voter info, contract tables and actions
- **Block** — block info, producer, transaction list
- **Transaction** — action traces, execution status
- **Table Explorer** — editable scope/bounds/sort, table view with column picker or card view for wide tables, pagination
- **Action Builder** — typed input fields from ABI, sign & broadcast, cleos preview

### Wallet Integration
- Connect via Anchor wallet (Wharfkit) on any supported chain
- Session auto-restore on page load
- Standalone Telos wallet for credit purchases (no chain switching needed)

### Credits & Billing
- **Free tier** — 5 AI requests per day per chain + account, no payment required
- **Paid credits** — purchase with TLOS on Telos Mainnet (1 TLOS = 250,000 tokens)
- Credits tied to chain + account (not a user ID)
- Server-side payment verification via Telos Hyperion
- Out-of-credits banner auto-clears when balance is replenished

### LLM Providers
- **Built-in (free)** — powered by Chutes with automatic model fallback
- **Bring Your Own Key** — Anthropic (Claude), OpenAI (GPT), Google (Gemini), or Chutes
- API keys stored locally per provider, never sent to the server

### Sidebar
- Chain info section (collapsed by default) with head block, producer, and chain ID
- Health status dot: green (RPC + Hyperion), yellow (RPC only), orange (Hyperion only), red (none)
- Health checks every 5 minutes
- Bookmark list with click-to-inject into chat
- Recent accounts (up to 10) with chain badges

### Deep Linking
URL parameters auto-connect to a chain and open the relevant panel:
- `?chain=EOS+Mainnet&account=myaccount`
- `?chain=Telos+Mainnet&tx=<txid>`
- `?chain=WAX+Mainnet&block=12345`

### Other
- 4 themes — Light, Dusk, Dim, Dark (persisted, no flash on load)
- Works fully without auth — all features fall back to localStorage
- Server-side proxy for RPC/Hyperion calls (no CORS issues)
- Disclaimer footer with GitHub link

## Tech Stack

- **Framework** — Next.js 16 (App Router, Turbopack)
- **UI** — React 19, Tailwind CSS 4, shadcn/ui, Lucide icons
- **AI** — Vercel AI SDK v6 with tool-calling for on-chain queries
- **Blockchain** — Wharfkit for wallet sessions and contract interaction
- **Database** — Supabase (optional, for auth and persistent bookmarks/conversations)
- **Auth** — JWT-based wallet authentication via Supabase
- **Markdown** — react-markdown with remark-gfm for tables and code blocks

## Getting Started

### Prerequisites

- Node.js >= 20.9.0

### Install

```bash
git clone https://github.com/sdabas9/talkblock.git
cd talkblock
npm install
```

### Configure

The app works in two modes:

**Without Supabase (BYOK only)** — no env file needed:

```bash
npm run dev
```

You configure your own LLM API key in the browser. Chat, bookmarks, and settings all use localStorage. Auth, credits, and server-side persistence are disabled.

**With Supabase (full features)** — copy the example env file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | For auth/persistence | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth/persistence | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | For auth/persistence | Supabase service role key (server-side only) |
| `SUPABASE_JWT_SECRET` | For auth/persistence | JWT secret for signing auth tokens |
| `CHUTES_API_KEY` | For built-in LLM | Chutes API key for the free built-in model |

When all four Supabase variables are set, you get: wallet-based auth, server-side bookmarks/conversations, per-account credits, and the built-in LLM tier.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), select a chain, configure your LLM provider, and start chatting.

## Project Structure

```
app/
  (app)/            — Main app layout and page (chat + dashboard)
  api/              — API routes (chat, auth, bookmarks, conversations, credits, settings, lookup proxy)
  login/            — Chain selection page
components/
  chat/             — Chat panel, message rendering, tool result cards
  context/          — Detail panel components (account, transaction, block, table, action)
  dashboard/        — Dashboard view and card components
  layout/           — App shell, header, sidebar, right detail panel
  chain/            — Chain selector
  settings/         — LLM settings
  wallet/           — Wallet button
  billing/          — Purchase credits dialog, usage summary
lib/
  antelope/         — Antelope helpers (data refetch, formatting, entity lookup)
  billing/          — Credit balance and usage logic
  contracts/        — Contract guide registry and per-contract guide files
  llm/              — LLM tool definitions, provider config, message optimization
  stores/           — React context stores (panel, history, dashboard, auth, chain, LLM, wallet, conversation, credits)
  supabase/         — Supabase client/server helpers
supabase/
  migrations/       — Database schema
```

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | Issue JWT for wallet-authenticated user |
| `/api/auth/logout` | POST | Invalidate session |
| `/api/chat` | POST | Streaming AI responses with tool execution |
| `/api/bookmarks` | GET/POST | List / create bookmarks |
| `/api/bookmarks/[id]` | DELETE/PATCH | Delete / update bookmark |
| `/api/conversations` | GET/POST | List / create conversations |
| `/api/conversations/[id]` | GET/POST/DELETE | Load messages / append / delete conversation |
| `/api/credits` | GET | Credit balance and usage stats |
| `/api/credits/verify` | POST | Verify TLOS payment and credit tokens |
| `/api/lookup` | POST | Server-side proxy for chain data lookups |
| `/api/settings` | GET/PUT | Read / update user LLM settings |

## License

MIT
