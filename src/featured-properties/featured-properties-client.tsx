'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

import { Hand } from 'lucide-react'

import { useSoundEffects } from './hooks/use-sound-effects'
import { useVoiceNarrator, buildPropertyNarration } from './hooks/use-voice-narrator'
import { useGestureControl } from './hooks/use-gesture-control'

import { FullscreenGallery } from './components/fullscreen-gallery'
import { GesturePrompt } from './components/gesture-prompt'
import { CarouselSlide, type CarouselProperty } from './components/carousel-slide'
import { CarouselControls } from './components/carousel-controls'
import './featured-properties.css'

// ═══ FEATURE FLAGS ═══════════════════════════════════════════
// Set to false to completely hide and disable gesture control
const ENABLE_GESTURE_CONTROL = false
// ═════════════════════════════════════════════════════════════

export function FeaturedPropertiesClient({ properties }: { properties: CarouselProperty[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragDelta, setDragDelta] = useState(0)
  const dragStartXRef = useRef(0)
  const hasMovedRef = useRef(false)
  const isDownRef = useRef(false)
  const [soundOn, setSoundOn] = useState(true)
  const [voiceOn, setVoiceOn] = useState(false)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0)
  const [showGesturePrompt, setShowGesturePrompt] = useState(false)
  const [shaderActive, setShaderActive] = useState(false)
  const particlesRef = useRef<HTMLCanvasElement>(null)
  const shaderCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { playWhoosh, toggle: toggleSound, autoEnable: autoEnableSound } = useSoundEffects()
  const { speak, stop: stopVoice, toggle: toggleVoice, preload: preloadVoice } = useVoiceNarrator()
  const total = properties.length
  const activeProperty = properties[activeIndex]

  // Gesture control callbacks — keep fresh with current state
  const gestureCallbacks = useRef({
    onSwipeLeft: () => {},
    onSwipeRight: () => {},
    onSpread: () => {},
    onFist: () => {},
  })

  // Update callbacks on every render so they have fresh closure values
  useEffect(() => {
    gestureCallbacks.current = {
      onSwipeLeft: () => navigateRef.current(1),
      onSwipeRight: () => navigateRef.current(-1),
      onSpread: () => {
        if (!fullscreenOpen && activeProperty) {
          setFullscreenImageIndex(imageIndex)
          setFullscreenOpen(true)
        }
      },
      onFist: () => {
        setFullscreenOpen(false)
      },
    }
  })

  const {
    isActive: gestureActive,
    gestureStatus,
    permissionDenied: gesturePermDenied,
    toggle: toggleGesture,
  } = useGestureControl(gestureCallbacks.current)

  // Auto-cycle images for the active property
  useEffect(() => {
    if (!activeProperty?.images?.length || activeProperty.images.length <= 1) {
      return
    }
    setImageIndex(0)
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % activeProperty.images.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [activeIndex, activeProperty])

  // Shader transition effect
  const triggerShaderTransition = useCallback((direction: number) => {
    const canvas = shaderCanvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    setShaderActive(true)

    const startTime = performance.now()
    const duration = 500
    const cols = 20
    const rows = 12
    const cellW = canvas.width / cols
    const cellH = canvas.height / rows

    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Ripple pattern from direction
          const centerX = direction > 0 ? 0 : cols
          const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - rows / 2, 2))
          const maxDist = Math.sqrt(cols * cols + rows * rows)
          const delay = (dist / maxDist) * 0.6
          const cellProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)))

          // Dissolve alpha
          const alpha = cellProgress < 0.5 ? cellProgress * 0.35 : (1 - cellProgress) * 0.35

          if (alpha > 0.01) {
            // Gold shimmer
            const hue = 42 + Math.sin(dist * 0.5 + progress * 6) * 8
            ctx.fillStyle = `hsla(${hue}, 70%, 55%, ${alpha})`
            ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1)
          }
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setShaderActive(false)
      }
    }

    requestAnimationFrame(animate)
  }, [])

  // Navigate carousel with sound + shader
  const navigateRef = useRef((_direction: number) => {})
  const navigate = useCallback(
    (direction: number) => {
      if (isTransitioning) {
        return
      }
      setIsTransitioning(true)
      playWhoosh(direction > 0 ? 'right' : 'left')

      // Trigger shader transition
      triggerShaderTransition(direction)

      setActiveIndex((prev) => (prev + direction + total) % total)
      setTimeout(() => setIsTransitioning(false), 600)
    },
    [isTransitioning, total, playWhoosh, triggerShaderTransition],
  )
  navigateRef.current = navigate

  const [isInView, setIsInView] = useState(true)

  // Intersection Observer to detect if the gallery is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting)
          if (!entry.isIntersecting) {
            stopVoice()
          }
        })
      },
      { threshold: 0.1 }, // 10% visibility threshold
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [stopVoice])

  // Voice narration when property changes
  useEffect(() => {
    if (!activeProperty || !voiceOn || !isInView) return
    const narration = buildPropertyNarration(activeProperty)
    speak(narration)

    return () => stopVoice()
  }, [activeProperty, voiceOn, isInView, speak, stopVoice, preloadVoice])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (fullscreenOpen) {
        return
      }
      if (e.key === 'ArrowLeft') {
        navigate(-1)
      }
      if (e.key === 'ArrowRight') {
        navigate(1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [navigate, fullscreenOpen])

  // Drag/swipe support
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // If the user clicked/touched an interactive element, don't initiate dragging.
    // This allows native click/tap events on links and buttons to fire immediately on mobile
    // without being blocked or requiring a double-tap due to drag-induced re-renders.
    const target = e.target as HTMLElement
    if (target.closest('a, button, [role="button"]')) {
      return
    }

    isDownRef.current = true
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    dragStartXRef.current = x
    hasMovedRef.current = false
    setDragDelta(0)
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDownRef.current) return
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    const delta = x - dragStartXRef.current

    // Only set isDragging to true if the movement is significant (more than 8px)
    // This prevents a simple tap from causing React state updates/renders,
    // which breaks element click events on mobile touch devices.
    if (!hasMovedRef.current && Math.abs(delta) > 8) {
      hasMovedRef.current = true
      setIsDragging(true)
    }

    if (hasMovedRef.current) {
      setDragDelta(delta)
    }
  }

  const handleDragEnd = () => {
    if (!isDownRef.current) return
    isDownRef.current = false
    if (isDragging) {
      setIsDragging(false)
      if (Math.abs(dragDelta) > 80) {
        navigate(dragDelta > 0 ? -1 : 1)
      }
    }
    setDragDelta(0)
    hasMovedRef.current = false
  }

  // Auto-enable sound on first user interaction (bypasses browser autoplay policy)
  useEffect(() => {
    const unlock = () => {
      autoEnableSound()
      setSoundOn(true)
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
      document.removeEventListener('keydown', unlock)
    }
    document.addEventListener('click', unlock, { once: false })
    document.addEventListener('touchstart', unlock, { once: false })
    document.addEventListener('keydown', unlock, { once: false })
    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
      document.removeEventListener('keydown', unlock)
    }
  }, [autoEnableSound])

  // Toggle handlers
  const handleToggleSound = () => setSoundOn(toggleSound())
  const handleToggleVoice = () => setVoiceOn(toggleVoice())

  const handleGestureRequest = () => {
    setShowGesturePrompt(true)
  }

  const handleGestureEnable = () => {
    setShowGesturePrompt(false)
    toggleGesture()
  }

  // Open fullscreen
  const openFullscreen = (imgIndex: number) => {
    setFullscreenImageIndex(imgIndex)
    setFullscreenOpen(true)
  }

  // Gold particles canvas - Suspends automatically when out of viewport
  useEffect(() => {
    if (!isInView) return

    const canvas = particlesRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
      decay: number
    }[] = []
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.3 - 0.05,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.05,
        decay: Math.random() * 0.002 + 0.0005,
      })
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.alpha -= p.decay
        if (p.alpha <= 0) {
          p.x = Math.random() * canvas.offsetWidth
          p.y = canvas.offsetHeight + 10
          p.alpha = Math.random() * 0.4 + 0.05
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`
        ctx.fill()
      }
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [isInView])

  if (!properties.length) {
    return null
  }

  // Get side items for 3D effect
  const getOffset = (index: number) => {
    let diff = index - activeIndex
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total
    return diff
  }

  return (
    <section className="carousel3d-section bg-blue-fimac">
      <canvas ref={particlesRef} className="carousel3d-particles" />
      <canvas
        ref={shaderCanvasRef}
        className={`carousel3d-shader ${shaderActive ? 'carousel3d-shader--active' : ''}`}
      />
      <div className="carousel3d-glow carousel3d-glow--1" />
      <div className="carousel3d-glow carousel3d-glow--2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="carousel3d-title">Featured Properties</h2>
          <div className="carousel3d-divider" />
        </div>

        {/* 3D Carousel Stage */}
        <div
          ref={containerRef}
          className="carousel3d-stage h-[700px] md:h-[560px]"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="carousel3d-track">
            {properties.map((property, index) => {
              const offset = getOffset(index)
              const isCenter = offset === 0
              const isVisible = Math.abs(offset) <= 2

              if (!isVisible) return null

              return (
                <CarouselSlide
                  key={property.id}
                  property={property}
                  offset={offset}
                  isCenter={isCenter}
                  imageIndex={isCenter ? imageIndex : 0}
                  dragDelta={isDragging ? dragDelta * 0.3 : 0}
                  onOpenFullscreen={openFullscreen}
                  onNavigate={isCenter ? navigate : undefined}
                  onClick={() => {
                    if (!isCenter) navigate(offset)
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Gesture status bar */}
        {ENABLE_GESTURE_CONTROL && (gestureActive || gesturePermDenied) && gestureStatus && (
          <div
            className={`gesture-status-bar ${gesturePermDenied ? 'gesture-status-bar--error' : ''}`}
          >
            <Hand size={14} />
            <span>{gestureStatus}</span>
            {gesturePermDenied && (
              <button className="gesture-retry-btn" onClick={toggleGesture}>
                Retry
              </button>
            )}
          </div>
        )}

        <CarouselControls
          soundOn={soundOn}
          voiceOn={voiceOn}
          gestureActive={gestureActive}
          showGestureControl={ENABLE_GESTURE_CONTROL}
          totalProperties={total}
          activeIndex={activeIndex}
          isTransitioning={isTransitioning}
          onToggleSound={handleToggleSound}
          onToggleVoice={handleToggleVoice}
          onToggleGesture={toggleGesture}
          onRequestGesture={handleGestureRequest}
          onDotClick={(index) => {
            setIsTransitioning(true)
            const dir = index > activeIndex ? 1 : -1
            playWhoosh(dir > 0 ? 'right' : 'left')
            triggerShaderTransition(dir)
            setActiveIndex(index)
            setTimeout(() => setIsTransitioning(false), 600)
          }}
        />
      </div>

      {/* Fullscreen Gallery */}
      {fullscreenOpen && activeProperty && (
        <FullscreenGallery
          images={activeProperty.images}
          initialIndex={fullscreenImageIndex}
          propertyTitle={activeProperty.title}
          onClose={() => setFullscreenOpen(false)}
        />
      )}

      {/* Gesture Permission Prompt */}
      {ENABLE_GESTURE_CONTROL && showGesturePrompt && (
        <GesturePrompt
          onEnable={handleGestureEnable}
          onDismiss={() => setShowGesturePrompt(false)}
        />
      )}
    </section>
  )
}
