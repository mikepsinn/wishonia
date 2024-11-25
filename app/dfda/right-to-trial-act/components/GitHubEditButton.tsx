"use client"

import { Button } from "@/components/ui/button"

export function GitHubEditButton() {
  return (
    <a
      href="https://github.com/wishonia/wishonia/edit/main/public/globalSolutions/dfda/right-to-trial-act.md"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Button variant="neobrutalist" className="">
        ✏️ Improve the Bill!
      </Button>
    </a>
  )
}