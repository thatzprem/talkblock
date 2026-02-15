import type { ContractGuide } from "../index"

export const thezeosalias: ContractGuide = {
  contract: "thezeosalias",
  chains: ["telos"],
  summary: "CLOAK privacy protocol: shielded transactions, mint/spend/withdraw with zk-SNARKs, CLOAK token auction",
  guide: `# thezeosalias — CLOAK Privacy Protocol Guide

## Key Concepts
- **Shielded Pool**: A pool of tokens hidden behind zero-knowledge proofs. Tokens enter via mint, move privately via spend, and exit via withdraw.
- **Commitment (cm)**: A cryptographic hash representing a shielded UTXO (unspent transaction output). Created when tokens are minted into the shielded pool.
- **Nullifier (nf)**: A unique value revealed when spending a commitment, preventing double-spending without revealing which commitment was spent.
- **Merkle Tree**: All commitments are stored in an on-chain Merkle tree. Spend proofs reference a tree root to prove membership.
- **Note (note_ct)**: Encrypted transaction data that only the recipient can decrypt to learn the amount, asset, and sender.
- **zk-SNARK Proof**: A Groth16 zero-knowledge proof that verifies the transaction is valid without revealing private details.
- **CLOAK Token**: The protocol's native token (4 decimals, contract: thezeostoken). Used to pay fees for privacy operations.

## Fee Structure
Fees are paid in CLOAK. 50% of fees are burned.

| Action         | Fee          |
|----------------|--------------|
| authenticate   | 0.1000 CLOAK |
| begin          | 0.2000 CLOAK |
| mint           | 0.1000 CLOAK |
| output         | 0.1000 CLOAK |
| publishnotes   | 0.1000 CLOAK |
| spend          | 0.1000 CLOAK |
| spendoutput    | 0.1000 CLOAK |

## Privacy Actions

### Transaction Lifecycle
Privacy transactions follow this pattern:
1. **begin** — Opens a transaction batch (action buffer)
2. **mint / spend / authenticate** — One or more privacy operations
3. **end** — Finalizes the batch and executes all buffered actions

### mint — Shield tokens (public → shielded pool)
- account: "thezeosalias"
- action: "mint"
- data:
  - actions: pls_mint[] — array of mint operations, each containing:
    - cm: bytes (commitment hash)
    - value: uint64 (token amount in base units)
    - symbol: uint64 (token symbol code)
    - contract: name (token contract, e.g. "eosio.token")
    - proof: bytes (Groth16 zk-SNARK proof)
  - note_ct: string[] (encrypted notes for recipients)

IMPORTANT: Before minting, you must transfer the tokens to "thezeosalias" first. The mint action then creates a shielded commitment for those tokens.

### spend — Transfer within shielded pool or unshield
- account: "thezeosalias"
- action: "spend"
- data:
  - actions: pls_spend_sequence[] — array of spend sequences, each containing:
    - scm: bytes (spend commitment)
    - spend_output: pls_spend_output[] — outputs that reveal value for unshielding:
      - root: bytes (Merkle tree root)
      - nf: bytes (nullifier — prevents double-spend)
      - cm_b: bytes (output commitment)
      - cv_net_u/cv_net_v: bytes (Pedersen commitment components)
      - value_c: uint64 (cleartext value for unshielding)
      - symbol: symbol (token symbol)
      - contract: name (token contract)
      - cv_eq_gt: uint8 (comparison flag)
      - proof: bytes (zk-SNARK proof)
      - unshielded_outputs: array of { amount, account, memo } for public recipients
    - spend: pls_spend[] — private-to-private spends:
      - root, nf, cv_u, cv_v, proof
    - output: pls_output[] — new shielded outputs:
      - cm, cv_u, cv_v, proof
  - note_ct: string[] (encrypted notes)

### authenticate — Execute smart contract actions anonymously
- account: "thezeosalias"
- action: "authenticate"
- data:
  - action: pls_authenticate containing:
    - cm: bytes (commitment proving authorization)
    - contract: name (target contract to call)
    - actions: action[] (inline actions to execute)
    - burn: uint8 (whether to burn the commitment after use)
    - proof: bytes (zk-SNARK proof)

This allows calling any smart contract action while hiding the caller's identity behind a zero-knowledge proof.

### withdraw — Unshield tokens (shielded pool → public account)
- account: "thezeosalias"
- action: "withdraw"
- data:
  - actions: pls_withdraw[] — array of withdrawals:
    - contract: name (token contract, e.g. "eosio.token")
    - value: uint64 (amount in base units)
    - symbol: uint64 (token symbol)
    - memo: string
    - to: name (recipient public account)

### publishnotes — Publish encrypted notes
- account: "thezeosalias"
- action: "publishnotes"
- data:
  - note_ct: string[] (encrypted note ciphertexts)

Recipients use their private viewing key to decrypt notes and discover incoming shielded transfers.

### begin — Start transaction batch
- account: "thezeosalias"
- action: "begin"
- data: (none)

### end — Finalize transaction batch
- account: "thezeosalias"
- action: "end"
- data: (none)

## CLOAK Token Auction

The CLOAK token is distributed via a batch auction system where participants contribute TLOS to receive CLOAK tokens proportionally.

### Auction Configuration
- 60 rounds total
- 1,638,001.6380 CLOAK distributed per round
- Minimum contribution: 100.0000 TLOS
- Contributions via transfer to "thezeosalias" with appropriate memo
- 5x stake rate for contributed TLOS

### claimauction — Claim CLOAK tokens from a completed round
- account: "thezeosalias"
- action: "claimauction"
- data:
  - user: name (account claiming)
  - round: uint32 (auction round number)

### claimauctiop — Claim auction (permissionless variant)
- account: "thezeosalias"
- action: "claimauctiop"
- data:
  - round: uint32 (auction round number)

## Admin Actions

### blacklistadd — Add account to blacklist
- account: "thezeosalias"
- action: "blacklistadd"
- data:
  - account: name (account to blacklist)

### setfee — Set fee for an action
- account: "thezeosalias"
- action: "setfee"
- data:
  - action: name (action name)
  - quantity: asset (fee amount, e.g. "0.1000 CLOAK")

### initfees — Initialize fee table
- account: "thezeosalias"
- action: "initfees"
- data:
  - row: fees object (token_contract, symbol_code, fees array, burn_rate)

### removefees — Remove all fees
- account: "thezeosalias"
- action: "removefees"
- data: (none)

### auctioncfg — Set auction configuration
- account: "thezeosalias"
- action: "auctioncfg"
- data:
  - row: auction_cfg object

### rmauctioncfg — Remove auction configuration
- account: "thezeosalias"
- action: "rmauctioncfg"
- data: (none)

## Querying Tables

### Fees
- code: "thezeosalias", table: "fees", scope: "thezeosalias"
- Returns: token_contract, symbol_code, fees (action→amount pairs), burn_rate

### Auction Configuration
- code: "thezeosalias", table: "auctioncfg", scope: "thezeosalias"
- Returns: start_block_time, round_duration_sec, number_of_rounds, tokens_per_round, token_contract, min_contribution, stake_rate

### Auction Stats (totals)
- code: "thezeosalias", table: "auctionstat", scope: "thezeosalias"
- Returns: amount_contributed, amount_staked

### Auction Bids (per round)
- code: "thezeosalias", table: "auction", scope: <round_number>
- Returns per-user rows: user (name or bytes), amount (contribution in base units), claimed (bool)
- IMPORTANT: scope is the round number (0-indexed)

### Burned CLOAK Total
- code: "thezeosalias", table: "burned", scope: "thezeosalias"
- Returns: amount (total CLOAK burned, in base units — divide by 10000 for human-readable)

### Blacklist
- code: "thezeosalias", table: "blacklist", scope: "thezeosalias"
- Returns: list of blacklisted account names

### Action Buffer (internal)
- code: "thezeosalias", table: "actionbuffer", scope: "thezeosalias"
- Returns: buffered mint/spend/authenticate/withdraw actions (normally empty between transactions)

### Execution State (internal)
- code: "thezeosalias", table: "exec", scope: "thezeosalias"
- Returns: prev_balance, fee (used during transaction execution)

## Common Queries

### Check current fees
Query the fees table to see per-action CLOAK costs and burn rate.

### Check auction status
1. Query auctioncfg for round timing and token amounts
2. Query auctionstat for total contributions
3. Query auction table with scope=<round> to see bids for a specific round

### Check total CLOAK burned
Query the burned table — amount is in base units (4 decimal places).

### Check if an account is blacklisted
Query the blacklist table and look for the account name.`,
}
