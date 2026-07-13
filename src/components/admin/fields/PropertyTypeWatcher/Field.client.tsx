'use client'

import React, { useEffect, useRef } from 'react'
import { useField, useConfig } from '@payloadcms/ui'

// Global client-side cache for property type slugs to avoid redundant network requests
const slugCache = new Map<string, string>()

export function PropertyTypeWatcherClient() {
  const { value: propertyType } = useField<any>({ path: 'propertyType' })
  const { setValue: setSlugValue } = useField<string>({ path: 'propertyTypeSlug' })
  const { config } = useConfig()

  // Safely extract the ID from the relationship field value
  const propertyTypeId =
    propertyType === null || propertyType === undefined
      ? null
      : typeof propertyType === 'object' && 'id' in propertyType
      ? propertyType.id
      : typeof propertyType === 'object' && 'value' in propertyType
      ? propertyType.value
      : propertyType

  // Keep track of the last resolved ID to prevent redundant executions
  const lastIdRef = useRef<any>(undefined)

  useEffect(() => {
    // If the ID hasn't actually changed, return immediately to preserve form state stability
    if (propertyTypeId === lastIdRef.current) {
      return
    }

    lastIdRef.current = propertyTypeId

    if (!propertyTypeId) {
      setSlugValue('')
      return
    }

    // Check cache first to avoid redundant network requests
    const stringId = String(propertyTypeId)
    if (slugCache.has(stringId)) {
      setSlugValue(slugCache.get(stringId) || '')
      return
    }

    // Set up AbortController for request cancellation
    const abortController = new AbortController()
    const serverURL = config?.serverURL || ''
    const api = config?.routes?.api || '/api'

    async function fetchSlug() {
      try {
        const res = await fetch(
          `${serverURL}${api}/property-types/${propertyTypeId}`,
          { signal: abortController.signal }
        )
        if (!res.ok) return
        const doc = await res.json()
        if (doc && doc.slug) {
          slugCache.set(stringId, doc.slug)
          setSlugValue(doc.slug)
        }
      } catch (err) {
        // Ignore abort errors as they are normal behavior during rapid selection changes
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        console.error('Error fetching property type slug:', err)
      }
    }

    fetchSlug()

    return () => {
      abortController.abort()
    }
  }, [propertyTypeId, setSlugValue, config])

  return null
}
