"use client"
import { Card, CardContent } from "../ui/card"
import { PropertyStatus } from "./status"
import { PropertyConstructionStatus } from "./construction-status"
import { BathIcon, BedDoubleIcon, RulerIcon, Compass, Key, Award, ParkingCircle, Layers } from "lucide-react"
import Link from "next/link"
import { PropertyShare } from "./share"
import { useProperty } from "../providers/property"
import Image from "next/image"
import { ViewsBadge } from "./views-badge"

export const FeaturedPropertyCard = () => {
  const property = useProperty()
  const images = property.photos
  const featureImage = images[0] ?? {
    url: "https://placehold.co/600x400.png",
    alt: property.title,
  }
  return (
    <Link href={property.url} className="group block relative h-full">
      <Card className="overflow-hidden py-0 h-full group-hover:shadow-md gap-0">
        <div className="relative">
          <Image
            src={(featureImage.sizes?.card?.url || featureImage.url)!}
            alt={featureImage.alt}
            width={600}
            height={400}
            className="object-cover h-[210px] w-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
            <PropertyStatus />
            <PropertyConstructionStatus />
          </div>
          <div className="absolute top-4 right-4 z-10">
            <ViewsBadge views={property.views} />
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl mb-1 line-clamp-1">{property.price}</h3>
                <PropertyShare />
              </div>
              <div className="line-clamp-1 text-sm transition-all group-hover:text-amber-800">
                <span className="font-semibold">{property.location?.address?.street}</span>,{" "}
                <span>{property.location?.address?.city}</span>, <span>{property.location?.address?.state}</span>{" "}
                <span>{property.location?.address?.zip}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground border-t pt-3">
              {property.category === 'land' && property.land && (
                <>
                  {property.land.zoning && (
                    <span className="flex items-center gap-1">
                      <Compass size={20} />
                      {property.land.zoning.charAt(0).toUpperCase() + property.land.zoning.slice(1)}
                    </span>
                  )}
                  {property.area !== undefined && property.area !== null && property.area > 0 && (
                    <span className="flex items-center gap-1">
                      <RulerIcon size={20} />
                      {property.area.toLocaleString()} m²
                    </span>
                  )}
                  {property.land.isCorner === true && (
                    <span className="flex items-center gap-1">
                      <Compass size={20} />
                      Corner
                    </span>
                  )}
                </>
              )}

              {property.category === 'commercial' && property.commercial && (
                <>
                  {property.commercial.floor !== undefined && property.commercial.floor !== null && (
                    <span className="flex items-center gap-1">
                      <Layers size={20} />
                      Floor {property.commercial.floor}
                    </span>
                  )}
                  {property.area !== undefined && property.area !== null && property.area > 0 && (
                    <span className="flex items-center gap-1">
                      <RulerIcon size={20} />
                      {property.area.toLocaleString()} m²
                    </span>
                  )}
                  {property.commercial.parkingSpaces !== undefined && property.commercial.parkingSpaces !== null && property.commercial.parkingSpaces > 0 && (
                    <span className="flex items-center gap-1">
                      <ParkingCircle size={20} />
                      {property.commercial.parkingSpaces} Park
                    </span>
                  )}
                </>
              )}

              {property.category === 'hospitality' && property.hospitality && (
                <>
                  {property.hospitality.totalRooms !== undefined && property.hospitality.totalRooms !== null && property.hospitality.totalRooms > 0 && (
                    <span className="flex items-center gap-1">
                      <Key size={20} />
                      {property.hospitality.totalRooms} Rooms
                    </span>
                  )}
                  {property.area !== undefined && property.area !== null && property.area > 0 && (
                    <span className="flex items-center gap-1">
                      <RulerIcon size={20} />
                      {property.area.toLocaleString()} m²
                    </span>
                  )}
                  {property.hospitality.starRating && (
                    <span className="flex items-center gap-1">
                      <Award size={20} />
                      {property.hospitality.starRating} Stars
                    </span>
                  )}
                </>
              )}

              {property.category === 'residential' && property.residential && (
                <>
                  {property.residential.bedrooms !== undefined && property.residential.bedrooms !== null && property.residential.bedrooms > 0 && (
                    <span className="flex items-center gap-1">
                      <BedDoubleIcon size={20} />
                      {property.residential.bedrooms} beds
                    </span>
                  )}
                  {property.residential.bathrooms !== undefined && property.residential.bathrooms !== null && property.residential.bathrooms > 0 && (
                    <span className="flex items-center gap-1">
                      <BathIcon size={20} />
                      {property.residential.bathrooms} baths
                    </span>
                  )}
                  {property.area !== undefined && property.area !== null && property.area > 0 && (
                    <span className="flex items-center gap-1">
                      <RulerIcon size={20} />
                      {property.area.toLocaleString()} m²
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
