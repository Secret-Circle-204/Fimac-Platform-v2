'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/**
 * Invisible component that fixes Leaflet tile rendering inside animated portals.
 * Leaflet calculates tile positions at mount time, but inside framer-motion animations
 * the container size is incorrect. This forces a recalculation after the animation completes.
 */
export function MapResizer() {
  const map = useMap()

  useEffect(() => {
    // Immediate fix attempt
    map.invalidateSize()

    // Delayed fix for portal animation completion
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 500)

    return () => clearTimeout(timer)
  }, [map])

  return null
}
