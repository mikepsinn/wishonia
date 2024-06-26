import { OpenAIEmbeddings } from "@langchain/openai"
import { Datasource } from "@prisma/client"

import { getMetaFromMarkdownFile } from "@/lib/markdownGenerator"
import { readAllMarkdownFiles } from "@/lib/markdownReader"
import { WishoniaVectorStore } from "@/lib/utils/vectorStore"

export async function generateMarkdownEmbeddings(
  docsRootPath: string,
  dataSource: Datasource,
  shouldRefresh?: boolean
) {
  const markdownFiles = await readAllMarkdownFiles(docsRootPath)
  console.log(`Discovered ${markdownFiles.length} markdownFiles`)
  const results = []
  for (const markdownFile of markdownFiles) {
    const meta = getMetaFromMarkdownFile(markdownFile)
    meta.datasourceId = dataSource.id
    const result = await WishoniaVectorStore.fromTexts(
      [markdownFile.content],
      meta,
      new OpenAIEmbeddings(),
      {
        datasourceId: dataSource.id,
      }
    )
    results.push(result)
  }
  console.log("Embedding generation complete")
  return results
}
