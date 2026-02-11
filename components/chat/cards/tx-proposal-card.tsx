"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileSignature, Send } from "lucide-react"

interface TxProposalCardProps {
  data: {
    type: string
    description: string
    actions: Array<{
      account: string
      name: string
      data: Record<string, unknown>
    }>
    status: string
  }
}

export function TxProposalCard({ data }: TxProposalCardProps) {
  return (
    <Card className="my-2 max-w-md border-primary/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileSignature className="h-4 w-4" />
          Transaction Proposal
          <Badge variant="outline" className="ml-auto text-xs">
            {data.status === "pending_signature" ? "Pending" : data.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-3">
        <p className="text-sm">{data.description}</p>
        <div className="space-y-2">
          {data.actions.map((action, i) => (
            <div key={i} className="bg-muted rounded-md p-2 text-xs space-y-1">
              <div className="flex items-center gap-1 font-medium">
                <Badge variant="outline" className="text-[10px]">{action.account}</Badge>
                <span className="text-muted-foreground">::</span>
                <span>{action.name}</span>
              </div>
              <pre className="text-muted-foreground overflow-x-auto">
                {JSON.stringify(action.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
        <Button className="w-full" size="sm" id="sign-broadcast-btn">
          <Send className="h-4 w-4 mr-2" />
          Sign & Broadcast
        </Button>
      </CardContent>
    </Card>
  )
}
