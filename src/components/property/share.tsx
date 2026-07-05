"use client"

import { useState, useEffect } from "react"
import { Share2Icon, CheckIcon, X, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createPortal } from "react-dom"

// Foolproof clipboard copy supporting secure (HTTPS) and unsecure (HTTP local dev IP) contexts
const copyToClipboard = async (text: string): Promise<boolean> => {
  // 1. Try modern Clipboard API (secure contexts only)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.warn("Clipboard API writeText failed, attempting fallback", err)
    }
  }

  // 2. Try classic textarea fallback (works in unsecure HTTP local IP contexts e.g. 192.168.x.x)
  try {
    const textArea = document.createElement("textarea")
    textArea.value = text
    
    // Position text area outside viewport
    textArea.style.position = "fixed"
    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.opacity = "0"
    
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const successful = document.execCommand("copy")
    document.body.removeChild(textArea)
    return successful
  } catch (err) {
    console.error("ExecCommand fallback copy failed:", err)
    return false
  }
}

export const PropertyShare = () => {
  const [copied, setCopied] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleShare = async () => {
    if (typeof window === "undefined") return

    const shareData = {
      title: document.title,
      text: "Check out this extraordinary real estate investment opportunity on Fimac Group:",
      url: window.location.href,
    }

    // Try native sharing first (only available in secure contexts / HTTPS on mobile viewports)
    if (navigator.share && window.innerWidth < 1024) {
      try {
        await navigator.share(shareData)
        toast.success("Shared successfully! ✨", {
          description: "Thank you for sharing this signature listing.",
        })
        return
      } catch (err) {
        console.log("Native share cancelled or failed, falling back to custom modal", err)
      }
    }

    // Fallback: Open our custom Fimac Luxury Share Modal
    setIsModalOpen(true)
  }

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return
    const isCopied = await copyToClipboard(window.location.href)
    if (isCopied) {
      setCopied(true)
      toast.success("Link copied to clipboard! 📋", {
        description: "You can now paste and share it with your partners.",
        className: "bg-navy-deep text-white border-gold-royal/30 rounded-2xl",
      })
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error("Failed to copy link", {
        description: "Please manually copy the URL from your browser address bar.",
      })
    }
  }

  // Pre-fill parameters for social shares
  const url = typeof window !== "undefined" ? window.location.href : ""
  const title = typeof document !== "undefined" ? document.title : "Exceptional Real Estate"
  const shareText = `Check out this extraordinary real estate investment opportunity: ${title}`
  const encodedText = encodeURIComponent(`${shareText} - ${url}`)
  const encodedUrl = encodeURIComponent(url)

  const shareChannels = [
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${encodedText}`,
      icon: (
        <svg className="h-5 w-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.735-3.693c1.62.963 3.41 1.47 5.265 1.471h.007c5.626 0 10.201-4.577 10.203-10.207a9.92 9.92 0 00-2.887-7.214 9.92 9.92 0 00-7.202-2.885c-5.634 0-10.21 4.577-10.213 10.209-.001 1.854.484 3.666 1.408 5.271L2.836 21.14l4.956-1.3-.003.003z"/>
        </svg>
      ),
      bgClass: "bg-[#25D366]/10 border-[#25D366]/20 hover:bg-[#25D366]/20 text-[#25D366]",
    },

    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
        </svg>
      ),
      bgClass: "bg-[#1877F2]/10 border-[#1877F2]/20 hover:bg-[#1877F2]/20 text-[#1877F2]",
    },
    {
      name: "Email",
      url: `mailto:?subject=${encodeURIComponent("Exceptional Investment: " + title)}&body=${encodeURIComponent("I thought you might be interested in this signature real estate investment opportunity: \n\n" + url)}`,
      icon: <Mail size={18} className="text-gold-royal" />,
      bgClass: "bg-gold-royal/10 border-gold-royal/20 hover:bg-gold-royal/20 text-gold-royal",
    },
  ]

  return (
    <>
      <Button
        onClick={handleShare}
        className="min-w-[150px] px-5 py-2.5 h-11 bg-[#061849] hover:bg-gold-royal text-white border border-white/10 rounded-xl transition-all duration-300 shadow-md active:scale-95 flex items-center justify-center gap-2 font-black tracking-widest text-[10px] uppercase group cursor-pointer"
      >
        <Share2Icon size={14} className="shrink-0 group-hover:rotate-12 transition-transform duration-300 text-gold-royal" />
        <span>Share Property</span>
      </Button>

      {/* Failsafe Custom Glassmorphic Share Modal (Portal to body) */}
      {isModalOpen && mounted && createPortal(
        <>
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[99998] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-sm bg-[#061849] border border-white/10 p-6 rounded-[32px] shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 pointer-events-auto text-white z-[99999]">
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/5 cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Title Header */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-royal">
                  Fimac Portfolio
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Share Signature Listing
                </h3>
              </div>

              {/* Share Channels */}
              <div className="flex flex-col gap-3">
                {shareChannels.map((channel) => (
                  <a
                    key={channel.name}
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsModalOpen(false)}
                    className={`flex items-center gap-4 w-full p-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all duration-300 ${channel.bgClass}`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 shrink-0">
                      {channel.icon}
                    </div>
                    <span>Share via {channel.name}</span>
                  </a>
                ))}

                {/* Foolproof Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-4 w-full p-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all duration-300 bg-white/5 border-white/10 hover:bg-gold-royal hover:border-gold-royal/30 text-white cursor-pointer ${
                    copied ? "bg-gold-royal border-gold-royal/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 shrink-0">
                    {copied ? <CheckIcon size={16} className="animate-in fade-in zoom-in duration-300 text-white" /> : <Share2Icon size={16} className="text-gold-royal" />}
                  </div>
                  <span>{copied ? "Link Copied!" : "Copy Listing Link"}</span>
                </button>
              </div>
            </div>
          </div>
          {/* Backdrop Click Closes Modal */}
          <div className="fixed inset-0 z-[99997]" onClick={() => setIsModalOpen(false)} />
        </>,
        document.body
      )}
    </>
  )
}
