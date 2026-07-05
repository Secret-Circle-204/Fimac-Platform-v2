"use client"

import Image from "next/image"
import { useEffect, useCallback, useState } from "react"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"

type FullscreenImage = { url: string; alt: string }

export function FullscreenGallery({
  images,
  initialIndex,
  propertyTitle,
  onClose,
}: {
  images: FullscreenImage[]
  initialIndex: number
  propertyTitle: string
  onClose: () => void
}) {
  // Guard against empty image array to prevent out of bounds
  const safeInitialIndex =
    images && images.length > 0 ? Math.min(Math.max(initialIndex, 0), images.length - 1) : 0

  const [currentIndex, setCurrentIndex] = useState(safeInitialIndex)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isZoomed, setIsZoomed] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setIsZoomed(false)
  }, [])

  const next = useCallback(
    () => goTo((currentIndex + 1) % (images?.length || 1)),
    [currentIndex, images?.length, goTo],
  )
  const prev = useCallback(
    () => goTo((currentIndex - 1 + (images?.length || 1)) % (images?.length || 1)),
    [currentIndex, images?.length, goTo],
  )

  const toggleZoom = useCallback(() => {
    if (isZoomed) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
      setIsZoomed(false)
    } else {
      setZoom(2)
      setIsZoomed(true)
    }
  }, [isZoomed])

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
      if (e.key === "ArrowLeft") {
        prev()
      }
      if (e.key === "ArrowRight") {
        next()
      }
      if (e.key === " ") {
        e.preventDefault()
        toggleZoom()
      }
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [onClose, prev, next, toggleZoom])

  if (!images || images.length === 0) {
    return null
  }

  const current = images[currentIndex]

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isZoomed) {
      return
    }
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart || !isZoomed) {
      return
    }
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => setDragStart(null)

  return (
    <div className="fullscreen-overlay" onClick={onClose}>
      {/* Backdrop */}
      <div className="fullscreen-backdrop" />

      {/* Close button */}
      <button className="fullscreen-close" onClick={onClose} aria-label="Close gallery">
        <X size={24} />
      </button>

      {/* Title */}
      <div className="fullscreen-title">{propertyTitle}</div>

      {/* Counter */}
      <div className="fullscreen-counter">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main image */}
      <div
        className="fullscreen-main"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isZoomed ? "grab" : "default" }}
      >
        <div
          className="fullscreen-image-wrapper"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: dragStart ? "none" : "transform 0.3s ease",
          }}
        >
          <Image
            src={current.url}
            alt={current.alt}
            fill
            className="fullscreen-image"
            sizes="100vw"
            priority
          />
        </div>
      </div>

      {/* Zoom button */}
      <button
        className="fullscreen-zoom"
        onClick={(e) => {
          e.stopPropagation()
          toggleZoom()
        }}
        aria-label={isZoomed ? "Zoom out" : "Zoom in"}
      >
        {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
      </button>

      {/* Navigation arrows */}
      <button
        className="fullscreen-nav fullscreen-nav--prev"
        onClick={(e) => {
          e.stopPropagation()
          prev()
        }}
        aria-label="Previous image"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        className="fullscreen-nav fullscreen-nav--next"
        onClick={(e) => {
          e.stopPropagation()
          next()
        }}
        aria-label="Next image"
      >
        <ChevronRight size={32} />
      </button>

      {/* Thumbnail strip */}
      <div className="fullscreen-thumbs" onClick={(e) => e.stopPropagation()}>
        {images.map((img, i) => (
          <button
            key={i}
            className={`fullscreen-thumb ${i === currentIndex ? "fullscreen-thumb--active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`View image ${i + 1}`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              width={80}
              height={56}
              className="fullscreen-thumb-img"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
