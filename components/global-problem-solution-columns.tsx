"use client"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import {GlobalProblemSolution} from "@prisma/client";
import Image from "next/image";

export const globalProblemSolutionColumns: ColumnDef<GlobalProblemSolution>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Solution
          <Icons.sort className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: (row) => {
      let name = row.row.original.name
      const matches = name.match(/How (.*) Solves/)
      if (matches) {
          name = matches[1]
      }
      const id = row.row.original.id
      const featuredImage = row.row.original.featuredImage || ""
      const description = row.row.original.description
      const globalProblemId = row.row.original.globalProblemId
      const globalSolutionId = row.row.original.globalSolutionId
      return (
        <Link
          href={`/globalProblems/${globalProblemId}/solutions/${globalSolutionId}`}
          className={cn(buttonVariants({ variant: "ghost" }))}
          title={description || ""}
        >
          <Image
            src={featuredImage}
            className={"object-cover rounded-full p-2"}
            alt="Global Problem"
            width={50}
            height={50}
          />
          {name}
        </Link>
      )
    },
  },
  {
    accessorKey: "averageAllocation",
    header: ({ column }) => {
      return (
          <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Average Allocation
            <Icons.sort className="ml-2 h-4 w-4" />
          </Button>
      )
    },
    cell: (row) => {
      let averageAllocation = row.getValue() as number
      averageAllocation = parseFloat(averageAllocation.toFixed(1));
      return <div className="min-w-[5rem] md:px-4 text-center">
        {averageAllocation}%
      </div>
    },
  },
]
