"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle, Trash } from "@phosphor-icons/react"
import { Agent } from "@prisma/client"
import axios from "axios"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"

import { useSidebar } from "@/lib/hooks/use-sidebar"
import { agentSchema } from "@/lib/validations/agent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

import { Icons } from "../icons"

type FormData = z.infer<typeof agentSchema>

interface AgentFormProps extends React.HTMLAttributes<HTMLFormElement> {
  agentData?: Pick<
    Agent,
    | "id"
    | "name"
    | "description"
    | "prompt"
    | "initialMessage"
    | "conversationStarters"
    | "avatar"
  >
}

export default function AgentForm({
  agentData,
  className,
  ...props
}: AgentFormProps) {
  const router = useRouter()
  const { isSidebarOpen } = useSidebar()
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(agentData?.avatar || null)

  const { handleSubmit, register, control, watch, setValue } =
    useForm<FormData>({
      resolver: zodResolver(agentSchema),
      defaultValues: {
        name: agentData?.name || "",
        description: agentData?.description || "",
        prompt: agentData?.prompt || "",
        initialMessage: agentData?.initialMessage || "",
        conversationStarters: agentData?.conversationStarters || [""],
      },
    })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "metadata.conversationStarters",
  })

  const navigateBack = () => window.history.back()

  async function onSubmit(data: FormData) {
    setLoading(true)
    const url = agentData ? `/api/agents/${agentData.id}` : "/api/agents"
    const method = agentData ? "PATCH" : "POST"

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        prompt: data.prompt,
        initialMessage: data.initialMessage,
        avatar: data.avatar,
        conversationStarters: data.conversationStarters,
      }),
    })

    setLoading(false)

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        description: `Agent was not ${agentData ? "updated" : "created"}. Please try again.`,
        variant: "destructive",
      })
    }

    toast({
      description: `Your Agent has been ${agentData ? "updated" : "created"}.`,
    })

    router.back()
    router.refresh()
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = function (e) {
        const result = e.target?.result
        if (typeof result === "string") {
          setAvatar(result)
        }
      }
      reader.readAsDataURL(file)

      setLoading(true)
      const response = await axios.post(
        "/api/upload-avatar?image=" + file.name,
        file,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      const newImageUrl = response.data.imageUrl
      setValue("avatar", newImageUrl)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fields.length === 0) {
      append("")
    }
  }, [fields, append])

  const name = watch("name")

  return (
    <div
      className={`mx-auto flex h-screen ${isSidebarOpen ? "lg:ml-[270px] lg:w-[calc(100%-270px)]" : "w-full lg:w-[96%]"}`}
    >
      <div className="flex w-full flex-col space-y-6 overflow-y-auto p-8 md:w-1/2">
        <div className="flex items-center space-x-4">
          <ArrowLeftIcon
            onClick={navigateBack}
            className="h-6 w-6 cursor-pointer"
          />
          <h1 className="text-xl font-semibold ">
            {name || (agentData ? "Edit Agent" : "New Agent")}
          </h1>
          {!agentData && (
            <span className="ml-auto rounded-full bg-yellow-600 px-3 py-1 text-sm font-medium text-yellow-500">
              Draft
            </span>
          )}
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-gray-400 p-1">
                <Input
                  type="file"
                  onChange={handleUpload}
                  className="absolute z-10 h-full w-full opacity-0"
                  accept="image/png, image/gif, image/jpeg"
                />
                {avatar && (
                  <img
                    className="h-full w-full"
                    src={avatar}
                    alt="Agent avatar"
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input placeholder="Name your Agent" {...register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Add a short description about what this Agent does"
                className="min-h-[100px]"
                {...register("description")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-sm font-medium">
                Instructions
              </Label>
              <Textarea
                id="instructions"
                placeholder="What does this Agent do? How does it behave? What should it avoid doing?"
                className="min-h-[100px]"
                {...register("prompt")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initial-message" className="text-sm font-medium">
                Initial Message
              </Label>
              <Textarea
                id="initial-message"
                placeholder="Enter Initial Message"
                className="min-h-[100px]"
                {...register("initialMessage")}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="conversation-starters"
                className="flex items-center text-sm font-medium"
              >
                Conversation Starters{" "}
                <PlusCircle
                  onClick={() => append("")}
                  className="ml-2 h-7 w-7 cursor-pointer rounded-full p-1 hover:shadow-md"
                />
              </Label>
              {fields.map((item: any, index: number) => (
                <div key={item.id} className="flex">
                  <Input
                    {...register(`conversationStarters.${index}`, {
                      required: true,
                    })}
                    placeholder="Enter conversation starters"
                  />
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    className="ml-2 p-3"
                    disabled={fields.length === 1}
                  >
                    <Trash />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              disabled={loading}
              className="bg-black text-white dark:bg-white dark:text-black"
            >
              {loading ? (
                <Icons.spinner className="animate-spin text-sm" />
              ) : agentData ? (
                "Update Agent"
              ) : (
                "Create Agent"
              )}
            </Button>
          </div>
        </form>
      </div>
      <div className="hidden w-1/2 bg-secondary p-8 md:block">
        <div className="flex h-full flex-col justify-between">
          <div className="flex h-full items-center justify-center">
            <CuboidIcon className="h-12 w-12 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Start by defining your Agent.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}

function CuboidIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m21.12 6.4-6.05-4.06a2 2 0 0 0-2.17-.05L2.95 8.41a2 2 0 0 0-.95 1.7v5.82a2 2 0 0 0 .88 1.66l6.05 4.07a2 2 0 0 0 2.17.05l9.95-6.12a2 2 0 0 0 .95-1.7V8.06a2 2 0 0 0-.88-1.66Z" />
      <path d="M10 22v-8L2.25 9.15" />
      <path d="m10 14 11.77-6.87" />
    </svg>
  )
}
