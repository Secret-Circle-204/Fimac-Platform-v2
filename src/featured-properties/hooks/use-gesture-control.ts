"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Landmark = { x: number; y: number; z: number }

interface HandResults {
  multiHandLandmarks?: Landmark[][]
}

interface HandsInstance {
  setOptions: (opts: Record<string, unknown>) => void
  onResults: (cb: (results: HandResults) => void) => void
  initialize: () => Promise<void>
  send: (input: { image: HTMLVideoElement }) => Promise<void>
  close: () => void
}

type GestureCallback = {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onSpread: () => void // spread fingers → open gallery
  onFist: () => void // close fist → close gallery
}

type HandState = "none" | "neutral" | "spread" | "fist" | "swiping"

export function useGestureControl(callbacks: GestureCallback) {
  const [isActive, setIsActive] = useState(false)
  const [gestureStatus, setGestureStatus] = useState<string>("")
  const [permissionDenied, setPermissionDenied] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const handsRef = useRef<HandsInstance | null>(null)
  const isProcessingRef = useRef(false)
  const activeRef = useRef(false)

  // State machine — only fire on transitions
  const handStateRef = useRef<HandState>("none")
  const stateChangeTimeRef = useRef<number>(0)

  // Swipe tracking — index finger tip (landmark 8) position
  const fingerHistoryRef = useRef<{ x: number; time: number }[]>([])
  const SWIPE_WINDOW = 400
  const SWIPE_THRESHOLD = 0.06
  const SWIPE_COOLDOWN = 350

  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  const cleanupVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.remove()
      videoRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      setPermissionDenied(false)
      setGestureStatus("📷 Requesting camera...")

      if (!navigator.mediaDevices?.getUserMedia) {
        setGestureStatus("❌ Camera not supported")
        setPermissionDenied(true)
        return
      }

      // Hidden video element (needed for MediaPipe, but invisible to user)
      const video = document.createElement("video")
      video.style.cssText = `
        position:fixed; bottom:0; right:0; width:1px; height:1px;
        opacity:0; pointer-events:none; z-index:-1;
      `
      video.setAttribute("playsinline", "")
      video.setAttribute("autoplay", "")
      video.muted = true
      document.body.appendChild(video)
      videoRef.current = video

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
      } catch (camErr: unknown) {
        const err = camErr instanceof DOMException ? camErr : new Error("Camera error")
        console.error("Camera Error →", err.name, err.message)
        cleanupVideo()
        setGestureStatus(
          err.name === "NotAllowedError"
            ? "🔒 Camera blocked — check browser & system permissions"
            : `❌ ${err.name}: ${err.message}`,
        )
        setPermissionDenied(true)
        setIsActive(false)
        return
      }

      streamRef.current = stream
      video.srcObject = stream
      await video.play()

      setGestureStatus("⏳ Loading AI model...")
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.min.js")

      // @ts-expect-error MediaPipe Hands loaded via CDN script, not available in TS types
      const Hands = window.Hands
      if (!Hands) {
        setGestureStatus("❌ Model load failed")
        return
      }

      const hands = new Hands({
        locateFile: (f: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${f}`,
      })
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.4,
      })

      hands.onResults((results: HandResults) => {
        isProcessingRef.current = false
        const now = Date.now()

        if (!results.multiHandLandmarks?.length) {
          if (handStateRef.current !== "none") {
            handStateRef.current = "none"
            setGestureStatus("🖐️ Show your hand...")
          }
          fingerHistoryRef.current = []
          return
        }

        const lm = results.multiHandLandmarks[0]

        // === 1. SWIPE: Track index fingertip (landmark 8) ===
        const fingerX = lm[8].x
        fingerHistoryRef.current.push({ x: fingerX, time: now })
        fingerHistoryRef.current = fingerHistoryRef.current.filter(
          (p) => now - p.time < SWIPE_WINDOW,
        )

        if (fingerHistoryRef.current.length >= 3) {
          const oldest = fingerHistoryRef.current[0]
          const delta = fingerX - oldest.x

          if (
            Math.abs(delta) > SWIPE_THRESHOLD &&
            now - stateChangeTimeRef.current > SWIPE_COOLDOWN
          ) {
            stateChangeTimeRef.current = now
            handStateRef.current = "swiping"
            fingerHistoryRef.current = fingerHistoryRef.current.slice(-1)

            // Mirrored camera
            if (delta < 0) {
              console.log("👉 Swipe RIGHT, Δ:", delta.toFixed(3))
              setGestureStatus("👉 →")
              callbacksRef.current.onSwipeRight()
            } else {
              console.log("👈 Swipe LEFT, Δ:", delta.toFixed(3))
              setGestureStatus("👈 ←")
              callbacksRef.current.onSwipeLeft()
            }
            return
          }
        }

        // === 2. SPREAD vs FIST: Finger state detection ===
        const currentPose = classifyHand(lm)

        // Only fire on STATE TRANSITION (not continuously)
        if (currentPose !== handStateRef.current && now - stateChangeTimeRef.current > 600) {
          const prevState = handStateRef.current

          // SPREAD: must come from neutral/swiping (not from none/fist directly)
          if (currentPose === "spread" && (prevState === "neutral" || prevState === "swiping")) {
            handStateRef.current = "spread"
            stateChangeTimeRef.current = now
            setGestureStatus("🖐️ Spread → Open!")
            console.log("🖐️ SPREAD → open gallery (from", prevState, ")")
            callbacksRef.current.onSpread()
            return
          }

          // FIST: can come from any state
          if (currentPose === "fist") {
            handStateRef.current = "fist"
            stateChangeTimeRef.current = now
            setGestureStatus("✊ Fist → Close!")
            console.log("✊ FIST → close gallery (from", prevState, ")")
            callbacksRef.current.onFist()
            return
          }

          // Update state silently for neutral
          handStateRef.current = currentPose
        }

        // Show live status
        if (now - stateChangeTimeRef.current > 600) {
          const ext = countExtended(lm)
          setGestureStatus(`✋ Ready — wave to navigate (fingers: ${ext})`)
        }
      })

      setGestureStatus("⏳ Initializing (~5s first time)...")
      await hands.initialize()

      handsRef.current = hands
      activeRef.current = true
      setIsActive(true)
      setGestureStatus("✅ Active! Swipe or spread/fist 🖐️")

      // Frame loop
      const processFrame = async () => {
        if (!activeRef.current || !video || video.readyState < 2) {
          if (activeRef.current) animFrameRef.current = requestAnimationFrame(processFrame)
          return
        }
        if (!isProcessingRef.current) {
          isProcessingRef.current = true
          try {
            await hands.send({ image: video })
          } catch {
            isProcessingRef.current = false
          }
        }
        if (activeRef.current) animFrameRef.current = requestAnimationFrame(processFrame)
      }
      animFrameRef.current = requestAnimationFrame(processFrame)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected gesture error occurred"
      console.error("Gesture error:", err)
      cleanupVideo()
      setGestureStatus(`❌ ${message}`)
      setIsActive(false)
    }
  }, [cleanupVideo])

  const stopCamera = useCallback(() => {
    activeRef.current = false
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (handsRef.current) {
      try {
        handsRef.current.close()
      } catch {}
    }
    handsRef.current = null
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    cleanupVideo()
    setIsActive(false)
    setGestureStatus("")
    setPermissionDenied(false)
    handStateRef.current = "none"
    fingerHistoryRef.current = []
  }, [cleanupVideo])

  const toggle = useCallback(() => {
    if (isActive) {
      stopCamera()
    } else {
      startCamera()
    }
  }, [isActive, startCamera, stopCamera])

  useEffect(() => () => stopCamera(), [stopCamera])

  return { isActive, gestureStatus, permissionDenied, toggle }
}

// ──── Count Extended Fingers ────
function countExtended(lm: Landmark[]): number {
  const tips = [8, 12, 16, 20]
  const pips = [6, 10, 14, 18]
  let ext = 0
  for (let i = 0; i < tips.length; i++) {
    if (lm[tips[i]].y < lm[pips[i]].y) ext++
  }
  return ext
}

// ──── Hand Classification ────
function classifyHand(lm: Landmark[]): HandState {
  const extended = countExtended(lm)

  // Thumb
  const thumbOut = Math.abs(lm[4].x - lm[0].x) > Math.abs(lm[3].x - lm[0].x)

  // FIST: 0-1 fingers extended (very lenient — thumb doesn't matter)
  if (extended <= 1 && !thumbOut) return "fist"
  if (extended === 0) return "fist" // definitely a fist even with thumb out

  // SPREAD: all 4 fingers out + thumb out + fingers FAR apart
  if (extended >= 4 && thumbOut) {
    // Measure horizontal spread between index tip and pinky tip
    const hSpread = Math.abs(lm[8].x - lm[20].x)
    // Also check vertical spread
    const vSpread = Math.abs(lm[8].y - lm[20].y)
    const totalSpread = hSpread + vSpread
    // Require wide spread (normal open hand is ~0.20-0.25, active spread is 0.30+)
    if (totalSpread > 0.32) return "spread"
  }

  return "neutral"
}

// ──── CDN Script Loader ────
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement("script")
    s.src = src
    s.crossOrigin = "anonymous"
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("Script load failed"))
    document.head.appendChild(s)
  })
}
