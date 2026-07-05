"use client"

import { Hand, Sparkles, X } from "lucide-react"

export function GesturePrompt({
  onEnable,
  onDismiss,
}: {
  onEnable: () => void
  onDismiss: () => void
}) {
  return (
    <div className="gesture-prompt-overlay" onClick={onDismiss}>
      <div className="gesture-prompt" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="gesture-prompt-close" onClick={onDismiss} aria-label="Close">
          <X size={18} />
        </button>

        {/* Animated hand icon */}
        <div className="gesture-prompt-icon">
          <Hand size={36} />
          <Sparkles size={18} className="gesture-prompt-sparkle" />
        </div>

        {/* Title */}
        <h3 className="gesture-prompt-title">Control with Your Hands ✨</h3>

        {/* Description */}
        <p className="gesture-prompt-desc">
          Experience the future of property browsing! Navigate through properties using hand
          gestures — just wave your hand to explore.
        </p>

        {/* Gesture instructions */}
        <div className="gesture-prompt-gestures">
          <div className="gesture-prompt-gesture">
            <span className="gesture-prompt-emoji">👈👉</span>
            <span>Wave to navigate</span>
          </div>
          <div className="gesture-prompt-gesture">
            <span className="gesture-prompt-emoji">🖐️</span>
            <span>Spread fingers to open photos</span>
          </div>
          <div className="gesture-prompt-gesture">
            <span className="gesture-prompt-emoji">✊</span>
            <span>Close fist to exit</span>
          </div>
        </div>

        {/* Privacy note */}
        <p className="gesture-prompt-privacy">
          🔒 Your camera feed stays private — it never leaves your device and is only used for hand
          detection.
        </p>

        {/* Buttons */}
        <div className="gesture-prompt-actions">
          <button className="gesture-prompt-enable" onClick={onEnable}>
            <Hand size={16} />
            Enable Gesture Control
          </button>
          <button className="gesture-prompt-skip" onClick={onDismiss}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
