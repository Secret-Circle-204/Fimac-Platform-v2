"use client"

import { useEffect, useRef, useState } from "react"

function _getCountryName(code: string): string {
  const countries: Record<string, string> = {
    EG: "Egypt",
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    IT: "Italy",
    ES: "Spain",
    AE: "United Arab Emirates",
    SA: "Saudi Arabia",
    KW: "Kuwait",
    QA: "Qatar",
    BH: "Bahrain",
    OM: "Oman",
    JO: "Jordan",
    LB: "Lebanon",
  }
  return countries[code.toUpperCase()] || code
}

interface ViewTrackerProps {
  propertyId: string | number
  ownerId?: string | number // Add owner ID to check
}

export function ViewTracker({ propertyId, ownerId }: ViewTrackerProps) {
  const hasTracked = useRef(false)
  const [shouldTrack, setShouldTrack] = useState<boolean | null>(null) // null = checking
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false) // NEW: flag to indicate user check is complete

  useEffect(() => {
    // Check if current user is the owner or admin
    const checkUser = async () => {
      // 🤖 Immediate crawler/bot detection in browser
      if (typeof window !== "undefined" && window.navigator) {
        const isBot = /bot|googlebot|bingbot|yandexbot|baiduspider|crawler|spider|robot|crawling|lighthouse/i.test(navigator.userAgent)
        if (isBot) {
          console.log("🤖 Crawler/Bot detected on client - skipping tracking")
          setShouldTrack(false)
          setIsReady(true)
          return
        }
      }

      try {
        const response = await fetch("/api/current-user")
        if (response.ok) {
          const user = await response.json()
          
          console.log("👤 Current user check:", user)
          console.log("🏠 Property owner ID:", ownerId)
          
          if (!user.authenticated) {
            // Not logged in - track as anonymous visitor
            console.log("👻 Anonymous visitor - tracking without userId")
            setCurrentUserId(null)
            setShouldTrack(true)
            return
          }

          // Don't track if:
          // 1. User is an admin (collection === "users")
          // 2. User is the property owner (seller ID matches ownerId)
          const isOwner = user.id && ownerId && user.id.toString() === ownerId.toString() && user.collection === "sellers"
          const isAdmin = user.collection === "users"

          if (isAdmin || isOwner) {
            console.log(`❌ NOT tracking - User is admin:${isAdmin} or property owner:${isOwner}`)
            setShouldTrack(false)
            setCurrentUserId(null)
          } else {
            // Store userId for tracking (helps distinguish different logged-in visitors)
            console.log("✅ WILL track - User is a visitor, userId:", user.id)
            setCurrentUserId(user.id || null)
            setShouldTrack(true)
          }
        } else {
          // Not logged in - track as anonymous visitor
          console.log("👻 Anonymous visitor - tracking without userId")
          setCurrentUserId(null)
          setShouldTrack(true)
        }
      } catch (_err) {
        // If can't check user, proceed with tracking
        console.log("⚠️ Unable to verify user, tracking view anyway")
        setCurrentUserId(null)
        setShouldTrack(true)
      } finally {
        // Mark as ready regardless of outcome
        setIsReady(true)
      }
    }

    checkUser()
  }, [ownerId])

  useEffect(() => {
    // Wait until user check is complete
    if (!isReady) {
      console.log("⏳ Waiting for user check to complete...")
      return
    }
    
    // Track view only once per page load
    if (hasTracked.current || !shouldTrack) {
      console.log("⏭️ Skipping tracking:", { hasTracked: hasTracked.current, shouldTrack })
      return
    }
    hasTracked.current = true

    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem("fimac_session_id")
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
      sessionStorage.setItem("fimac_session_id", sessionId)
    }

    const trackAndLocate = async () => {
      // ⚡ Performance: Client-side third-party IP geocoding is removed to prevent browser blocks & rate limits.
      // Geolocation is resolved securely on the server via CDN geolocation headers / background fallback.
      const clientLocation = null

      console.log("📊 Tracking view with data:", {
        propertyId: propertyId.toString(),
        sessionId,
        userId: currentUserId,
        clientLocation,
      })

      try {
        const response = await fetch("/api/track-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId: propertyId.toString(),
            sessionId,
            userId: currentUserId,
            clientLocation,
          }),
        })
        if (!response.ok) {
          const text = await response.text()
          console.warn(`⚠️ Failed to track view: ${response.status} (${text})`)
          return
        }
        const data = await response.json()
        console.log("✅ View tracked successfully:", data)
        if (data.success && typeof data.views === "number") {
          window.dispatchEvent(
            new CustomEvent("property-view-tracked", {
              detail: { propertyId: propertyId.toString(), views: data.views },
            })
          )
        }
      } catch (err) {
        console.error("❌ Failed to track view:", err)
      }
    }

    trackAndLocate()
  }, [propertyId, shouldTrack, currentUserId, isReady])

  return null // This component doesn't render anything
}
