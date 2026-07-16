'use client'

import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { buildPropertyUrl } from '@/repository/property/generate-url'
import { ExternalLink } from 'lucide-react'

export function ViewPropertyButtonClient() {
  const { id, data } = useDocumentInfo()

  const hasId = id !== undefined && id !== null && id !== ''

  // Build the frontend URL if ID exists
  let url = '#'
  if (hasId) {
    const address = data?.location?.address || { street: data?.street || '' }
    url = buildPropertyUrl(id, address)
  }

  return (
    <div className="view-property-btn-container">
      {hasId ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="view-property-btn"
        >
          <ExternalLink />
          View Property
        </a>
      ) : (
        <a
          href="#"
          className="view-property-btn view-property-btn--disabled"
          onClick={(e) => e.preventDefault()}
          title="Please save the property first to enable preview"
        >
          <ExternalLink />
          Save Property to View
        </a>
      )}
    </div>
  )
}
