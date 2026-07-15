'use client'

import { useEffect, useRef } from 'react'
import { useField, useConfig } from '@payloadcms/ui'

// Global client-side cache for property type slugs to avoid redundant network requests
const slugCache = new Map<string, string>()

export function PropertyTypeWatcherClient() {
  const { value: propertyTypeVal } = useField<unknown>({ path: 'propertyType' })
  const { value: property_typeVal } = useField<unknown>({ path: 'property_type' })
  const propertyType = propertyTypeVal !== undefined ? propertyTypeVal : property_typeVal

  const { setValue: setSlugValue } = useField<string>({ path: 'propertyTypeSlug' })

  const categoryField = useField<string>({ path: 'category' })
  const setCategoryValue = categoryField?.setValue

  const { config } = useConfig()

  // Safely extract the ID from the relationship field value
  const propertyTypeId =
    propertyType === null || propertyType === undefined
      ? null
      : typeof propertyType === 'object' && propertyType !== null && 'id' in propertyType
        ? (propertyType as { id: unknown }).id
        : typeof propertyType === 'object' && propertyType !== null && 'value' in propertyType
          ? (propertyType as { value: unknown }).value
          : propertyType

  // Keep track of the last resolved ID to prevent redundant executions
  const lastIdRef = useRef<unknown>(undefined)

  useEffect(() => {
    // If the ID hasn't actually changed, return immediately to preserve form state stability
    if (propertyTypeId === lastIdRef.current) {
      return
    }

    lastIdRef.current = propertyTypeId

    if (!propertyTypeId) {
      setSlugValue('')
      if (setCategoryValue) setCategoryValue('')
      return
    }

    // Check cache first to avoid redundant network requests
    const stringId = String(propertyTypeId)
    if (slugCache.has(stringId)) {
      const cached = slugCache.get(stringId)
      if (cached) {
        const [slug, catSlug] = cached.split('|')
        setSlugValue(slug || '')
        if (setCategoryValue && catSlug) setCategoryValue(catSlug)
      }
      return
    }

    // Set up AbortController for request cancellation
    const abortController = new AbortController()
    const serverURL = config?.serverURL || ''
    const api = config?.routes?.api || '/api'

    async function fetchSlug() {
      try {
        const res = await fetch(`${serverURL}${api}/property-types/${propertyTypeId}`, {
          signal: abortController.signal,
        })
        if (!res.ok) return
        const doc = await res.json()
        if (doc && doc.slug) {
          const catSlug = doc.category && typeof doc.category === 'object' ? doc.category.slug : ''
          slugCache.set(stringId, `${doc.slug}|${catSlug}`)
          setSlugValue(doc.slug)
          if (setCategoryValue && catSlug) {
            setCategoryValue(catSlug)
          }
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
  }, [propertyTypeId, setSlugValue, setCategoryValue, config])

  return null
}
