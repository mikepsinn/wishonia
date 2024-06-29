"use client"

import Image from "next/image"
import Link from "next/link"
import { GlobalSolution } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export const globalSolutionColumns: ColumnDef<GlobalSolution>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Problem
          <Icons.sort className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: (row) => {
      const name = row.row.original.name
      const id = row.row.original.id
      const featuredImage = row.row.original.featuredImage || ""
      const description = row.row.original.description
      return (
        <Link
          href={`/globalSolutions/${id}`}
          className={cn(buttonVariants({ variant: "ghost" }))}
          title={description || ""}
        >
          <Image
            src={featuredImage}
            className={"rounded-full object-cover p-2"}
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
      if (!averageAllocation) {
        return (
          <Button
            variant="ghost"
            onClick={() => (window.location.href = `/globalSolutions`)}
          >
            Vote to See Results
            <Icons.lightbulb className="ml-2 h-4 w-4" />
          </Button>
        )
      }
      averageAllocation = parseFloat(averageAllocation.toFixed(1))
      return (
        <div className="min-w-[5rem] text-center md:px-4">
          {averageAllocation}%
        </div>
      )
    },
  },
]
