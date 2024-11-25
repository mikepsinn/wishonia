import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getGlobalProblem } from "@/lib/api/globalProblems"
import { getCurrentUser } from "@/lib/session"
import { GlobalProblemSolutionsList } from "@/components/global-problem-solutions-list"
import { Shell } from "@/components/layout/shell"
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer"
import { PollRandomGlobalProblemSolutions } from "@/components/poll-random-global-problem-solutions"

interface GlobalProblemPageProps {
  params: { globalProblemId: string }
}

export async function generateMetadata({
  params,
}: GlobalProblemPageProps): Promise<Metadata> {
  const globalProblem = await getGlobalProblem(params.globalProblemId)

  return {
    title: globalProblem?.name || "Not Found",
    description: globalProblem?.description,
  }
}

export default async function GlobalProblemPage({
  params,
}: GlobalProblemPageProps) {
  const globalProblem = await getGlobalProblem(params.globalProblemId)

  if (!globalProblem) {
    notFound()
  }
  const user = await getCurrentUser()

  return (
    <Shell>
      <PollRandomGlobalProblemSolutions
        globalProblemId={globalProblem.id}
        user={user}
      ></PollRandomGlobalProblemSolutions>
      <MarkdownRenderer
        name={globalProblem.name}
        featuredImage={globalProblem.featuredImage}
        description={globalProblem.description}
        content={globalProblem.content}
      />
      <GlobalProblemSolutionsList
        user={user}
        globalProblemId={globalProblem.id}
      ></GlobalProblemSolutionsList>
    </Shell>
  )
}
