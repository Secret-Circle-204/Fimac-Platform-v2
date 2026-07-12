"use client"

import { Mic, MicOff, Hand } from "lucide-react"

interface CarouselControlsProps {
  soundOn: boolean
  voiceOn: boolean
  gestureActive: boolean
  showGestureControl: boolean
  totalProperties: number
  activeIndex: number
  isTransitioning: boolean
  onToggleSound: () => void
  onToggleVoice: () => void
  onToggleGesture: () => void
  onRequestGesture: () => void
  onDotClick: (index: number) => void
}

export function CarouselControls({
  soundOn: _soundOn,
  voiceOn,
  gestureActive,
  showGestureControl,
  totalProperties,
  activeIndex,
  isTransitioning,
  onToggleSound: _onToggleSound,
  onToggleVoice,
  onToggleGesture,
  onRequestGesture,
  onDotClick,
}: CarouselControlsProps) {
  return (
    <div className="carousel3d-controls">
      {/* Sound toggle - Hidden from UI as requested
      <button
        className={`carousel3d-control-btn ${soundOn ? "carousel3d-control-btn--active" : ""}`}
        onClick={onToggleSound}
        aria-label="Toggle sound"
      >
        {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <span>{soundOn ? "Sound" : "Sound"}</span>
      </button>
      */}

      {/* Voice toggle */}
      <button
        className={`carousel3d-control-btn ${voiceOn ? "carousel3d-control-btn--active" : ""}`}
        onClick={onToggleVoice}
        aria-label="Toggle voice narration"
      >
        {voiceOn ? <Mic size={16} /> : <MicOff size={16} />}
        <span>Voice</span>
      </button>

      {/* Dots */}
      <div className="carousel3d-dots">
        {Array.from({ length: totalProperties }).map((_, i) => (
          <button
            key={i}
            className={`carousel3d-dot ${i === activeIndex ? "carousel3d-dot--active" : ""}`}
            onClick={() => {
              if (!isTransitioning) {
                onDotClick(i)
              }
            }}
            aria-label={`Go to property ${i + 1}`}
          />
        ))}
      </div>

      {/* Gesture control */}
      {showGestureControl && (
        <button
          className={`carousel3d-control-btn ${gestureActive ? "carousel3d-control-btn--active" : ""}`}
          onClick={gestureActive ? onToggleGesture : onRequestGesture}
          aria-label="Toggle gesture control"
        >
          <Hand size={16} />
          <span>Gesture</span>
        </button>
      )}

      {/* Counter */}
      <div className="carousel3d-counter">
        {activeIndex + 1} / {totalProperties}
      </div>
    </div>
  )
}
