import type { ContractGuide } from "../index"

export const telosDecide: ContractGuide = {
  contract: "telos.decide",
  chains: ["telos"],
  summary: "Telos governance: create ballots, register voters, cast votes",
  guide: `# telos.decide — Telos Governance Contract Guide

## Key Concepts
- Treasury: a token-based voting group
- Ballot: a proposal/poll that treasury members vote on
- Voter: must register with a treasury before voting

## Register as Voter

### regvoter — Register for a treasury
- account: "telos.decide"
- action: "regvoter"
- data:
  - voter: (account registering)
  - treasury_symbol: "4,VOTE" (precision + symbol of the treasury)
  - referrer: null (optional referrer account)

## Cast a Vote

### castvote — Vote on a ballot
- account: "telos.decide"
- action: "castvote"
- data:
  - voter: (registered voter account)
  - ballot_name: (name of the ballot)
  - options: ["yes"] (array of option names — usually "yes", "no", "abstain")

## Create a Ballot

### newballot — Create a new ballot
- account: "telos.decide"
- action: "newballot"
- data:
  - ballot_name: (unique name, up to 12 chars)
  - category: "proposal" (or "election", "poll", etc.)
  - publisher: (creator account)
  - treasury_symbol: "4,VOTE"
  - voting_method: "1token1vote" (or "1acct1vote", "quadratic")
  - initial_options: ["yes", "no", "abstain"]

### openvoting — Open ballot for voting
- account: "telos.decide"
- action: "openvoting"
- data:
  - ballot_name: (ballot to open)
  - end_time: "2025-12-31T23:59:59" (ISO 8601)

### closevoting — Close voting
- account: "telos.decide"
- action: "closevoting"
- data:
  - ballot_name: (ballot to close)
  - broadcast: true (whether to broadcast results)

## Querying
- Table: code="telos.decide", table="ballots", scope="telos.decide" → list ballots
- Table: code="telos.decide", table="voters", scope=<treasury_symbol> → list voters
- Table: code="telos.decide", table="treasuries", scope="telos.decide" → list treasuries`,
}
