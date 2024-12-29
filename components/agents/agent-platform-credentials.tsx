import React, { useState } from "react"
import { ToolType } from "@prisma/client"
import { GithubLogo, TwitterLogo, DiscordLogo } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { ExternalLink } from "lucide-react"

interface PlatformCredential {
  id: string
  platform: ToolType
  name: string
  accessToken: string
}

interface AgentPlatformCredentialsProps {
  agentId?: string
  credentials: PlatformCredential[]
  onCredentialAdd: (platform: ToolType, name: string, accessToken: string) => Promise<void>
  onCredentialRemove: (credentialId: string) => Promise<void>
}

type SupportedPlatform = 'GITHUB_APP' | 'TWITTER' | 'DISCORD'

const PLATFORM_ICONS: Record<SupportedPlatform, typeof GithubLogo> = {
  'GITHUB_APP': GithubLogo,
  'TWITTER': TwitterLogo,
  'DISCORD': DiscordLogo,
}

function isSupportedPlatform(platform: string): platform is SupportedPlatform {
  return platform in PLATFORM_ICONS
}

const PLATFORM_INSTRUCTIONS: Record<SupportedPlatform, {
  title: string
  description: string
  instructions: string[]
  links: Array<{ text: string, url: string }>
}> = {
  'GITHUB_APP': {
    title: 'GitHub Personal Access Token',
    description: 'Create a personal access token to allow the agent to interact with GitHub repositories.',
    instructions: [
      'Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)',
      'Click "Generate new token" and select "Generate new token (classic)"',
      'Give it a name like "Wishonia Agent"',
      'Select the required scopes: repo, workflow, write:packages',
      'Click "Generate token" and copy the token immediately'
    ],
    links: [
      { 
        text: 'Create a new Personal Access Token',
        url: 'https://github.com/settings/tokens/new'
      },
      {
        text: 'Learn about GitHub tokens',
        url: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens'
      }
    ]
  },
  'TWITTER': {
    title: 'Twitter API Credentials',
    description: 'Create a Twitter Developer account and get API credentials.',
    instructions: [
      'Apply for a Twitter Developer account',
      'Create a new Project and App in the Developer Portal',
      'Generate API Key and API Key Secret',
      'Generate Access Token and Access Token Secret'
    ],
    links: [
      {
        text: 'Twitter Developer Portal',
        url: 'https://developer.twitter.com/en/portal/dashboard'
      },
      {
        text: 'Apply for Developer Access',
        url: 'https://developer.twitter.com/en/apply-for-access'
      }
    ]
  },
  'DISCORD': {
    title: 'Discord Bot Token',
    description: 'Create a Discord application and bot to get the required token.',
    instructions: [
      'Go to Discord Developer Portal',
      'Create a "New Application"',
      'Go to the "Bot" section',
      'Click "Add Bot" and confirm',
      'Click "Reset Token" to reveal the bot token',
      'Enable necessary Privileged Gateway Intents'
    ],
    links: [
      {
        text: 'Discord Developer Portal',
        url: 'https://discord.com/developers/applications'
      },
      {
        text: 'Discord Bot Documentation',
        url: 'https://discord.com/developers/docs/intro'
      }
    ]
  }
}

export default function AgentPlatformCredentials({
  agentId,
  credentials,
  onCredentialAdd,
  onCredentialRemove,
}: AgentPlatformCredentialsProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<ToolType | null>(null)
  const [name, setName] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getInstructions = (platform: ToolType | null) => {
    if (!platform || !isSupportedPlatform(platform)) {
      return null;
    }
    return PLATFORM_INSTRUCTIONS[platform];
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlatform) return

    setIsLoading(true)
    try {
      await onCredentialAdd(selectedPlatform, name, accessToken)
      setIsOpen(false)
      setName("")
      setAccessToken("")
      setSelectedPlatform(null)
      toast({
        description: "Platform credentials added successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add platform credentials.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (credentialId: string) => {
    try {
      await onCredentialRemove(credentialId)
      toast({
        description: "Platform credentials removed successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove platform credentials.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Platform Integrations</Label>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Add Platform
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Platform Credentials</DialogTitle>
              <DialogDescription>
                Add credentials for platforms this agent can interact with.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(PLATFORM_ICONS).map(([platform, Icon]) => (
                  <Button
                    key={platform}
                    type="button"
                    variant={selectedPlatform === platform ? "default" : "outline"}
                    onClick={() => setSelectedPlatform(platform as ToolType)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{platform.replace("_APP", "")}</span>
                  </Button>
                ))}
              </div>
              {selectedPlatform && getInstructions(selectedPlatform) && (
                <>
                  <div className="rounded-lg border border-muted p-4 space-y-4">
                    <div>
                      <h4 className="font-semibold">{getInstructions(selectedPlatform)?.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getInstructions(selectedPlatform)?.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Instructions:</h5>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {getInstructions(selectedPlatform)?.instructions.map((instruction: string, i: number) => (
                          <li key={i}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Useful Links:</h5>
                      <div className="space-y-1">
                        {getInstructions(selectedPlatform)?.links.map((link: { text: string, url: string }, i: number) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm flex items-center gap-1 text-blue-500 hover:text-blue-600"
                          >
                            {link.text}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="e.g. My GitHub Bot"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Access Token</Label>
                      <Input
                        type="password"
                        placeholder="Enter access token"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? "Adding..." : "Add Platform"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {credentials.map((cred) => {
          if (!isSupportedPlatform(cred.platform)) return null
          const Icon = PLATFORM_ICONS[cred.platform]
          return (
            <div
              key={cred.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <span>{cred.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(cred.id)}
              >
                Remove
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
} 