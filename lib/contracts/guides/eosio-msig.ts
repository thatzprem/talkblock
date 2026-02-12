import type { ContractGuide } from "../index"

export const eosioMsig: ContractGuide = {
  contract: "eosio.msig",
  chains: ["*"],
  summary: "Multisig proposals: propose, approve, execute multi-signature transactions",
  guide: `# eosio.msig — Multisig Contract Guide

## Workflow
1. propose — Create a proposal with the transaction and required approvals
2. approve — Each required signer approves
3. exec — Anyone executes once all approvals are collected
4. (optional) cancel — Proposer can cancel anytime before execution

## propose — Create a multisig proposal
- account: "eosio.msig"
- action: "propose"
- data:
  - proposer: (account creating the proposal)
  - proposal_name: (unique name, up to 12 chars, a-z1-5)
  - requested: [{ actor: "account1", permission: "active" }, { actor: "account2", permission: "active" }]
  - trx: {
      expiration: "2025-12-31T23:59:59" (must be in the future),
      ref_block_num: 0,
      ref_block_prefix: 0,
      max_net_usage_words: 0,
      max_cpu_usage_ms: 0,
      delay_sec: 0,
      actions: [{ account: "eosio.token", name: "transfer", authorization: [...], data: "..." }]
    }
- NOTE: The "data" field in actions must be hex-encoded. Use the chain's /v1/chain/abi_json_to_bin endpoint to convert JSON action data to hex.

## approve — Approve a proposal
- account: "eosio.msig"
- action: "approve"
- data:
  - proposer: (who created the proposal)
  - proposal_name: (name of the proposal)
  - level: { actor: "myaccount", permission: "active" }

## exec — Execute an approved proposal
- account: "eosio.msig"
- action: "exec"
- data:
  - proposer: (who created the proposal)
  - proposal_name: (name of the proposal)
  - executer: (account paying for execution CPU/NET)

## cancel — Cancel a proposal
- account: "eosio.msig"
- action: "cancel"
- data:
  - proposer: (must be the original proposer)
  - proposal_name: (name)
  - canceler: (must be proposer)

## Querying Proposals
- Table: code="eosio.msig", table="proposal", scope=<proposer> → list proposals
- Table: code="eosio.msig", table="approvals2", scope=<proposer> → see who approved`,
}
