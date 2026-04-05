'use client'

import { useState } from 'react'
import { Share2, MessageCircle, Mail, Copy, Laptop } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { getSecureDocumentUrl } from '@/app/dashboard/actions/document'

interface ShareDocumentButtonProps {
  documentId: string
  title: string
}

export function ShareDocumentButton({ documentId, title }: ShareDocumentButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  const getSecureLink = async () => {
    setIsSharing(true)
    try {
      const { success, url, error } = await getSecureDocumentUrl(documentId, 315360000)
      if (!success || !url) {
        alert(error || 'Failed to generate secure link.')
        return null
      }
      return {
        url,
        text: `VIKR Document: ${title}\nSecure Link: ${url}`
      }
    } catch (err) {
      console.error('Error generating link:', err)
      return null
    } finally {
      setIsSharing(false)
    }
  }

  const handleNativeShare = async () => {
    const data = await getSecureLink()
    if (!data) return

    const shareData = {
      title: `VIKR Document: ${title}`,
      text: data.text,
      url: data.url,
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') console.error('Share failed:', err)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleWhatsAppShare = async () => {
    const data = await getSecureLink()
    if (!data) return
    window.open(`https://wa.me/?text=${encodeURIComponent(data.text)}`, '_blank')
  }

  const handleEmailShare = async () => {
    const data = await getSecureLink()
    if (!data) return
    const subject = encodeURIComponent(`Secure VIKR Document: ${title}`)
    const body = encodeURIComponent(data.text)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  const handleCopyLink = async () => {
    const data = await getSecureLink()
    if (!data) return
    await navigator.clipboard.writeText(data.text)
    alert('Secure link copied to clipboard!')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isSharing}
          className="flex items-center gap-2 font-bold h-[44px] px-4 rounded-xl border-border-subtle bg-bg-card hover:border-brand-accent/50 group shadow-sm transition-all text-xs uppercase tracking-wider"
        >
          <Share2 className="w-4 h-4 text-text-brand group-hover:text-brand-accent transition-colors" />
          {isSharing ? 'Generating...' : 'Share'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1 bg-bg-card border-border-subtle shadow-xl rounded-xl">
        <DropdownMenuItem onClick={handleNativeShare} className="flex items-center gap-2 cursor-pointer p-3 focus:bg-bg-hover rounded-lg transition-colors group">
          <Laptop className="w-4 h-4 text-text-brand group-hover:text-brand-accent" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-main">Native Share</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border-subtle mx-1 my-1" />
        
        <DropdownMenuItem onClick={handleWhatsAppShare} className="flex items-center gap-2 cursor-pointer p-3 focus:bg-bg-hover rounded-lg transition-colors group">
          <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-[#128C7E]" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-main">WhatsApp</span>
            <span className="text-[10px] text-text-meta">Instant group/contact share</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border-subtle mx-1 my-1" />

        <DropdownMenuItem onClick={handleCopyLink} className="flex items-center gap-2 cursor-pointer p-3 focus:bg-bg-hover rounded-lg transition-colors group">
          <Copy className="w-4 h-4 text-text-meta group-hover:text-text-main" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-main">Copy Secure Link</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
