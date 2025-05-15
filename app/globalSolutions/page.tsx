import { Metadata } from "next"

import { getCurrentUser } from "@/lib/session"
import { Shell } from "@/components/layout/shell"
import { PollRandomGlobalSolutions } from "@/components/poll-random-global-solutions"
import { GlobalSolutionsTable } from "@/components/global-solutions-table"

export const metadata: Metadata = {
  title: "Global Problems",
  description: "Indicate how much you want to allocate to solving each problem",
}

interface DashboardProps {
  searchParams: {
    thisGlobalSolutionName: string
    thatGlobalSolutionName: string
  }
}

export default async function GlobalSolutionsPage({
  searchParams,
}: DashboardProps) {
  const user = await getCurrentUser()

  return (
    <Shell>
      <PollRandomGlobalSolutions user={user}></PollRandomGlobalSolutions>
      <GlobalSolutionsTable user={user}></GlobalSolutionsTable>
    </Shell>
  )
}
