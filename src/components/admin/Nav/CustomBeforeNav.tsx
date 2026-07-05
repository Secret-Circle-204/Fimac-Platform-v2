'use client'

import React from 'react'
import Link from 'next/link'
import { Hexagon, Zap } from 'lucide-react'

export const CustomBeforeNav: React.FC = () => {
  // تم نقل التنسيقات (CSS) التي كانت هنا إلى ملف custom.css لضمان الأداء وتجنب التعارض

  return (
    <div style={{ marginBottom: '2.5rem', padding: '0 0.5rem', marginTop: '1rem' }}>
      <Link
        href="/admin"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px',
          background: 'rgba(20, 22, 33, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          borderRadius: '16px',
          textDecoration: 'none',
          color: '#fff',
          fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(0, 240, 255, 0.05)',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
          e.currentTarget.style.boxShadow =
            '0 12px 40px rgba(0, 240, 255, 0.15), inset 0 0 25px rgba(0, 240, 255, 0.1)'
          e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow =
            '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(0, 240, 255, 0.05)'
          e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.2)'
        }}
      >
        {/* Animated Background Grid Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.15,
            backgroundImage: 'radial-gradient(rgba(0, 240, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
            animation: 'grid-move 20s linear infinite',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #00f0ff 0%, #0055ff 100%)',
            color: '#fff',
            borderRadius: '10px',
            width: '40px',
            height: '40px',
            animation: 'pulse-glow 3s infinite ease-in-out',
            boxShadow: '0 4px 15px rgba(0, 240, 255, 0.4)',
          }}
        >
          <Hexagon size={22} fill="rgba(255,255,255,0.2)" />
          <Zap size={12} fill="#fff" style={{ position: 'absolute' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '1.05rem',
              letterSpacing: '0.5px',
              textShadow: '0 2px 10px rgba(0,240,255,0.3)',
            }}
          >
            FIMAC OS
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              color: 'rgba(0, 240, 255, 0.7)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginTop: '2px',
            }}
          >
            System Core
          </span>
        </div>
      </Link>
    </div>
  )
}
