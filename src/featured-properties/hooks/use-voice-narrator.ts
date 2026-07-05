"use client"

import { useCallback, useEffect, useRef } from "react"

// Audio cache — stores generated audio blobs so same text plays instantly
const audioCache = new Map<string, string>() // text hash → blob URL
const cacheKeys: string[] = []
const MAX_CACHE_SIZE = 15

function setCachedAudio(key: string, url: string) {
  if (audioCache.has(key)) return

  if (cacheKeys.length >= MAX_CACHE_SIZE) {
    const oldestKey = cacheKeys.shift()
    if (oldestKey) {
      const oldestUrl = audioCache.get(oldestKey)
      if (oldestUrl) {
        try {
          URL.revokeObjectURL(oldestUrl)
        } catch (e) {
          console.warn("Failed to revoke object URL:", e)
        }
      }
      audioCache.delete(oldestKey)
    }
  }

  audioCache.set(key, url)
  cacheKeys.push(key)
}

function hashText(text: string): string {
  // Simple hash for cache key
  let h = 0
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) - h + text.charCodeAt(i)) | 0
  }
  return h.toString(36)
}

// Consistent voice per property (based on text hash)
const VOICES = ["en-GB-SoniaNeural", "en-US-AriaNeural", "en-US-JennyNeural"]
function pickVoice(text: string): string {
  const h = Math.abs(hashText(text).charCodeAt(0))
  return VOICES[h % VOICES.length]
}

export function useVoiceNarrator() {
  const isSpeakingRef = useRef(false)
  const enabledRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Fetch audio from API (or cache)
  const fetchAudio = useCallback(
    async (text: string, signal?: AbortSignal): Promise<string | null> => {
      const key = hashText(text)

      // Check cache first — instant!
      if (audioCache.has(key)) {
        return audioCache.get(key)!
      }

      try {
        const voice = pickVoice(text)
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice }),
          signal,
        })

        if (!response.ok) return null

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setCachedAudio(key, url)
        return url
      } catch {
        return null
      }
    },
    [],
  )

  // Fallback: Web Speech API
  const speakFallback = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.92
    utterance.pitch = 1.05
    utterance.volume = 0.85
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Microsoft")),
    )
    if (preferred) utterance.voice = preferred
    utterance.onstart = () => {
      isSpeakingRef.current = true
    }
    utterance.onend = () => {
      isSpeakingRef.current = false
    }
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    abortRef.current?.abort()
    abortRef.current = null
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    window.speechSynthesis?.cancel()
    isSpeakingRef.current = false
  }, [])

  // Play audio from URL
  const playAudioUrl = useCallback((url: string, text: string) => {
    // Stop current
    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(url)
    audioRef.current = audio
    audio.volume = 0.85

    audio.onplay = () => {
      isSpeakingRef.current = true
    }
    audio.onended = () => {
      isSpeakingRef.current = false
    }
    audio.onerror = () => {
      isSpeakingRef.current = false
      speakFallback(text)
    }

    audio.play().catch(() => speakFallback(text))
  }, [speakFallback])

  // Main speak function
  const speak = useCallback(
    (text: string) => {
      if (!enabledRef.current) return
      stop()

      timeoutRef.current = setTimeout(async () => {
        const url = await fetchAudio(text)
        if (url && enabledRef.current) {
          playAudioUrl(url, text)
        } else if (enabledRef.current) {
          speakFallback(text)
        }
      }, 500)
    },
    [fetchAudio, playAudioUrl, speakFallback, stop],
  )

  // Pre-load audio for upcoming properties sequentially to prevent API timeouts
  const preloadQueue = useRef<string[]>([])
  const isPreloading = useRef(false)

  const processPreloadQueue = useCallback(async () => {
    if (isPreloading.current || preloadQueue.current.length === 0 || !enabledRef.current) return
    isPreloading.current = true

    while (preloadQueue.current.length > 0 && enabledRef.current) {
      const text = preloadQueue.current.shift()!
      const key = hashText(text)
      if (!audioCache.has(key)) {
        await new Promise((res) => setTimeout(res, 2000))
        if (enabledRef.current) {
          await fetchAudio(text).catch(() => {})
        }
      }
    }
    isPreloading.current = false
  }, [fetchAudio])

  const preload = useCallback(
    (texts: string[]) => {
      if (!enabledRef.current) return

      texts.forEach((text) => {
        if (!preloadQueue.current.includes(text) && !audioCache.has(hashText(text))) {
          preloadQueue.current.push(text)
        }
      })
      processPreloadQueue()
    },
    [processPreloadQueue],
  )

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current
    if (!enabledRef.current) stop()
    return enabledRef.current
  }, [stop])

  useEffect(() => {
    return () => {
      stop()
      preloadQueue.current = []
    }
  }, [stop])

  return { speak, stop, toggle, preload, isEnabled: () => enabledRef.current }
}

export function buildPropertyNarration(property: {
  id: string | number
  title: string
  price: string
  address: { city?: string | null; state_abbr?: string | null }
  details: { bedrooms: number; bathrooms: number; sqM: string }
}): string {
  // Deterministic picker based on property string to ensure caching works perfectly
  const seedStr = String(property.id || property.title)
  const seed = seedStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const pick = <T>(arr: T[], offset: number = 0) => arr[(seed + offset) % arr.length]
  const sentences: string[] = []

  // Opening — warm and inviting
  sentences.push(
    pick(
      [
        `Welcome to ${property.title}.`,
        `Presenting ${property.title}.`,
        `Allow me to introduce ${property.title}.`,
        `Discover the elegance of ${property.title}.`,
        `Step into luxury with ${property.title}.`,
      ],
      1,
    ),
  )

  // Price — professional
  sentences.push(
    pick(
      [
        `This exceptional property is offered at ${property.price}.`,
        `Listed at ${property.price}.`,
        `Available at an investment of ${property.price}.`,
        `Priced at ${property.price}, it represents outstanding value.`,
      ],
      2,
    ),
  )

  // Location
  if (property.address.city) {
    const loc = property.address.state_abbr
      ? `${property.address.city}, ${property.address.state_abbr}`
      : property.address.city
    sentences.push(
      pick(
        [
          `Nestled in the prestigious area of ${loc}.`,
          `Located in the heart of ${loc}.`,
          `Situated in the sought-after neighborhood of ${loc}.`,
          `Perfectly positioned in ${loc}.`,
        ],
        3,
      ),
    )
  }

  // Features — descriptive
  const { bedrooms, bathrooms, sqM } = property.details
  sentences.push(
    pick(
      [
        `It features ${bedrooms} spacious bedrooms, ${bathrooms} elegant bathrooms, and ${sqM} square meters of refined living space.`,
        `With ${bedrooms} bedrooms, ${bathrooms} bathrooms, and a generous ${sqM} square meters, this home offers unparalleled comfort.`,
        `Spanning ${sqM} square meters with ${bedrooms} bedrooms and ${bathrooms} beautifully appointed bathrooms.`,
        `The residence boasts ${bedrooms} bedrooms, ${bathrooms} bathrooms, across ${sqM} square meters of sophisticated design.`,
      ],
      4,
    ),
  )

  // Closing — memorable
  sentences.push(
    pick(
      [
        "A truly remarkable property awaiting its next chapter.",
        "An extraordinary opportunity in luxury living.",
        "This could be where your story begins.",
        "Experience the pinnacle of modern elegance.",
        "A rare find that defines exceptional living.",
      ],
      5,
    ),
  )

  return sentences.join(" ")
}
