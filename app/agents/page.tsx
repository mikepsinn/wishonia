import React from "react"
import { Shell } from "@/components/layout/shell"
import AgentListPublished from "@/components/agents/agent-list-published"
import { requireAuth } from "@/lib/auth"

export default async function AgentListPage() {
  await requireAuth({ returnTo: true })
  
  return (
    <Shell className="size-full">
      <AgentListPublished></AgentListPublished>
    </Shell>
  )
}
