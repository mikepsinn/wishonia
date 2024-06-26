import * as cheerio from "cheerio"
import TurndownService from "turndown"

let turndownService = new TurndownService()

export const websiteParser = (html: string) => {
  const $ = cheerio.load(html)
  const mainContent = $('[role="main"]').html() || $("main").html() || $.html()
  return turndownService.turndown(mainContent)
}
