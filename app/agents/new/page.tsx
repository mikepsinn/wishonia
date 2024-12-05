import React from "react"
import AgentForm from "@/components/agents/agent-form"
import { Shell } from "@/components/layout/shell"
import { requireAuth } from "@/lib/auth"

export default async function NewAgentPage() {
  await requireAuth({ returnTo: true })
  
  return (
    <Shell className="block size-full md:grid">
      <AgentForm></AgentForm>
    </Shell>
  )
}
