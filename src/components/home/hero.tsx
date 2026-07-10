'use client'

import Image, { StaticImageData } from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

type Slide = {
  image: string | StaticImageData
  title: string
  subtitle: string
  cta: string
  tag: string
}

const SLIDE_DURATION = 7000

export default function Hero() {
  const slides: Slide[] = useMemo(
    () => [
      {
        image: '/hero2.jpg',
        title: 'Your Partner in Real Estate Investment',
        subtitle:
          'Advisory expertise for hotels, resorts, and boutique stays worldwide—crafted for discerning buyers.',
        cta: 'Discover Opportunities',
        tag: 'Global Expertise',
      },
      {
        image: '/hero1.jpg',
        title: 'Strategic Transactions, Elevated',
        subtitle:
          'From valuation to negotiation, FIMAC delivers concierge-level service across every hospitality asset class.',
        cta: 'Work With FIMAC',
        tag: 'Concierge Service',
      },
      {
        image: '/hero3.jpg',
        title: 'Global Vision. Local Precision.',
        subtitle:
          'We unite international capital with iconic destinations, ensuring each deal honors the story behind the property.',
        cta: 'Start a Consultation',
        tag: 'Iconic Destinations',
      },
    ],
    [],
  )

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [slides.length])

  // Custom animation variants for a non-traditional premium look
  const slideVariants: Variants = {
    enter: {
      clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)', // Starts hidden on the right
      scale: 1.05,
      filter: 'brightness(1.5)',
      zIndex: 10,
    },
    center: {
      clipPath: 'polygon(0% 0, 100% 0, 100% 100%, 0% 100%)', // Fully revealed
      scale: 1,
      filter: 'brightness(1)',
      zIndex: 10,
      transition: {
        clipPath: { duration: 1.4, ease: [0.76, 0, 0.24, 1] },
        filter: { duration: 1.4, ease: 'easeOut' },
        scale: { duration: SLIDE_DURATION / 1000, ease: 'linear' }, // Continuous Ken Burns zoom
      },
    },
    exit: {
      // Keep it full screen (no clipPath shrink, no scale down) to prevent blue borders
      clipPath: 'polygon(0% 0, 100% 0, 100% 100%, 0% 100%)',
      scale: 1,
      filter: 'brightness(0.3)', // Darken it significantly as the new one wipes over
      zIndex: 0,
      transition: {
        filter: { duration: 1.4, ease: 'easeOut' },
      },
    },
  }

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
    },
    exit: {
      opacity: 0,
      y: -40,
      filter: 'blur(10px)',
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
    },
  }

  return (
    <section className="relative mt-[1px] lg:mt-[80px] h-[85vh] min-h-[600px] overflow-hidden bg-navy-deep text-white">
      {/* Background Images */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeIndex}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 origin-center"
          >
            <Image
              src={slides[activeIndex].image}
              alt={slides[activeIndex].title}
              fill
              priority={activeIndex === 0}
              className="object-cover"
            />
            {/* Elegant multi-layered gradient for text readability (lightened for better image visibility) */}
            <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/70 via-navy-deep/30 to-transparent w-full lg:w-3/4" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/50 via-transparent to-transparent" />
          </motion.div>

          {/* Sweeping Dark Blue Strip (Curtain Edge) */}
          <motion.div
            key={`strip-${activeIndex}`}
            initial={{ left: '100%', opacity: 1 }}
            animate={{
              left: '0%',
              opacity: [1, 1, 0],
              transition: {
                left: { duration: 1.4, ease: [0.76, 0, 0.24, 1] },
                opacity: { duration: 1.6, times: [0, 0.85, 1], ease: 'easeOut' },
              },
            }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="absolute top-0 bottom-0 w-2 sm:w-4 bg-blue-brand-light z-10 shadow-[-20px_0_50px_rgba(17,9,76,0.6)]"
          />
        </AnimatePresence>
      </div>

      {/* Content Container */}
      <div className="relative z-20 h-full container mx-auto px-6 sm:px-12 lg:px-20 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-3xl w-full pt-20 lg:pt-0"
            variants={{
              visible: { transition: { staggerChildren: 0.15, delayChildren: 0.4 } },
              exit: { transition: { staggerChildren: 0.1, staggerDirection: -1 } },
            }}
          >
            {/* Tagline */}
            <motion.div variants={textVariants} className="flex items-center gap-4 mb-6">
              <div className="h-[2px] w-12 bg-gold-royal" />
              <span className="text-gold-royal font-bold tracking-[0.3em] uppercase text-xs sm:text-sm">
                {slides[activeIndex].tag}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={textVariants}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight"
            >
              {slides[activeIndex].title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={textVariants}
              className="text-base sm:text-lg lg:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl font-light"
            >
              {slides[activeIndex].subtitle}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      <div className="absolute bottom-8 lg:bottom-12 left-6 sm:left-12 lg:left-20 z-30 flex items-center gap-4">
        {slides.map((_, index) => (
          <button
            key={index}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            className="group relative h-12 w-12 flex items-center justify-center focus:outline-none"
          >
            {/* The line */}
            <div
              className={`h-[2px] transition-all duration-700 ease-out ${
                index === activeIndex
                  ? 'w-12 bg-gold-royal'
                  : 'w-4 bg-white/30 group-hover:bg-white/60 group-hover:w-8'
              }`}
            />
            {/* Active timer bar (optional, can be implemented later. Currently acts as a sleek indicator) */}
          </button>
        ))}

        {/* Slide Counter */}
        <div className="ml-4 text-white/50 font-medium tracking-widest text-sm flex items-center gap-2">
          <span className="text-white text-lg">0{activeIndex + 1}</span>
          <span className="h-px  w-4 bg-white/30" />
          <span>0{slides.length}</span>
        </div>
      </div>
    </section>
  )
}
