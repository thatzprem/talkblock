"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRightLeft } from "lucide-react"

interface TransactionDetailProps {
  data: {
    id: string
    block_num: number
    block_time: string
    actions: Array<{
      account: string
      name: string
      data: Record<string, unknown>
    }>
    status: string
  }
}

export function TransactionDetail({ data }: TransactionDetailProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ArrowRightLeft className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Transaction</h2>
        <Badge variant={data.status === "executed" ? "default" : "secondary"} className="ml-auto">
          {data.status}
        </Badge>
      </div>

      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Transaction ID</span>
        <p className="text-xs font-mono break-all bg-muted p-2 rounded">{data.id}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground text-xs">Block</span>
          <p className="font-medium">{data.block_num?.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Time</span>
          <p className="font-medium">{data.block_time}</p>
        </div>
      </div>

      {data.actions && data.actions.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Actions ({data.actions.length})</h3>
            {data.actions.map((action, i) => (
              <div key={i} className="bg-muted rounded-md p-3 text-xs space-y-2">
                <div className="flex items-center gap-1 font-medium">
                  <Badge variant="outline" className="text-[10px]">{action.account}</Badge>
                  <span className="text-muted-foreground">::</span>
                  <span>{action.name}</span>
                </div>
                <pre className="text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(action.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
