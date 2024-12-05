import React from "react"
import AgentListMine from "@/components/agents/agent-list-mine"
import { Shell } from "@/components/layout/shell"
import { requireAuth } from "@/lib/auth"

export default async function AgentListPage() {
  await requireAuth({ returnTo: true })
  
  return (
    <Shell className="size-full">
      <AgentListMine></AgentListMine>
    </Shell>
  )
}
