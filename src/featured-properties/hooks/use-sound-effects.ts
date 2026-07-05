"use client"

import { useCallback, useEffect, useRef } from "react"

export function useSoundEffects() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const enabledRef = useRef(false)

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioCtxRef.current
  }, [])

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close()
        } catch (e) {
          console.warn("Failed to close AudioContext:", e)
        }
        audioCtxRef.current = null
      }
    }
  }, [])

  const playWhoosh = useCallback(
    (direction: "left" | "right" = "right") => {
      if (!enabledRef.current) return
      try {
        const ctx = getCtx()
        if (ctx.state === "suspended") ctx.resume()

        const now = ctx.currentTime
        const _dur = 0.35

        // === Premium Tactile UI Sound ===
        // 1. The "Tick" (High frequency transient for crispness)
        const tickOsc = ctx.createOscillator()
        tickOsc.type = "sine"
        tickOsc.frequency.setValueAtTime(1200, now)
        tickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.03)

        const tickGain = ctx.createGain()
        tickGain.gain.setValueAtTime(0, now)
        // Increased from 0.15 to 0.45 for a louder tick
        tickGain.gain.linearRampToValueAtTime(0.45, now + 0.005)
        tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

        // 2. The "Thump" (Low frequency body for feeling)
        const thumpOsc = ctx.createOscillator()
        thumpOsc.type = "sine"
        // Slight pitch difference depending on direction for spatial feel
        const startFreq = direction === "right" ? 180 : 160
        thumpOsc.frequency.setValueAtTime(startFreq, now)
        thumpOsc.frequency.exponentialRampToValueAtTime(40, now + 0.08)

        const thumpGain = ctx.createGain()
        thumpGain.gain.setValueAtTime(0, now)
        // Increased from 0.3 to 0.8 for a louder thump
        thumpGain.gain.linearRampToValueAtTime(0.8, now + 0.01)
        thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

        // 3. Subtle spatial panning
        const panner = ctx.createStereoPanner()
        panner.pan.setValueAtTime(direction === "right" ? 0.4 : -0.4, now)

        // Routing
        tickOsc.connect(tickGain)
        thumpOsc.connect(thumpGain)

        tickGain.connect(panner)
        thumpGain.connect(panner)

        panner.connect(ctx.destination)

        // Play
        tickOsc.start(now)
        thumpOsc.start(now)
        tickOsc.stop(now + 0.04)
        thumpOsc.stop(now + 0.09)
      } catch {}
    },
    [getCtx],
  )

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current
    if (enabledRef.current) {
      const ctx = getCtx()
      if (ctx.state === "suspended") ctx.resume()
    }
    return enabledRef.current
  }, [getCtx])

  const autoEnable = useCallback(() => {
    if (!enabledRef.current) {
      enabledRef.current = true
      const ctx = getCtx()
      if (ctx.state === "suspended") ctx.resume()
    }
  }, [getCtx])

  return { playWhoosh, toggle, autoEnable, isEnabled: () => enabledRef.current }
}
