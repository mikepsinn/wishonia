'use client';

import { JSX, SVGProps, useEffect, useState } from "react";
import Link from 'next/link';
import { DotsThree, Trash } from '@phosphor-icons/react';
import { Agent } from '@prisma/client';
import { useSidebar } from "@/lib/hooks/use-sidebar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from "@/components/ui/use-toast";
import { SpinningLoader } from "@/components/spinningLoader";
import { Button } from '../ui/button';


export default function AgentList() {
    const [agents,setAgents]=useState<Agent[]>([]);
    const [loading, setLoading] = useState(false);
    const {isSidebarOpen}=useSidebar()
    
    const fetchAgents=async()=>{
        setLoading(true);
        const response = await fetch('/api/agents');
        const data = await response.json();
        setAgents(data);
        setLoading(false);
    }

    const deleteAgent = async (agentId: string) => {
      try {
        const response = await fetch(`/api/agents/${agentId}`, {
          method: "DELETE",
        })
        if (!response?.ok) {
          return toast({
            title: "Something went wrong.",
            description: "Agent was not deleted . Please try again.",
            variant: "destructive",
          })
        }
        toast({
          description: "Your Agent has been deleted.",
        })
        fetchAgents()
      } catch {}
    }
    useEffect(() => {
      if (!loading) {
        fetchAgents()
      }
    }, [])

    return (
        <div className={`pt-8 p-2 md:p-8 mx-auto h-screen overflow-auto scroll-m-1 xl:max-w-[1000px]  ${isSidebarOpen?'lg:ml-[270px] lg:w-[calc(100%-270px)]':'w-full lg:w-[96%]'}`}>
            <h1 className="text-3xl font-semibold mb-6">My Agents</h1>
            <Link  href='/agents/new'>
            <div className="flex items-center space-x-4 p-4 rounded-sm hover:bg-secondary w-full">
                <div>
                <PlusIcon className="dark:bg-white dark:text-black bg-black text-white p-2 rounded-full h-8 w-8"/>
                </div>
                <div>
                    <div className="font-semibold">Create a Agent</div>
                    <div className="text-[#BBBBBB]">Customize a version of Agent for a specific purpose</div>
                </div>
            </div>
            </Link>
            <div className="border-t border-[#333333] ">
              {loading && <SpinningLoader/>}
              {agents.map((agent)=>{
                return(
                    <div className="flex justify-between p-4  rounded-sm hover:bg-secondary">
                        <Link href={`/agents/${agent.id}/chat`} className="flex flex-col md:flex-row justify-between md:items-center w-full">
                            <div className="flex items-center p-0 w-full">
                                <div className="h-full flex items-center mr-2">
                                    <HexagonIcon className="dark:bg-white dark:text-black bg-black text-white p-2 rounded-full h-8 w-8" />
                                </div>
                                <div className='overflow-hidden w-full  md:mx-4 text-ellipsis'>
                                    <div className="font-semibold  overflow-hidden text-ellipsis ">{agent.name}</div>
                                    <div>
                                        <p className="text-[#848080] line-clamp-1 overflow-hidden text-ellipsis text-sm">{agent.description}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:flex md:ml-auto mt-2 md:mr-2  flex-wrap justify-start">
                                <Badge variant="secondary" className="m-1 w-max line-clamp-1 text-xs">Only me</Badge>
                            </div>
                        </Link>
                        <div className="flex items-center space-x-4 ml-1">
                            <Link href={`/agents/edit/${agent.id}`}><PencilIcon className="h-5 w-5" /></Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger >
                                    <Button
                                        variant='outline'
                                        className='flex items-center gap-1 font-normal px-2'
                                    >
                                        <DotsThree className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='w-56'>
                                    <DropdownMenuLabel>Action</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup
                                    >
                                        <DropdownMenuRadioItem
                                            value='delete'
                                            className='text-sm text-red-600 font-bold text-left px-2'
                                            onSelect={() => deleteAgent(agent.id)}
                                        >
                                            <Trash className='mr-2' /> Delete
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                  )
                })}
            </div>
        </div>
    )
}

function DotIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12.1" cy="12.1" r="1" />
        </svg>
    )
}


function HexagonIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
    )
}


function PencilIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
        </svg>
    )
}


function PlusIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}