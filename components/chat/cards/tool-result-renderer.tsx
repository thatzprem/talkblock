"use client"

import { AccountCard } from "./account-card"
import { BlockCard } from "./block-card"
import { TransactionCard } from "./transaction-card"
import { TableCard } from "./table-card"
import { TxProposalCard } from "./tx-proposal-card"

interface ToolResultRendererProps {
  toolName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: Record<string, any>
}

export function ToolResultRenderer({ toolName, result }: ToolResultRendererProps) {
  if (result?.error) {
    return (
      <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 my-1">
        Error: {String(result.error)}
      </div>
    )
  }

  switch (toolName) {
    case "get_account":
      return <AccountCard data={result as any} />
    case "get_block":
      return <BlockCard data={result as any} />
    case "get_transaction":
      return <TransactionCard data={result as any} />
    case "get_table_rows":
      return <TableCard data={result as any} />
    case "get_currency_balance":
      return (
        <div className="text-sm bg-muted rounded-md px-3 py-2 my-1">
          <span className="text-muted-foreground">Balances for </span>
          <span className="font-medium">{String(result.account)}</span>
          <span className="text-muted-foreground">: </span>
          <span className="font-medium">{(result.balances || []).join(", ") || "None"}</span>
        </div>
      )
    case "get_producers":
      return <TableCard data={{ rows: result.producers || [] }} />
    case "get_abi":
      return (
        <div className="text-sm bg-muted rounded-md px-3 py-2 my-1 space-y-1">
          <div><span className="text-muted-foreground">Contract: </span><span className="font-medium">{String(result.account_name)}</span></div>
          <div><span className="text-muted-foreground">Actions: </span>{(result.actions || []).join(", ")}</div>
          <div><span className="text-muted-foreground">Tables: </span>{(result.tables || []).join(", ")}</div>
        </div>
      )
    case "build_transaction":
      return <TxProposalCard data={result as any} />
    default:
      return <pre className="text-xs bg-muted p-2 rounded overflow-auto my-1">{JSON.stringify(result, null, 2)}</pre>
  }
}
