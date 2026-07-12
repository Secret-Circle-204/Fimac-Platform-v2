"use client"
import { constructionStatusMap, ConstructionStatusType } from "@/collections/Properties/construction-status-map"
import { cn } from "@/lib/utils"
import { useProperty } from "../providers/property"

interface PropertyConstructionStatusProps {
  className?: string
  locale?: 'en' | 'ar'
}

export const PropertyConstructionStatus = ({ className }: PropertyConstructionStatusProps) => {
  const property = useProperty()
  
  // Safely resolve the slug (it can be an object if populated)
  const statusSlug =
    property.constructionStatus && typeof property.constructionStatus === 'object'
      ? (property.constructionStatus.slug as ConstructionStatusType)
      : (property.constructionStatus as unknown as ConstructionStatusType) || 'ready'

  const statusInfo = constructionStatusMap[statusSlug]

  if (!statusInfo) return null

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs backdrop-blur-xs",
        statusInfo.color,
        className
      )}
    >
      <span>{statusInfo.label}</span>
    </div>
  )
}
