'use client'

import { useProperty } from '@/components/providers/property'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Pause, X, Images } from 'lucide-react'

export const PropertyGallery = () => {
  const property = useProperty()
  const images = property.photos || []

  const [isOpen, setIsOpen] = useState(false)
  const [[page, direction], setPage] = useState([0, 0])
  const [isPlaying, setIsPlaying] = useState(false)
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)

  // Handlers for paginating slides
  const paginate = useCallback(
    (newDirection: number) => {
      setPage((prev) => {
        const nextIndex = (prev[0] + newDirection + images.length) % images.length
        return [nextIndex, newDirection]
      })
    },
    [images.length],
  )

  // Center active thumbnail in the horizontal scroll list
  useEffect(() => {
    if (!isOpen || !thumbnailContainerRef.current) return
    const container = thumbnailContainerRef.current
    const activeThumb = container.querySelector(`[data-thumb-index="${page}"]`) as HTMLElement
    if (activeThumb) {
      const containerWidth = container.offsetWidth
      const thumbOffsetLeft = activeThumb.offsetLeft
      const thumbWidth = activeThumb.offsetWidth
      container.scrollTo({
        left: thumbOffsetLeft - containerWidth / 2 + thumbWidth / 2,
        behavior: 'smooth',
      })
    }
  }, [page, isOpen])

  // Autoplay functionality
  useEffect(() => {
    if (!isPlaying || !isOpen) return
    const timer = setInterval(() => {
      paginate(1)
    }, 4000)
    return () => clearInterval(timer)
  }, [isPlaying, isOpen, paginate])

  // Keyboard navigation listeners
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        paginate(-1)
      } else if (e.key === 'ArrowRight') {
        paginate(1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, paginate])

  if (images.length === 0) return null

  // Feature image is the first one
  const featureImage = images[0]
  // Grid images are all remaining images
  const gridImages = images.slice(1, 5)

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  }

  const openGalleryAt = (index: number) => {
    setPage([index, 0])
    setIsPlaying(false)
    setIsOpen(true)
  }

  return (
    <>
      {/* Modern Premium Hero Gallery Grid */}
      <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] md:h-[60vh] overflow-hidden group rounded-[32px] shadow-2xl-soft border border-navy-deep/5 bg-slate-100">
        <div className="flex h-full gap-3 p-3 w-full">
          {/* Main Hero Image (Left side, takes 60% of width) */}
          <div
            onClick={() => openGalleryAt(0)}
            className="relative w-full md:w-[60%] h-full rounded-2xl overflow-hidden cursor-pointer group/main"
          >
            {featureImage?.url ? (
              <Image
                src={featureImage.sizes?.hero?.url || featureImage.url}
                alt={featureImage.alt || 'Main property view'}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover/main:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent pointer-events-none transition-opacity duration-500 group-hover/main:opacity-80" />

          </div>

          {/* Grid Side Images (Right side, takes 40% of width, hidden on mobile) */}
          <div className="hidden md:grid w-[40%] h-full grid-cols-2 grid-rows-2 gap-3">
            {gridImages.map((image, index) => {
              if (!image.url) return null
              const isLast = index === 3

              return (
                <div
                  key={image.id}
                  onClick={() => openGalleryAt(index + 1)}
                  className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group/thumb bg-slate-200"
                >
                  <Image
                    src={image.sizes?.card?.url || image.url}
                    alt={image.alt || `Property view ${index + 2}`}
                    fill
                    sizes="20vw"
                    className="object-cover transition-transform duration-700 group-hover/thumb:scale-105"
                  />

                  {/* View All Photos Button Overlay on the 4th thumbnail */}
                  {isLast && images.length > 5 && (
                    <div className="absolute inset-0 bg-navy-deep/50 backdrop-blur-md hover:bg-navy-deep/75 transition-all duration-500 flex items-center justify-center cursor-pointer group/overlay border border-white/10">
                      <div className="flex flex-col items-center gap-2 transform group-hover/overlay:scale-105 transition-transform duration-500">
                        <Images className="h-6 w-6 text-gold-royal" />
                        <span className="text-white font-bold text-xs uppercase tracking-widest text-center">
                          +{images.length - 4} Photos
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile View All Button (shows only when grid is hidden) */}
        <div className="absolute top-6 left-6 md:hidden z-10">
          <button
            onClick={() => openGalleryAt(0)}
            className="bg-navy-deep/80 backdrop-blur-xl text-white px-6 py-3 rounded-2xl font-bold border border-white/10 shadow-gold flex items-center gap-3 text-xs z-10 uppercase tracking-widest hover:bg-gold-royal transition-all duration-500 active:scale-95"
          >
            <Images className="h-4 w-4 text-gold-royal" />
            Gallery
          </button>
        </div>
      </div>

      {/* Luxury Immersive Interactive Carousel Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          bypassCentering
          className="inset-0 w-screen h-screen max-w-none rounded-none border-none p-0 bg-black/98 backdrop-blur-3xl overflow-hidden flex flex-col items-center justify-between text-white select-none z-50 [&_.dialog-close]:hidden"
        >
          <DialogTitle className="sr-only">Interactive Property Photo Gallery</DialogTitle>

          {/* Top Control Bar */}
          <div className="w-full px-6 py-4 flex items-center justify-between bg-linear-to-b from-black/80 to-transparent z-30">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-royal bg-gold-royal/10 border border-gold-royal/20 px-3.5 py-1.5 rounded-full">
                {page + 1} / {images.length}
              </span>
              <h3 className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-white/60">
                {property.title || 'Elite Residence'}
              </h3>
            </div>

            {/* Playback & Close Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/15 text-white transition-all duration-300 border border-white/10 hover:border-white/20 active:scale-95"
                title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-gold-royal" />
                ) : (
                  <Play className="h-4 w-4 text-gold-royal" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-xl bg-white/5 hover:bg-gold-royal text-white hover:text-white transition-all duration-500 border border-white/10 hover:border-gold-royal/30 active:scale-95 group"
                title="Close Gallery"
              >
                <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Main Visual Display (Responsive Viewer) */}
          <div className="relative flex-1 w-full flex items-center justify-center px-4 md:px-12 max-h-[calc(100vh-180px)] overflow-hidden">
            {/* Sliding Container */}
            <div className="relative w-full h-full max-w-7xl flex items-center justify-center aspect-video max-h-[75vh] rounded-3xl overflow-hidden shadow-2xl bg-black/40 border border-white/5">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={page}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(e, { offset }) => {
                    const swipeThreshold = 50 // Pixels swiped to trigger transition
                    if (offset.x < -swipeThreshold) {
                      setIsPlaying(false)
                      paginate(1)
                    } else if (offset.x > swipeThreshold) {
                      setIsPlaying(false)
                      paginate(-1)
                    }
                  }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center select-none touch-pan-y cursor-grab active:cursor-grabbing"
                >
                  {images[page]?.url ? (
                    <Image
                      src={images[page].url}
                      alt={images[page].alt || `Property view ${page + 1}`}
                      fill
                      priority
                      sizes="(max-width: 1200px) 100vw, 80vw"
                      className="object-contain pointer-events-none"
                      quality={95}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      Loading high-resolution asset...
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Title Overlay in the Viewport */}
              {images[page]?.alt && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent text-center z-10 pointer-events-none">
                  <p className="text-xs font-medium tracking-wide text-white/90 max-w-xl mx-auto drop-shadow-sm">
                    {images[page].alt}
                  </p>
                </div>
              )}

              {/* Navigation Arrows Inside the Viewport Box */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsPlaying(false)
                  paginate(-1)
                }}
                className="absolute left-4 p-3 md:p-4 rounded-2xl bg-black/50 hover:bg-gold-royal hover:scale-105 text-white/80 hover:text-white transition-all duration-300 border border-white/10 hover:border-gold-royal/30 active:scale-95 backdrop-blur-md z-30 flex items-center justify-center shadow-lg cursor-pointer"
                title="Previous Photo"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsPlaying(false)
                  paginate(1)
                }}
                className="absolute right-4 p-3 md:p-4 rounded-2xl bg-black/50 hover:bg-gold-royal hover:scale-105 text-white/80 hover:text-white transition-all duration-300 border border-white/10 hover:border-gold-royal/30 active:scale-95 backdrop-blur-md z-30 flex items-center justify-center shadow-lg cursor-pointer"
                title="Next Photo"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>
          </div>

          {/* Bottom Thumbnails Strip Bar */}
          <div className="w-full py-4 bg-linear-to-t from-black/90 via-black/80 to-transparent border-t border-white/5 z-20">
            <div
              ref={thumbnailContainerRef}
              className="max-w-5xl mx-auto flex gap-3.5 overflow-x-auto px-6 py-2 no-scrollbar scroll-smooth"
            >
              {images.map((image, idx) => {
                if (!image.url) return null
                const isActive = idx === page

                return (
                  <div
                    key={`${image.id}-thumb-${idx}`}
                    data-thumb-index={idx}
                    onClick={() => {
                      setIsPlaying(false)
                      setPage([idx, idx > page ? 1 : -1])
                    }}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden cursor-pointer shrink-0 transition-all duration-500 border bg-navy-deep/20 ${
                      isActive
                        ? 'border-gold-royal ring-2 ring-gold-royal/40 scale-105 shadow-gold opacity-100'
                        : 'border-white/10 opacity-40 hover:opacity-100 hover:scale-102'
                    }`}
                  >
                    <Image
                      src={image.sizes?.thumbnail?.url || image.url}
                      alt={image.alt || `Thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
