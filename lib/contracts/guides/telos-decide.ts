import type { ContractGuide } from "../index"

export const telosDecide: ContractGuide = {
  contract: "telos.decide",
  chains: ["telos"],
  summary: "Telos governance engine: treasuries, ballots, voting, committees, worker payroll",
  guide: `# telos.decide — Telos Governance Engine Guide

## Key Concepts
- Treasury: token-based voting group with configurable settings (e.g. VOTE treasury)
- Ballot: a proposal/poll/election that treasury members vote on
- Voter: must register with a treasury before voting
- Committee: named group of seats managed by an updater account
- Worker: earns payroll by performing vote rebalances and cleanups
- Deposit: TLOS held in the contract to pay fees (transfer TLOS to telos.decide to deposit)

## Voting Methods
- 1acct1vote: one vote per account regardless of token balance
- 1tokennvote: full balance applied to every selected option
- 1token1vote: balance split equally across selected options
- 1tsquare1v: balance squared per selection, sqrt applied at close
- quadratic: balance sqrt'd, then split across selections

## Ballot Categories
- proposal, referendum, election, poll, leaderboard

## Ballot Lifecycle
- setup → voting → closed → (optionally archived); can also be cancelled at any point before close

## Treasury Settings (all default disabled)
- transferable, burnable, reclaimable, stakeable, unstakeable, maxmutable

## Treasury Access
- public (anyone can register), private (manager must authorize), invite (existing voter refers)

## Deposit & Withdraw

Fees are paid from your TLOS deposit balance in the contract.

### Deposit — Transfer TLOS to telos.decide
- Use a standard eosio.token::transfer to "telos.decide" with any memo (memo "skip" bypasses deposit)
- The contract's catch_transfer handler credits your account

### withdraw — Withdraw deposited TLOS
- account: "telos.decide"
- action: "withdraw"
- data:
  - voter: (account withdrawing)
  - quantity: "10.0000 TLOS"

## Voter Actions

### regvoter — Register for a treasury
- account: "telos.decide"
- action: "regvoter"
- data:
  - voter: (account registering)
  - treasury_symbol: "4,VOTE" (precision + symbol of the treasury)
  - referrer: null (optional referrer account, required for invite-access treasuries)
- NOTE: For private treasuries, manager auth is also required. For invite-access, referrer auth is required.

### unregvoter — Unregister from a treasury
- account: "telos.decide"
- action: "unregvoter"
- data:
  - voter: (account unregistering)
  - treasury_symbol: "4,VOTE"
- NOTE: Requires liquid=0 and staked=0 balance.

### castvote — Vote on a ballot
- account: "telos.decide"
- action: "castvote"
- data:
  - voter: (registered voter account)
  - ballot_name: (name of the ballot)
  - options: ["yes"] (array of option names — usually "yes", "no", "abstain")
- NOTE: Ballot must be in "voting" status and within its time window. Revoting allowed if ballot has "revotable" setting enabled.

### unvoteall — Retract all votes on a ballot
- account: "telos.decide"
- action: "unvoteall"
- data:
  - voter: (account retracting)
  - ballot_name: (ballot name)

### stake — Stake treasury tokens
- account: "telos.decide"
- action: "stake"
- data:
  - voter: (account staking)
  - quantity: "100.0000 VOTE"
- NOTE: Treasury must have "stakeable" setting enabled.

### unstake — Unstake treasury tokens
- account: "telos.decide"
- action: "unstake"
- data:
  - voter: (account unstaking)
  - quantity: "100.0000 VOTE"
- NOTE: Treasury must have "unstakeable" setting enabled.

### refresh — Sync external TLOS stake with VOTE balance
- account: "telos.decide"
- action: "refresh"
- data:
  - voter: (account to refresh)
- NOTE: The VOTE treasury auto-syncs with TLOS staking via delegatebw/undelegatebw notifications, but refresh can force a manual sync.

## Ballot Actions

### newballot — Create a new ballot
- account: "telos.decide"
- action: "newballot"
- data:
  - ballot_name: (unique name, up to 12 chars a-z1-5)
  - category: "proposal" (or "referendum", "election", "poll", "leaderboard")
  - publisher: (creator account)
  - treasury_symbol: "4,VOTE"
  - voting_method: "1token1vote" (or "1acct1vote", "1tokennvote", "1tsquare1v", "quadratic")
  - initial_options: ["yes", "no", "abstain"]
- NOTE: Costs a fee (default ~30 TLOS) deducted from deposit balance. Default settings: revotable=true, lightballot=false.

### editdetails — Edit ballot title/description/content
- account: "telos.decide"
- action: "editdetails"
- data:
  - ballot_name: (ballot to edit)
  - title: "My Proposal Title"
  - description: "Proposal description"
  - content: "Detailed content or IPFS hash"
- NOTE: Ballot must be in "setup" status.

### togglebal — Toggle a ballot setting
- account: "telos.decide"
- action: "togglebal"
- data:
  - ballot_name: (ballot name)
  - setting_name: "revotable" (or "lightballot", "votestake")
- NOTE: Must be in "setup" status. votestake uses staked balance for vote weight.

### editminmax — Set min/max selectable options
- account: "telos.decide"
- action: "editminmax"
- data:
  - ballot_name: (ballot name)
  - new_min_options: 1
  - new_max_options: 3
- NOTE: max >= min, max <= total options count.

### addoption — Add an option to a ballot
- account: "telos.decide"
- action: "addoption"
- data:
  - ballot_name: (ballot name)
  - new_option_name: "option4"
- NOTE: Must be in "setup" status.

### rmvoption — Remove an option from a ballot
- account: "telos.decide"
- action: "rmvoption"
- data:
  - ballot_name: (ballot name)
  - option_name: "option4"
- NOTE: Must be in "setup" status. Auto-adjusts min/max if needed.

### openvoting — Open ballot for voting
- account: "telos.decide"
- action: "openvoting"
- data:
  - ballot_name: (ballot to open)
  - end_time: "2026-12-31T23:59:59" (ISO 8601)
- NOTE: end_time must be >= now + minimum ballot length (default 60s). Sets begin_time to now.

### cancelballot — Cancel a ballot
- account: "telos.decide"
- action: "cancelballot"
- data:
  - ballot_name: (ballot to cancel)
  - memo: "reason for cancellation"

### closevoting — Close voting and finalize results
- account: "telos.decide"
- action: "closevoting"
- data:
  - ballot_name: (ballot to close)
  - broadcast: true (whether to broadcast results to external contracts)
- NOTE: For 1tsquare1v method, sqrt is applied to final tallies at close time.

### deleteballot — Delete a ballot (recover RAM)
- account: "telos.decide"
- action: "deleteballot"
- data:
  - ballot_name: (ballot to delete)
- NOTE: Requires cooldown period past end_time (default 1 day), all votes must be cleaned up first, status must not be "voting" or "archived".

### archive — Archive a closed ballot
- account: "telos.decide"
- action: "archive"
- data:
  - ballot_name: (ballot to archive)
  - archived_until: "2026-12-31T23:59:59" (ISO 8601)
- NOTE: Fee ~3 TLOS/day deducted from deposit.

### unarchive — Unarchive a ballot
- account: "telos.decide"
- action: "unarchive"
- data:
  - ballot_name: (ballot name)
  - force: false (true = forfeit remaining prepaid archival time)

## Treasury Management

### newtreasury — Create a new treasury
- account: "telos.decide"
- action: "newtreasury"
- data:
  - manager: (managing account)
  - max_supply: "1000000.0000 MYTOKEN" (precision + symbol defines the treasury)
  - access: "public" (or "private", "invite")
- NOTE: Fee ~1000 TLOS from deposit. All settings default to disabled.

### edittrsinfo — Edit treasury metadata
- account: "telos.decide"
- action: "edittrsinfo"
- data:
  - treasury_symbol: "4,VOTE"
  - title: "Treasury Title"
  - description: "Description text"
  - icon: "https://example.com/icon.png"
- NOTE: Treasury must be unlocked.

### toggle — Toggle a treasury setting
- account: "telos.decide"
- action: "toggle"
- data:
  - treasury_symbol: "4,VOTE"
  - setting_name: "transferable" (or "burnable", "reclaimable", "stakeable", "unstakeable", "maxmutable")
- NOTE: Treasury must be unlocked.

### mint — Mint tokens to a voter
- account: "telos.decide"
- action: "mint"
- data:
  - to: (registered voter account)
  - quantity: "100.0000 VOTE"
  - memo: "minting reason"
- NOTE: Cannot exceed max_supply. Authorized by treasury manager.

### transfer — Transfer treasury tokens
- account: "telos.decide"
- action: "transfer"
- data:
  - from: (sender, must be registered voter)
  - to: (recipient, must be registered voter)
  - quantity: "50.0000 VOTE"
  - memo: "transfer memo"
- NOTE: Treasury must have "transferable" setting enabled.

### burn — Burn treasury tokens
- account: "telos.decide"
- action: "burn"
- data:
  - quantity: "50.0000 VOTE"
  - memo: "burn reason"
- NOTE: Burns from manager's liquid balance. Requires "burnable" setting.

### reclaim — Reclaim tokens from a voter
- account: "telos.decide"
- action: "reclaim"
- data:
  - voter: (voter to reclaim from, cannot be manager)
  - quantity: "50.0000 VOTE"
  - memo: "reclaim reason"
- NOTE: Requires "reclaimable" setting. Tokens returned to manager.

### mutatemax — Change treasury max supply
- account: "telos.decide"
- action: "mutatemax"
- data:
  - new_max_supply: "2000000.0000 VOTE"
  - memo: "increasing supply cap"
- NOTE: Can only increase, not decrease below current supply. Requires "maxmutable" setting.

### lock — Lock the treasury
- account: "telos.decide"
- action: "lock"
- data:
  - treasury_symbol: "4,VOTE"
- NOTE: Prevents settings changes until unlocked.

### unlock — Unlock a locked treasury
- account: "telos.decide"
- action: "unlock"
- data:
  - treasury_symbol: "4,VOTE"
- NOTE: Requires the unlock_acct@unlock_auth permission set by setunlocker.

### setunlocker — Set treasury unlock authority
- account: "telos.decide"
- action: "setunlocker"
- data:
  - treasury_symbol: "4,VOTE"
  - new_unlock_acct: "someaccount"
  - new_unlock_auth: "active"

## Committee Actions

### regcommittee — Register a committee
- account: "telos.decide"
- action: "regcommittee"
- data:
  - committee_name: "mycommittee"
  - committee_title: "My Committee"
  - treasury_symbol: "4,VOTE"
  - initial_seats: ["seat1", "seat2", "seat3"]
  - registree: (account registering and paying fee)
- NOTE: Fee ~100 TLOS from deposit.

### addseat — Add a seat to a committee
- account: "telos.decide"
- action: "addseat"
- data:
  - committee_name: "mycommittee"
  - treasury_symbol: "4,VOTE"
  - new_seat_name: "seat4"
- NOTE: Authorized by updater_acct@updater_auth.

### removeseat — Remove a seat from a committee
- account: "telos.decide"
- action: "removeseat"
- data:
  - committee_name: "mycommittee"
  - treasury_symbol: "4,VOTE"
  - seat_name: "seat4"

### assignseat — Assign an account to a seat
- account: "telos.decide"
- action: "assignseat"
- data:
  - committee_name: "mycommittee"
  - treasury_symbol: "4,VOTE"
  - seat_name: "seat1"
  - seat_holder: "memberacct"
  - memo: "elected in ballot X"

### setupdater — Transfer committee control
- account: "telos.decide"
- action: "setupdater"
- data:
  - committee_name: "mycommittee"
  - treasury_symbol: "4,VOTE"
  - updater_account: "newmanager"
  - updater_auth: "active"

### delcommittee — Delete a committee
- account: "telos.decide"
- action: "delcommittee"
- data:
  - committee_name: "mycommittee"
  - treasury_symbol: "4,VOTE"
  - memo: "no longer needed"

## Worker / Payroll Actions

Workers earn rewards by maintaining ballot vote integrity (rebalancing votes when balances change, cleaning up expired votes).

### rebalance — Rebalance a vote after voter balance changed
- account: "telos.decide"
- action: "rebalance"
- data:
  - voter: (voter whose vote to rebalance)
  - ballot_name: (ballot name)
  - worker: null (optional worker account to log work for payroll)

### cleanupvote — Clean up an expired vote after ballot closes
- account: "telos.decide"
- action: "cleanupvote"
- data:
  - voter: (voter whose vote to clean)
  - ballot_name: (ballot name)
  - worker: null (optional worker account)
- NOTE: Required before a ballot can be deleted. Recovers RAM.

### addfunds — Add TLOS to a treasury payroll
- account: "telos.decide"
- action: "addfunds"
- data:
  - from: (account paying)
  - treasury_symbol: "4,VOTE"
  - quantity: "100.0000 TLOS"

### editpayrate — Change payroll rate
- account: "telos.decide"
- action: "editpayrate"
- data:
  - treasury_symbol: "4,VOTE"
  - period_length: 604800 (seconds, e.g. 1 week)
  - per_period: "100.0000 TLOS"
- NOTE: Authorized by treasury manager.

### claimpayment — Claim worker payment
- account: "telos.decide"
- action: "claimpayment"
- data:
  - worker_name: (worker account)
  - treasury_symbol: "4,VOTE"
- NOTE: 1-day maturity then 1%/day decay. Share based on rebalance and cleanup work performed.

### forfeitwork — Forfeit unclaimed work
- account: "telos.decide"
- action: "forfeitwork"
- data:
  - worker_name: (worker account)
  - treasury_symbol: "4,VOTE"

## Querying Tables

All tables use code="telos.decide".

### Core Tables
- table="treasuries", scope="telos.decide" → list all treasuries (supply, max_supply, manager, access, settings, voter count)
- table="ballots", scope="telos.decide" → list all ballots (name, category, status, options with vote tallies, times, publisher)
  - Secondary indexes:
    - index_position="2", key_type="i64" → by category (e.g. lower_bound="proposal", upper_bound="proposal" for proposals only)
    - index_position="3", key_type="i64" → by status (e.g. lower_bound="voting", upper_bound="voting" for active ballots)
    - index_position="4", key_type="i64" → by treasury symbol code
    - index_position="5", key_type="i64" → by end_time (use reverse=true, limit=5 to get most recent ballots)
- table="voters", scope=<voter_account> → voter balances per treasury (liquid, staked, delegated)
- table="votes", scope=<ballot_name> → individual votes on a ballot (voter, raw_votes, weighted_votes, vote_time)
  - Secondary index: index_position="2", key_type="i64" → by vote_time

### Additional Tables
- table="config", scope="telos.decide" → singleton with app version, total deposits, fees, times
- table="committees", scope=<treasury_symbol_code> → committees for a treasury (seats, updater)
- table="delegates", scope=<treasury_symbol_code> → delegates for a treasury
- table="accounts", scope=<account_name> → TLOS deposit balance for an account
- table="payrolls", scope=<treasury_symbol_code> → payroll config (funds, rate, claimable)
- table="labors", scope=<treasury_symbol_code> → per-worker labor records
- table="laborbuckets", scope=<treasury_symbol_code> → aggregate labor stats
- table="archivals", scope="telos.decide" → archived ballot records

## VOTE Treasury Special Behavior
The VOTE treasury is linked to TLOS staking. When users delegatebw/undelegatebw on eosio, the contract auto-syncs their VOTE balance via notification handlers. Use the "refresh" action for manual sync.

## Integration Pattern
External contracts can create ballots and listen for results via the broadcast inline action. Use [[eosio::on_notify("telos.decide::broadcast")]] to trigger on-chain logic based on vote outcomes.

## Common Queries (exact tool parameters)

IMPORTANT: The RPC does NOT support combining two secondary indexes or client-side filtering. If the data you need cannot be fetched directly using a single primary key or secondary index query, do NOT attempt to filter results yourself. Instead, tell the user: "I'm still learning how to fetch this specific data. For now, I can show you the latest ballots across all categories." Then fall back to a supported query.

### Get latest/most recent ballots (any category)
Use get_table_rows with: code="telos.decide", table="ballots", scope="telos.decide", index_position="5", key_type="i64", reverse=true, limit=5

### Get latest proposals only
This query is NOT directly supported — there is no single index that filters by category AND sorts by end_time. Tell the user: "I'm still learning how to fetch only the latest proposals. Here are the latest ballots across all categories instead." Then use the "Get latest/most recent ballots" query above.

### Get latest polls/elections/etc.
Same limitation — tell the user you are still learning, and fall back to showing latest ballots across all categories.

### Get currently active ballots (status=voting)
Use get_table_rows with: code="telos.decide", table="ballots", scope="telos.decide", index_position="3", key_type="i64", lower_bound="voting", upper_bound="voting", limit=10

### Get all ballots (default order)
Use get_table_rows with: code="telos.decide", table="ballots", scope="telos.decide", limit=10

### Get voter registration for an account
Use get_table_rows with: code="telos.decide", table="voters", scope=<account_name>

### Get votes on a specific ballot
Use get_table_rows with: code="telos.decide", table="votes", scope=<ballot_name>

### Get deposit balance for an account
Use get_table_rows with: code="telos.decide", table="accounts", scope=<account_name>

## Common Workflows

### Vote on an existing ballot
1. Query ballots table to find active ballots (status="voting")
2. regvoter (if not already registered for the ballot's treasury)
3. castvote with chosen options

### Create and run a ballot
1. Deposit TLOS to telos.decide (transfer to cover fees)
2. newballot → creates ballot in "setup" status
3. editdetails → set title/description
4. (optional) togglebal, editminmax, addoption/rmvoption
5. openvoting → ballot goes to "voting" status
6. Wait for voting period
7. closevoting → finalizes results, optionally broadcasts
8. (optional) archive for long-term storage
9. cleanupvote for each voter → then deleteballot to recover RAM`,
}
