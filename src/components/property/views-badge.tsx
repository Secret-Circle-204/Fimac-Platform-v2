"use client"

import { useState, useEffect } from "react"
import { Eye } from "lucide-react"
import { viewsBatcher } from "@/lib/views-batcher"

interface ViewsBadgeProps {
  views: number
  propertyId?: string | number
  className?: string
  minimal?: boolean
}

const formatViews = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`
  }
  return count.toString()
}

export const ViewsBadge = ({ views, propertyId, className = "", minimal = false }: ViewsBadgeProps) => {
  const [displayViews, setDisplayViews] = useState(views)

  useEffect(() => {
    setDisplayViews(views)
  }, [views])

  useEffect(() => {
    if (!propertyId) return

    const idStr = propertyId.toString()

    // Register with batcher for client-side fetching
    viewsBatcher?.register(idStr, (latestViews) => {
      setDisplayViews(latestViews)
    })

    // Listen for active view tracking updates
    const handleTracked = (e: Event) => {
      const customEvent = e as CustomEvent<{ propertyId: string; views: number }>
      if (customEvent.detail && customEvent.detail.propertyId === idStr) {
        setDisplayViews(customEvent.detail.views)
      }
    }

    window.addEventListener("property-view-tracked", handleTracked)
    return () => {
      window.removeEventListener("property-view-tracked", handleTracked)
    }
  }, [propertyId])

  if (minimal) {
    return (
      <div 
        className={`
          flex items-center gap-1.5 py-1 px-2 rounded-lg
          bg-gold-royal/5 hover:bg-gold-royal/10 
          text-gold-royal text-xs font-bold
          transition-colors pointer-events-none select-none
          ${className}
        `}
        title={`${displayViews.toLocaleString()} views`}
      >
        <Eye size={13} className="stroke-[2.5]" />
        <span>{formatViews(displayViews)}</span>
      </div>
    )
  }

  return (
    <div 
      className={`
        group/badge relative flex items-center gap-3.5 py-[0.65rem] px-[1.5rem] rounded-[0.6rem] 
        bg-[#0d1528]/60 backdrop-blur-xl 
        border border-gold-royal/30 shadow-md
        transition-all duration-300 ease-out
        pointer-events-none select-none overflow-hidden
        ${className}
      `}
      title={`${displayViews.toLocaleString()} total live views`}
    >
      {/* Futuristic Shimmer Highlight Over The Badge */}
      <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-[35deg] translate-x-[-200%] group-hover/badge:animate-[shimmer_2s_infinite]" />
      
      {/* Live Pulse Sensor Beacon */}
      <div className="relative flex items-center justify-center w-2 h-2">
        <span className="absolute w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
        <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#34d399]" />
      </div>

      {/* Futuristic VIP Eye with Subtle Golden Aura */}
      <div className="relative flex items-center justify-center">
        <Eye 
          size={15} 
          className="text-gold-royal opacity-95 drop-shadow-[0_0_8px_rgba(212,175,55,0.9)] transition-all duration-500" 
        />
      </div>
      
      <div className="flex items-center gap-2 leading-none">
        <span className="text-[1rem] font-bold bg-gradient-to-r from-white via-gold-light to-[#FAD961] bg-clip-text text-transparent drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
          {formatViews(displayViews)}
        </span>
        <span className="text-[0.8rem] font-semibold text-white/90">
          Views
        </span>
      </div>
    </div>
  )
}
