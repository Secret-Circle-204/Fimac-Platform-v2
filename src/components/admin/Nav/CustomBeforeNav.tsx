'use client'

import React from 'react'
import Link from 'next/link'

export const CustomBeforeNav: React.FC = () => {
  return (
    <div style={{ 
      marginBottom: '2.5rem', 
      padding: '0 0.5rem', 
      marginTop: '1rem',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }}>
      <Link
        href="/admin"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          padding: '16px 20px',
          background: 'rgba(20, 22, 33, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          textDecoration: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(212, 175, 55, 0.05)',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
          e.currentTarget.style.boxShadow =
            '0 12px 40px rgba(212, 175, 55, 0.15), inset 0 0 25px rgba(212, 175, 55, 0.1)'
          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow =
            '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(212, 175, 55, 0.05)'
          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)'
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
            opacity: 0.1,
            backgroundImage: 'radial-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
            animation: 'grid-move 20s linear infinite',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        <img
          src="/logo.svg"
          alt="FIMAC Logo"
          style={{
            height: '42px',
            width: 'auto',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 1,
            filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.2))',
          }}
        />
      </Link>
    </div>
  )
}
