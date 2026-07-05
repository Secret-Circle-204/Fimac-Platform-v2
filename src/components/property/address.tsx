"use client"
import { useProperty } from "../providers/property"

export const PropertyAddress = () => {
  const property = useProperty()
  if (!property.location?.address) {
    return null
  }
  //<span className="font-semibold">5325 Roberts Rd</span>, Corryton, TN 37721
  return (
    <div>
      <span className="font-semibold">{property.location.address.street}</span>,{" "}
      <span>{property.location.address.city}</span>, <span>{property.location.address.state}</span>{" "}
      <span>{property.location.address.zip}</span>
    </div>
  )
}
