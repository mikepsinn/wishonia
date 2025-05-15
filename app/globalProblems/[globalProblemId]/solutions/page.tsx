import { Metadata } from "next"

import { getCurrentUser } from "@/lib/session"
import { Shell } from "@/components/layout/shell"
import { GlobalProblemSolutionsTable } from "@/components/global-problem-solutions-table"

interface GlobalProblemsProps {}
let heading = `Solutions for the problem`
let metaDescription = `Vote on the best solutions to the problem and see the average results below!`
export async function generateMetadata({}: GlobalProblemsProps): Promise<Metadata> {
  return {
    title: heading,
    description: metaDescription,
  }
}

interface GlobalProblemSolutionPageProps {
  params: { globalProblemId: string }
}
export default async function GlobalProblemSolutionsPage({
  params,
}: GlobalProblemSolutionPageProps) {
  const user = await getCurrentUser()
  const globalProblemId = params.globalProblemId
  return (
    <Shell>
      <GlobalProblemSolutionsTable
        user={user}
        globalProblemId={globalProblemId}
      ></GlobalProblemSolutionsTable>
    </Shell>
  )
}
