"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Box, Clock, User } from "lucide-react"

interface BlockDetailProps {
  data: {
    block_num: number
    id: string
    timestamp: string
    producer: string
    confirmed: number
    transaction_count: number
    transactions?: Array<{
      id: string
      status: string
      cpu_usage_us: number
      net_usage_words: number
    }>
  }
}

export function BlockDetail({ data }: BlockDetailProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Box className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Block #{data.block_num.toLocaleString()}</h2>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{data.timestamp}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Producer: {data.producer}</span>
        </div>
        <div>
          <Badge variant="secondary">{data.transaction_count} transactions</Badge>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Block ID</span>
        <p className="text-xs font-mono break-all bg-muted p-2 rounded">{data.id}</p>
      </div>

      {data.transactions && data.transactions.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Transactions</h3>
            {data.transactions.map((tx, i) => (
              <div key={i} className="bg-muted rounded-md p-2 text-xs space-y-1">
                <div className="font-mono truncate">{tx.id}</div>
                <div className="flex gap-3 text-muted-foreground">
                  <span>Status: {tx.status}</span>
                  <span>CPU: {tx.cpu_usage_us}\u00b5s</span>
                  <span>NET: {tx.net_usage_words}w</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
