'use client'

import { Button } from "@/components/ui/button"
import { 
  TwitterIcon, 
  FacebookIcon, 
  LinkedinIcon, 
  CopyIcon, 
  CheckIcon 
} from "lucide-react"
import { useState } from "react"

interface ShareButtonsProps {
  petitionId: string
  userId: string
}

export function ShareButtons({ petitionId, userId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL}/petitions/${petitionId}?ref=${userId}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-sm text-gray-600">
        Share this petition to help it succeed
      </p>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(shareLinks.twitter, '_blank')}
        >
          <TwitterIcon className="w-4 h-4 mr-2" />
          Twitter
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(shareLinks.facebook, '_blank')}
        >
          <FacebookIcon className="w-4 h-4 mr-2" />
          Facebook
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(shareLinks.linkedin, '_blank')}
        >
          <LinkedinIcon className="w-4 h-4 mr-2" />
          LinkedIn
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
        >
          {copied ? (
            <CheckIcon className="w-4 h-4 mr-2" />
          ) : (
            <CopyIcon className="w-4 h-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
      </div>
    </div>
  )
} 