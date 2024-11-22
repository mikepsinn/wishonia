"use client"

import React from "react"
import Link from "next/link"
import { NavItem } from "@/types"
import { User } from "next-auth"
import { signOut } from "next-auth/react"

import { avatarNav } from "@/config/navigation/general-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import { UserAvatar } from "@/components/user/user-avatar"

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Pick<User, "name" | "image" | "email">
  avatarNavItems?: NavItem[]
}

export function UserAccountNav({ user, avatarNavItems }: UserAccountNavProps) {
  if (!avatarNavItems) {
    avatarNavItems = avatarNav.data
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{
            name: user.name || null,
            image: user.image || null,
          }}
          className="h-8 w-8"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        {avatarNavItems.map((item, index) => {
          const Icon = Icons[item.icon || "next"]
          return (
            item.href && (
              <DropdownMenuItem key={index} className="cursor-pointer" asChild>
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </DropdownMenuItem>
            )
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault()
            let callbackUrl = "/signin"
            if (typeof window !== "undefined") {
              callbackUrl = `${window.location.origin}/signin`
            } else {
              console.error("window is not defined in UserAccountNav")
            }
            signOut({
              callbackUrl: callbackUrl,
            })
          }}
        >
          <Icons.signout className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
