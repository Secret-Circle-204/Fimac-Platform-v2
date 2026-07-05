"use client"
import { useProperty } from "../providers/property"

export const PropertyDescription = () => {
  const property = useProperty()
  return <div>{property.description}</div>
}
