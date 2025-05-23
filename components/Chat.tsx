"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Agent } from "@prisma/client"
import { Message as VercelMessage } from "ai" // Renamed to avoid conflict
import { useAIState, useUIState } from "ai/rsc"
import { nanoid } from "nanoid"
import { useSession } from "next-auth/react"

import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { useSidebar } from "@/lib/hooks/use-sidebar"
import { sleep } from "@/lib/utils"

import { ChatMessage } from "./ChatMessage"
import { UserMessage, BotMessage } from "./assistant/Message" // Assuming these are the correct components
import ChatPanel from "./ChatPanel"
import { PromptForm } from "./PromptForm"
import { ScrollArea } from "./ui/scroll-area"
import { useToast } from "./ui/use-toast"

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: VercelMessage[]
  id: string // This should be the chat session ID
  missingKeys: string[]
  agentData?: Agent | null
}

function Chat({ id, initialMessages, missingKeys, agentData }: ChatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const session = useSession()

  const [input, setInput] = useState("")
  const [messages, setMessages] = useUIState()
  const [aiState, setAIState] = useAIState()

  const router = useRouter()
  const pathname = usePathname()
  if (!pathname) {
    throw new Error("Pathname is not available")
  }

  const { toast } = useToast()

  const [_, setNewChatId] = useLocalStorage("newChatId", id)
  const { isSidebarOpen, isLoading, toggleSidebar } = useSidebar()

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Effect to load agent-specific history and initial messages
  useEffect(() => {
    async function loadAgentChat() {
      if (agentData && agentData.id) {
        // Set AI state for the agent
        setAIState(currentState => ({
          ...currentState,
          chatId: id,
          messages: initialMessages || [], // Start with initial messages for AI state
          agent: agentData
        }));

        // Prepare UI messages, starting with initialMessages
        let uiMessagesToSet = [];
        if (initialMessages && initialMessages.length > 0) {
          uiMessagesToSet = initialMessages.map(msg => ({
            id: msg.id || nanoid(),
            display: msg.role === 'system' || msg.role === 'assistant'
              ? <BotMessage content={msg.content} avatar={agentData?.avatar || undefined} agentName={agentData?.name || undefined} />
              : <UserMessage>{msg.content}</UserMessage>
          }));
        }
        setMessages(uiMessagesToSet); // Set initial messages in UI immediately

        try {
          const response = await fetch(`/api/chat/history?agentId=${agentData.id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch history: ${response.statusText}`);
          }
          const historyMessages: VercelMessage[] = await response.json();

          const historyUiMessages = historyMessages.map(msg => ({
            id: msg.id || nanoid(),
            display: msg.role === 'user'
              ? <UserMessage>{msg.content}</UserMessage>
              : <BotMessage content={msg.content} avatar={agentData?.avatar || undefined} agentName={agentData?.name || undefined} />
          }));
          
          setMessages(currentUiMessages => [...currentUiMessages, ...historyUiMessages]);

          // Update AI state with fetched history
          setAIState(currentState => ({
            ...currentState,
            messages: [...(currentState.messages || []), ...historyMessages], // Append history to existing (initial) messages
          }));

        } catch (error) {
          console.error("Failed to fetch agent chat history:", error);
          toast({
            title: "Error",
            description: "Could not load chat history for this agent.",
            variant: "destructive",
          });
        }
      } else {
        // No agentData or agentData.id, treat as a general chat or new agent form
        let initialUiMessages = [];
        if (initialMessages && initialMessages.length > 0) {
          initialUiMessages = initialMessages.map(msg => ({
            id: msg.id || nanoid(),
            display: msg.role === 'system' || msg.role === 'assistant'
              ? <BotMessage content={msg.content} />
              : <UserMessage>{msg.content}</UserMessage>
          }));
        }
        setMessages(initialUiMessages);
        setAIState(currentState => ({
          ...currentState,
          chatId: id,
          messages: initialMessages || [],
          agent: null
        }));
      }
    }

    loadAgentChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentData, id, initialMessages, setMessages, setAIState]); // initialMessages is added as a dependency

  useEffect(() => {
    const messagesLength = aiState.messages?.length;
    // This logic for scrolling and refresh might need adjustment
    // based on how history loading affects messagesLength
    if (messagesLength && messagesLength % 2 === 1 && messagesLength > (initialMessages?.length || 0) ) { // check if a new pair of user/assistant message is added beyond initial
      sleep(500).then(() => {
        ref.current?.scrollTo(0, ref.current.scrollHeight)
        router.refresh()
      })
    }
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)
  }, [])

  useEffect(() => {
    missingKeys.map((key) => {
      toast({
        title: "Error",
        description: `Missing ${key} environment variable!`,
        variant: "destructive",
      })
    })
  }, [missingKeys])

  return (
    <div className={`size-full`}>
      <ScrollArea className="size-full">
        <div
          ref={ref}
          className={`mx-auto w-full pb-36 pt-14 sm:max-w-2xl sm:pb-28 sm:pt-0 ${isSidebarOpen && session ? "lg:translate-x-[100px]" : ""} transition-all duration-300 ${messages.length !== 0 && "px-3"}`}
        >
          <ChatMessage id={id} messages={messages} />
          <div ref={messagesEndRef} />
        </div>
        <ChatPanel agentData={agentData} />
      </ScrollArea>
      <div
        className={`${
          messages.length !== 0 ||
          pathname === "/chat" ||
          pathname === "/" ||
          pathname.includes("chat")
            ? "block"
            : "hidden"
        } ${
          isSidebarOpen && session ? "lg:translate-x-[100px]" : ""
        } fixed bottom-0 mx-auto w-full bg-gradient-to-t from-background via-background to-transparent transition-all duration-300`}
      >
        <PromptForm
          input={input}
          setInput={setInput}
          agent={agentData}
          pathname={pathname}
        />
      </div>
    </div>
  )
}

export default Chat
