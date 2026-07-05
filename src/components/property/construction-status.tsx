"use client"
import { constructionStatusMap, ConstructionStatusType } from "@/collections/Properties/construction-status-map"
import { cn } from "@/lib/utils"
import { useProperty } from "../providers/property"

interface PropertyConstructionStatusProps {
  className?: string
  locale?: 'en' | 'ar'
}

export const PropertyConstructionStatus = ({ className, locale = 'en' }: PropertyConstructionStatusProps) => {
  const property = useProperty()
  
  // Safely cast or fallback
  const status = (property.constructionStatus || 'ready') as ConstructionStatusType
  const statusInfo = constructionStatusMap[status]

  if (!statusInfo) return null

  const label = locale === 'ar' ? statusInfo.labelAr : statusInfo.label
  
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs backdrop-blur-xs",
        statusInfo.color,
        className
      )}
    >
      <span className="text-sm leading-none">{statusInfo.icon}</span>
      <span>{label}</span>
    </div>
  )
}
