import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PropertySearchCardSkeleton() {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Skeleton */}
      <div className="relative h-56 bg-gray-200">
        <Skeleton className="w-full h-full rounded-none" />

        {/* Status Badge Skeleton */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-6 w-20 rounded-full bg-white/50" />
        </div>

        {/* Favorite Button Skeleton */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-8 w-8 rounded-full bg-white/50" />
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Price Skeleton */}
        <Skeleton className="h-8 w-1/3" />

        {/* Title Skeleton */}
        <Skeleton className="h-6 w-3/4" />

        {/* Location Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Details (Beds/Baths/Sqft) Skeleton */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Property Type Badge Skeleton */}
        <Skeleton className="h-6 w-24 rounded-full" />

        {/* Description Preview Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Button Skeleton */}
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}
