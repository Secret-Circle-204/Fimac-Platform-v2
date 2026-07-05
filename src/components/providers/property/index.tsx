"use client"
import { PropertyDecorator } from "@/repository/property/property-decorator"
import { Property } from "@/payload-types"
import { createContext, useContext, useMemo } from "react"

export const PropertyContext = createContext<Property | null>(null)

export const PropertyProvider = ({
  children,
  property,
}: {
  children: React.ReactNode
  property: Property
}) => {
  return <PropertyContext.Provider value={property}>{children}</PropertyContext.Provider>
}

export const useProperty = () => {
  const context = useContext(PropertyContext)
  if (!context) {throw new Error("useProperty must be used within a PropertyProvider")}
  // useMemo prevents creating a new PropertyDecorator instance on every render,
  // which would cause infinite re-render loops in all child components.
  return useMemo(() => new PropertyDecorator(context), [context])
}
