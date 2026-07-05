"use client"
import { listingStatusMap } from "@/collections/Properties/listing-status-map"
import { cn } from "@/lib/utils"
import { useProperty } from "../providers/property"

export const PropertyStatus = () => {
  const property = useProperty()

  const listingStatus = property.listingStatus
  return (
    <div
      className={cn(
        "text-sm font-medium uppercase text-white px-3 py-1 rounded-xs",
        listingStatusMap[listingStatus].color,
        listingStatusMap[listingStatus].foreground,
      )}
    >
      {listingStatusMap[listingStatus].label}
    </div>
  )
}
