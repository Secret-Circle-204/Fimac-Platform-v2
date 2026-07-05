"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Cpu, MapPin, Building2, Bed, Bath, Ruler } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  propertyType?: string | { name: string } | null
  price?: number
  currency?: string | null
  projected_roi?: number
  details?: {
    bedrooms?: number
    bathrooms?: number
    squareMeters?: number
  }
}

export function RecommendedProperties() {
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [isBehavioral, setIsBehavioral] = useState(false)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/investor/recommendations")
      if (response.ok) {
        const data = await response.json()
        setProperties(data.recommendations || [])
        setIsBehavioral(data.isBehavioral || false)
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border border-navy-deep/5 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 animate-pulse">
            <Cpu className="h-5 w-5 text-gold-royal animate-spin" />
            Analyzing behavior and matching properties...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-12 items-center gap-2 text-gray-400 text-sm">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gold-royal border-t-transparent" />
            <span>Consulting behavioral index...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`transition-all duration-500 border ${
      isBehavioral 
        ? "border-purple-200 bg-purple-50/10 shadow-[0_10px_30px_rgba(168,85,247,0.03)]" 
        : "border-navy-deep/5 bg-white shadow-sm"
    }`}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-navy-deep">
              {isBehavioral ? (
                <>
                  <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
                  Recommended For You
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 text-blue-brand" />
                  Popular Investments
                </>
              )}
            </CardTitle>
            <CardDescription className="text-sm font-medium mt-1">
              {isBehavioral
                ? "⚡ Dynamic recommendations tailored to your recent search interests and budget range."
                : "Explore high-yield portfolios. Start browsing properties to calibrate your personalized matching feed!"}
            </CardDescription>
          </div>
          {isBehavioral && (
            <Badge variant="default" className="w-fit bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider text-[9px] px-3 py-1 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.35)] flex items-center gap-1.5 self-start md:self-center border-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              AI Behavioral
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.slice(0, 6).map((property: PropertyData) => {
            const propertyTypeLabel = typeof property.propertyType === 'object' && property.propertyType !== null
              ? property.propertyType.name
              : property.propertyType || "Property"

            // Safely extract details
            const details = property.details || {}
            const bedrooms = details.bedrooms
            const bathrooms = details.bathrooms
            const sqMeter = details.squareMeters

            return (
              <Link
                key={property.id}
                href={property.url || buildPropertyUrl(property.id, { city: property.address?.city, state: property.address?.state })}
                className={`group flex flex-col h-full border rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300 ${
                  isBehavioral 
                    ? "hover:border-purple-400 border-purple-100/80 shadow-[0_4px_20px_rgba(168,85,247,0.02)]" 
                    : "hover:border-gold-royal/40 border-gray-100 shadow-xs"
                }`}
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

                  {propertyTypeLabel && (
                    <div className="absolute top-3 left-3 bg-navy-deep/80 text-gold-royal text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10">
                      {propertyTypeLabel}
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col grow">
                  <h3 className={`font-bold text-base text-navy-deep transition-colors line-clamp-1 mb-1 ${
                    isBehavioral ? "group-hover:text-purple-600" : "group-hover:text-gold-royal"
                  }`}>
                    {property.title}
                  </h3>
                  
                  {property.address?.city && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold mb-3">
                      <MapPin className="h-3.5 w-3.5 text-gray-400/80" />
                      <span>{property.address.city}, {property.address.state}</span>
                    </div>
                  )}

                  {/* Property Details Row */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-4 pb-3 border-b border-gray-50">
                    {bedrooms && (
                      <span className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4 text-gray-400" />
                        <span>{bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                      </span>
                    )}
                    {bathrooms && (
                      <span className="flex items-center gap-1.5">
                        <Bath className="h-4 w-4 text-gray-400" />
                        <span>{bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                      </span>
                    )}
                    {sqMeter && (
                      <span className="flex items-center gap-1.5">
                        <Ruler className="h-4 w-4 text-gray-400" />
                        <span>{sqMeter} m²</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Investment Value</p>
                      <p className="text-lg font-black text-navy-deep">
                        {property.price ? formatPrice(property.price, property.currency) : "Request Price"}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                      isBehavioral 
                        ? "text-purple-600 group-hover:text-purple-700 group-hover:translate-x-0.5" 
                        : "text-gold-royal group-hover:text-gold-light group-hover:translate-x-0.5"
                    }`}>
                      Analyze Deal →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {properties.length > 6 && (
          <div className="mt-8 text-center">
            <Button asChild className={isBehavioral ? "bg-purple-600 hover:bg-purple-700 shadow-purple" : ""}>
              <Link href="/search">
                View All {properties.length} Portfolios
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
