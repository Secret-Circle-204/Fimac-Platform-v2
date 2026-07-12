'use client'

import React, { useEffect } from 'react'
import { useField, useConfig } from '@payloadcms/ui'

export function PropertyTypeWatcherClient() {
  const { value: propertyType } = useField<any>({ path: 'propertyType' })
  const { setValue: setSlugValue } = useField<string>({ path: 'propertyTypeSlug' })
  const { config } = useConfig()

  const propertyTypeId =
    propertyType === null || propertyType === undefined
      ? null
      : typeof propertyType === 'object' && 'id' in propertyType
      ? propertyType.id
      : propertyType

  useEffect(() => {
    if (!propertyTypeId) {
      setSlugValue('')
      return
    }

    let active = true
    const serverURL = config?.serverURL || ''
    const api = config?.routes?.api || '/api'

    async function fetchSlug() {
      try {
        const res = await fetch(`${serverURL}${api}/property-types/${propertyTypeId}`)
        if (!res.ok) return
        const doc = await res.json()
        if (active && doc && doc.slug) {
          setSlugValue(doc.slug)
        }
      } catch (err) {
        console.error('Error fetching property type slug:', err)
      }
    }

    fetchSlug()

    return () => {
      active = false
    }
  }, [propertyTypeId, setSlugValue, config])

  return null
}
