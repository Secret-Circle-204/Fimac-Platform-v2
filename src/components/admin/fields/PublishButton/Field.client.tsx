'use client'

import React, { useState, useCallback } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

// ── Types ──────────────────────────────────────────────────────────────────

interface PublishResponse {
  success: boolean
  propertyId: string
  alreadyPublished: boolean
  error?: string
}

// ── Helper: Extract ID from relationship value ─────────────────────────────

function extractId(
  value: unknown,
): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return null
}

// ── Component ──────────────────────────────────────────────────────────────

export function PublishButtonClient() {
  const { id, data, setData } = useDocumentInfo()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const publishedPropertyId = extractId(data?.publishedProperty)
  const isPublished = publishedPropertyId !== null

  const handlePublish = useCallback(async () => {
    if (!id || isLoading) return

    setShowConfirm(false)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/seller-requests/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const result: PublishResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? 'Publishing failed')
      }

      // Update local form state immediately
      if (data) {
        setData({
          ...data,
          status: 'listed',
          publishedProperty: result.propertyId,
        })
      }

      // Refresh server-rendered data
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [id, isLoading, data, setData, router])

  // ── If no document ID, this is a create view — don't render ────────────
  if (!id) return null

  // ── Published State ────────────────────────────────────────────────────
  if (isPublished) {
    return (
      <div
        style={{
          padding: '16px',
          borderRadius: '8px',
          background: 'var(--theme-success-100, #dcfce7)',
          border: '1px solid var(--theme-success-500, #22c55e)',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '18px' }}>✓</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '14px',
              color: 'var(--theme-success-700, #15803d)',
            }}
          >
            Published Live
          </span>
        </div>
        <a
          href={`/admin/collections/properties/${publishedPropertyId}`}
          style={{
            display: 'inline-block',
            fontSize: '13px',
            color: 'var(--theme-success-700, #15803d)',
            textDecoration: 'underline',
            fontWeight: 500,
          }}
        >
          View Property →
        </a>
      </div>
    )
  }

  // ── Unpublished State ──────────────────────────────────────────────────
  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: '12px',
            borderRadius: '6px',
            background: 'var(--theme-error-100, #fef2f2)',
            border: '1px solid var(--theme-error-500, #ef4444)',
            marginBottom: '12px',
            fontSize: '13px',
            color: 'var(--theme-error-700, #b91c1c)',
          }}
        >
          {error}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            background: 'var(--theme-warning-100, #fefce8)',
            border: '1px solid var(--theme-warning-500, #eab308)',
            marginBottom: '12px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--theme-warning-700, #a16207)',
              marginBottom: '12px',
            }}
          >
            This will create a live property listing from this request. Continue?
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isLoading}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                background: 'var(--theme-success-500, #22c55e)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Publishing…' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isLoading}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid var(--theme-elevation-400, #d4d4d8)',
                fontWeight: 500,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Publish Button */}
      {!showConfirm && (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            transition: 'opacity 150ms ease',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
          }}
        >
          {isLoading ? 'Publishing…' : '🚀 Publish Listing'}
        </button>
      )}
    </div>
  )
}
