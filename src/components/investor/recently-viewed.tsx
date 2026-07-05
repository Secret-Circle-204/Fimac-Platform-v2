"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Eye, MapPin, Building2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { buildPropertyUrl } from "@/repository/property/generate-url"
import { formatPrice } from "@/lib/format-price"

type PropertyData = {
  id: string
  title: string
  url?: string
  photos?: { url: string; sizes?: { card?: { url?: string | null } } }[]
  address?: { city: string; state: string }
  status?: string
  price?: number
  currency?: string | null
}

type RecentlyViewedItem = {
  property: PropertyData
  viewCount: number
  lastViewed: string
}

export function RecentlyViewedProperties() {
  const [loading, setLoading] = useState(true)
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([])
  const [totalViews, setTotalViews] = useState(0)

  useEffect(() => {
    fetchRecentlyViewed()
  }, [])

  const fetchRecentlyViewed = async () => {
    try {
      const response = await fetch("/api/investor/recently-viewed")
      if (response.ok) {
        const data = await response.json()
        setRecentlyViewed(data.recentlyViewed || [])
        setTotalViews(data.totalViews || 0)
      }
    } catch (error) {
      console.error("Failed to fetch recently viewed:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card className="border border-gray-100 bg-white shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-50/80 pb-5">
          <CardTitle className="flex items-center gap-2.5 text-xl font-black tracking-tight text-navy-deep animate-pulse">
            <Clock className="h-5 w-5 text-gold-royal animate-spin" />
            Loading recently viewed...
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="flex justify-center items-center gap-2.5 text-gray-400 text-sm">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gold-royal border-t-transparent" />
            <span>Retrieving browsing history...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recentlyViewed.length === 0) {
    return (
      <Card className="border border-gray-100 bg-white shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-50/80 pb-5">
          <CardTitle className="flex items-center gap-2.5 text-xl font-black tracking-tight text-navy-deep">
            <Clock className="h-5 w-5 text-gold-royal" />
            Recently Viewed
          </CardTitle>
          <CardDescription className="text-sm font-medium mt-1">
            Properties you have recently explored
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gold-royal/10 text-gold-royal rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8" />
            </div>
            <p className="text-navy-deep font-bold text-base mb-1">No property views yet</p>
            <p className="text-gray-400 text-xs mb-6">Start exploring investment portfolios to build your viewing history.</p>
            <Button asChild className="bg-gold-royal hover:bg-gold-light text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-300 shadow-[0_4px_20px_-5px_rgba(161,128,82,0.5)]">
              <Link href="/search">Start Browsing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-100 bg-white shadow-xs rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="border-b border-gray-50/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-xl font-black tracking-tight text-navy-deep">
              <Clock className="h-5 w-5 text-gold-royal" />
              Recently Viewed
            </CardTitle>
            <CardDescription className="text-sm font-medium mt-1">
              Properties you have recently explored. Logged views: <span className="text-navy-deep font-bold">{totalViews}</span>
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="border-gray-200 hover:border-gold-royal hover:text-gold-royal rounded-xl font-semibold self-start sm:self-center transition-colors duration-300">
            <Link href="/search">Browse More</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentlyViewed.map((item) => {
            const property = item.property
            return (
              <Link
                key={property.id}
                href={property.url || buildPropertyUrl(property.id, { city: property.address?.city, state: property.address?.state })}
                className="group flex flex-col h-full border border-gray-100 hover:border-gold-royal/30 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-16/10 bg-gray-50 relative overflow-hidden">
                  {property.photos?.[0]?.url ? (
                    <Image
                      src={property.photos[0].sizes?.card?.url || property.photos[0].url}
                      alt={property.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <Building2 className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-navy-deep/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-gold-royal flex items-center gap-1.5 border border-white/10">
                    <Eye className="h-3 w-3" />
                    {item.viewCount} {item.viewCount === 1 ? 'view' : 'views'}
                  </div>
                </div>
                <div className="p-5 flex flex-col grow">
                  <h3 className="font-bold text-base text-navy-deep group-hover:text-gold-royal transition-colors line-clamp-1 mb-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-4">
                    <MapPin className="h-3.5 w-3.5 text-gray-400/80" />
                    <span>{property.address?.city || 'N/A'}, {property.address?.state || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Value</p>
                      <p className="text-lg font-black text-navy-deep">
                        {property.price ? formatPrice(property.price, property.currency) : "Request Price"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-medium">Last Viewed</p>
                      <p className="text-xs font-bold text-gray-500 mt-0.5">{formatDate(item.lastViewed)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
