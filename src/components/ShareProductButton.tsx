'use client'

import { useState } from 'react'
import { Share2, MessageCircle, Copy, Laptop, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { getBatchSecureDocumentUrls } from '@/app/dashboard/actions/document'
import type { ProductListItem } from '@/app/dashboard/products/types'

interface ShareProductButtonProps {
  product: ProductListItem
}

export function ShareProductButton({ product }: ShareProductButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  const getFullProductDetails = async () => {
    setIsSharing(true)
    try {
      const docIds = product.documents?.map(d => d.id) || []
      let docLinksText = ""

      if (docIds.length > 0) {
        // Use 10 years expiry for partner shared links (matches ShareDocumentButton)
        const { success, results } = await getBatchSecureDocumentUrls(docIds, 315360000)
        if (success && results) {
          docLinksText = "\n\n📄 *ASSOCIATED DOCUMENTS:*\n" + results.map(r => 
            `▫️ ${r.title}: ${r.url || 'Error generating link'}`
          ).join('\n')
        }
      }

      const text = `*VIKR PRODUCT CATALOG* 📦\n\n` +
                   `📦 *${product.name}*\n` +
                   `🔹 *SKU:* ${product.sku}\n` +
                   (product.category ? `🔹 *Category:* ${product.category}\n` : "") +
                   (product.ph_level !== null ? `🔹 *pH Level:* ${product.ph_level}\n` : "") +
                   `\n📝 *DESCRIPTION:*\n${product.description || 'No description available.'}\n` +
                   (product.usp ? `\n✨ *USP:*\n${product.usp}\n` : "") +
                   (product.features_benefits ? `\n✅ *FEATURES & BENEFITS:*\n${product.features_benefits}\n` : "") +
                   (product.applications ? `\n🛠️ *APPLICATIONS:*\n${product.applications}\n` : "") +
                   docLinksText

      return { text, title: `VIKR Product: ${product.name}` }
    } catch (err) {
      console.error('Error generating product details:', err)
      return null
    } finally {
      setIsSharing(false)
    }
  }

  const handleNativeShare = async () => {
    const data = await getFullProductDetails()
    if (!data) return

    const shareData = {
      title: data.title,
      text: data.text,
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
    const data = await getFullProductDetails()
    if (!data) return
    window.open(`https://wa.me/?text=${encodeURIComponent(data.text)}`, '_blank')
  }

  const handleCopyLink = async () => {
    const data = await getFullProductDetails()
    if (!data) return
    
    try {
      // Ensure window is focused to prevent NotAllowedError
      window.focus()
      await navigator.clipboard.writeText(data.text)
      alert('Product details and secure links copied to clipboard!')
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback:', err)
      const textArea = document.createElement("textarea")
      textArea.value = data.text
      textArea.style.position = "fixed"
      textArea.style.left = "-9999px"
      textArea.style.top = "0"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      if (successful) {
        alert('Product details and secure links copied to clipboard!')
      } else {
        alert('Failed to copy. Please try again.')
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          disabled={isSharing}
          className="h-9 w-9 rounded-full bg-brand-accent/5 hover:bg-brand-accent/20 text-brand-accent shadow-sm transition-all shrink-0 border border-brand-accent/10 hover:border-brand-accent/30"
          title="Share Product Details"
          onClick={(e) => e.stopPropagation()} // Prevent card click
        >
          {isSharing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1 bg-bg-card border-border-subtle shadow-xl rounded-xl" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={handleNativeShare} className="flex items-center gap-3 cursor-pointer p-3 focus:bg-bg-hover rounded-lg transition-colors group">
          <Laptop className="w-4 h-4 text-text-brand group-hover:text-brand-accent" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-main">Native Share</span>
            <span className="text-[10px] text-text-meta">Use system share menu</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border-subtle mx-1 my-1" />
        
        <DropdownMenuItem onClick={handleWhatsAppShare} className="flex items-center gap-3 cursor-pointer p-3 focus:bg-bg-hover rounded-lg transition-colors group">
          <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-[#128C7E]" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-main">Share to WhatsApp</span>
            <span className="text-[10px] text-text-meta">Send full product card</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border-subtle mx-1 my-1" />

        <DropdownMenuItem onClick={handleCopyLink} className="flex items-center gap-3 cursor-pointer p-3 focus:bg-bg-hover rounded-lg transition-colors group">
          <Copy className="w-4 h-4 text-text-meta group-hover:text-text-main" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-main">Copy All Details</span>
            <span className="text-[10px] text-text-meta">Includes text & secure links</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
