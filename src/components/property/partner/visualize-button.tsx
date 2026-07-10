'use client'

import React from 'react'
import type { CompanySettingsData } from '@/lib/cache/company-settings'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface VisualizeButtonProps {
  partner?: CompanySettingsData['partner']
  constructionStatus?: string | null
}

export function VisualizeButton({ partner, constructionStatus }: VisualizeButtonProps) {
  if (!partner || !partner.isActive || !partner.name) return null

  if (constructionStatus !== 'ready' && constructionStatus !== 'brand_new') {
    return null
  }

  const logoUrl =
    typeof partner.logo === 'object' && partner.logo && 'url' in partner.logo
      ? partner.logo.url
      : typeof partner.logo === 'string'
        ? partner.logo
        : null

  const formattedUrl =
    partner.websiteUrl && !partner.websiteUrl.startsWith('http')
      ? `https://${partner.websiteUrl}`
      : partner.websiteUrl

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-10 inline-flex items-center gap-2 md:gap-3 bg-white/90 backdrop-blur-md hover:bg-white text-navy-deep px-4 py-2.5 md:px-6 md:py-3 rounded-full shadow-lg border border-white/50 transition-all duration-300 group hover:scale-105 max-w-[calc(100%-2rem)]">
          {logoUrl && (
            <div className="relative w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden flex-shrink-0 bg-white shadow-sm border border-slate-100">
              <Image src={logoUrl} alt={partner.name} fill className="object-cover" />
            </div>
          )}
          <span className="font-semibold text-xs md:text-sm truncate">
            <span className="hidden sm:inline">
              {partner.badgeText || 'Imagine your home with'}{' '}
            </span>
            {partner.name} <span className="text-gold-royal">✦</span>
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] text-center p-10 bg-white/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <div className="mx-auto w-24 h-24 relative mb-6 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-white">
            {logoUrl ? (
              <Image src={logoUrl} alt={partner.name} fill className="object-contain p-2" />
            ) : (
              <div className="w-full h-full bg-slate-50 flex items-center justify-center text-4xl">
                🛋️
              </div>
            )}
          </div>
          <DialogTitle className="text-2xl font-bold text-navy-deep mb-3">
            Your space, styled by {partner.name}
          </DialogTitle>
          <DialogDescription className="text-base text-slate-500 leading-relaxed">
            This property's spaces have been carefully planned. Discover how {partner.name}'s
            furnishing solutions can bring your new home to life.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-8">
          {formattedUrl && (
            <Button
              asChild
              size="lg"
              className="w-full text-md h-14 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <a href={formattedUrl} target="_blank" rel="noopener noreferrer">
                Explore the catalog at {partner.name} ↗
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
