export const listingStatusMap = {
  forsale: {
    label: "For Sale",
    color: "bg-status-forsale",
    foreground: "text-status-forsale-foreground",
  },
  sold: { 
    label: "Sold", 
    color: "bg-status-sold", 
    foreground: "text-status-sold-foreground" 
  },
  draft: {
    label: "Draft",
    color: "bg-status-draft",
    foreground: "text-status-draft-foreground",
  },
} as const

export type ListingStatus = keyof typeof listingStatusMap
export type ListingStatusOption = {
  label: string
  value: ListingStatus
}

export const listingStatusOptions: ListingStatusOption[] = Object.entries(listingStatusMap).map(
  ([key, value]) => ({
    label: value.label,
    value: key as ListingStatus,
  }),
)
