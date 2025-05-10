"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Blocks,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  UserCog,
  Vote,
  PieChart,
  Lightbulb,
  Star,
  Users,
  Pencil,
  Bot,
  FileText,
  Library,
  Github,
  AlertTriangle,
  GitPullRequest,
  Building2,
  Search,
  Scale,
  User,
} from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import { generalSidebarNav, avatarNav } from "@/config/navigation/general-nav";
import { NavItem } from "@/types";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

const iconMap: { [key: string]: React.ElementType } = {
  dashboard: LayoutDashboard,
  vote: Vote,
  pieChart: PieChart,
  lightbulb: Lightbulb,
  star: Star,
  ranking: Users,
  pencil: Pencil,
  pencilSquare: Pencil,
  robot: Bot,
  document: FileText,
  docs: Library,
  contributeOnGithub: Github,
  reportBug: AlertTriangle,
  requestFeature: GitPullRequest,
  building: Building2,
  search: Search,
  scale: Scale,
  agents: Bot,
  researcher: Pencil,
  user: User,
  settings: Settings,
  default: Blocks,
};

const getIcon = (iconName?: string) => {
  if (!iconName) return React.createElement(iconMap.default, { className: "h-4 w-4" });
  const IconComponent = iconMap[iconName.toLowerCase()] || iconMap.default;
  return React.createElement(IconComponent, { className: "h-4 w-4" });
};

// Helper function to get initials from a name
const getInitials = (name?: string | null) => {
  if (!name) return "";
  const words = name.split(" ");
  if (words.length > 1) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

export function SessionNavBar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    const newWidth = isCollapsed ? "3.05rem" : "15rem";
    document.documentElement.style.setProperty('--sidebar-width', newWidth);
  }, [isCollapsed]);

  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-40 h-full shrink-0 border-r",
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-white dark:bg-black transition-all`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0  border-b p-2">
              <div className=" mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2  px-2" 
                    >
                      <Avatar className='rounded size-4'>
                        <Image src="https://source.unsplash.com/random/16x16?logo&sig=orgLogo" alt="Organization Logo" width={16} height={16} className="rounded" />
                        <AvatarFallback>O</AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex w-fit items-center gap-2"
                      >
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium  ">
                              {"Organization"}
                            </p>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2"
                    >
                      <Link href="/settings/members">
                        <UserCog className="h-4 w-4" /> Manage members
                      </Link>
                    </DropdownMenuItem>{" "}
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2"
                    >
                      <Link href="/dashboard/settings">
                        <Blocks className="h-4 w-4" /> Integrations
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/select-org"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create or join an organization
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className=" flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    {(generalSidebarNav.data as NavItem[]).map((item, index) => {
                      if (item.href === "----" || item.title === "----") {
                         return <Separator key={`sep-${index}`} className="my-1" />;
                      }
                      return (
                        <Link
                          key={item.href || index}
                          href={item.href || "#"}
                          title={item.tooltip || item.title}
                          className={cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                            (pathname === item.href || pathname?.startsWith(`${item.href}/`)) && item.href !== "/" &&
                              "bg-muted text-blue-600",
                            pathname === "/" && item.href === "/" && "bg-muted text-blue-600"
                          )}
                        >
                          {getIcon(item.icon)}
                          <motion.li variants={variants}>
                            {!isCollapsed && (
                              <p className="ml-2 text-sm font-medium">{item.title}</p>
                            )}
                          </motion.li>
                        </Link>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
              <div className="flex flex-col p-2">
                <Link
                  href="/settings/integrations"
                  className="mt-auto flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5   transition hover:bg-muted hover:text-primary"
                >
                  {getIcon("settings")}
                  <motion.li variants={variants}>
                    {!isCollapsed && (
                      <p className="ml-2 text-sm font-medium"> Settings</p>
                    )}
                  </motion.li>
                </Link>
                <div>
                  {status === "authenticated" ? (
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger className="w-full">
                        <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary">
                          <Avatar className="size-4">
                            {session?.user?.image ? (
                              <Image src={session.user.image} alt={session.user.name || "User avatar"} width={16} height={16} className="rounded-full" />
                            ) : (
                              <AvatarFallback className="text-xs">
                                {getInitials(session?.user?.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <motion.li
                            variants={variants}
                            className="flex w-full items-center gap-2"
                          >
                            {!isCollapsed && (
                              <>
                                <p className="text-sm font-medium">
                                  {session?.user?.name ? session.user.name.split(" ")[0] : "Account"}
                                </p>
                                <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
                              </>
                            )}
                          </motion.li>
                        </div>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5} className="min-w-[200px]">
                      {session?.user && (
                        <>
                          <div className="flex flex-row items-center gap-2 p-2">
                            <Avatar className="size-6">
                              {session.user.image ? (
                                <Image src={session.user.image} alt={session.user.name || "User avatar"} width={24} height={24} className="rounded-full" />
                              ) : (
                                <AvatarFallback className="text-sm">
                                  {getInitials(session.user.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex flex-col text-left">
                              <span className="text-sm font-medium">
                                {session.user.name || "User"}
                              </span>
                              <span className="line-clamp-1 text-xs text-muted-foreground">
                                {session.user.email || ""}
                              </span>
                            </div>
                          </div>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {(avatarNav.data as NavItem[]).map((item, index) => (
                        <DropdownMenuItem
                          key={item.href || index}
                          asChild
                          className="flex items-center gap-2"
                        >
                          <Link href={item.href || "#"} title={item.tooltip || item.title}>
                            {getIcon(item.icon)} {item.title}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onSelect={(event) => {
                          event.preventDefault();
                          let callbackUrl = "/signin";
                          if (typeof window !== "undefined") {
                            callbackUrl = `${window.location.origin}/signin`;
                          } else {
                            console.error(
                              "window is not defined in SessionNavBar for signOut"
                            );
                          }
                          signOut({
                            callbackUrl: callbackUrl,
                          });
                        }}
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link href="/signin" className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary">
                      <Avatar className="size-4">
                        <AvatarFallback className="text-xs">
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      {!isCollapsed && (
                        <p className="text-sm font-medium">Sign in</p>
                      )}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
} 