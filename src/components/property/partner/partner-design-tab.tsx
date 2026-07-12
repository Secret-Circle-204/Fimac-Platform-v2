import React from 'react'
import type { CompanySettingsData } from '@/lib/cache/company-settings'
import type { ConstructionStatus } from '@/payload-types'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface PartnerDesignTabProps {
  partner?: CompanySettingsData['partner']
  constructionStatus?: string | number | ConstructionStatus | null
}

export function PartnerDesignTab({ partner, constructionStatus: _constructionStatus }: PartnerDesignTabProps) {
  if (!partner || !partner.isActive || !partner.name) return null

  const logoUrl =
    typeof partner.logo === 'object' && partner.logo && 'url' in partner.logo
      ? partner.logo.url
      : typeof partner.logo === 'string' ? partner.logo : null

  const formattedUrl = partner.websiteUrl && !partner.websiteUrl.startsWith('http') 
    ? `https://${partner.websiteUrl}` 
    : partner.websiteUrl;

  return (
    <div className="group w-full bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-navy-deep/5 flex flex-col gap-4 items-center text-center overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-royal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      {logoUrl && (
        <div className="w-32 h-32 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 relative z-10 shadow-sm overflow-hidden mb-2">
          <div className="relative w-full h-full">
            <Image 
              src={logoUrl} 
              alt={partner.name} 
              fill 
              className="object-cover filter transition-all duration-500 opacity-100 grayscale-0 group-hover:grayscale-0 group-hover:opacity-100" 
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-3 relative z-10 w-full items-center">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="text-gold-royal bg-gold-royal/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Strategic Partner</span>
        </div>
        <h3 className="text-xl font-bold text-navy-deep break-words">
          Interior Design by {partner.name}
        </h3>
        <p className="text-slate-500 leading-relaxed text-sm mt-1">
          Unleash your imagination. This property is designed to be the perfect canvas for {partner.name}&apos;s smart and premium furnishing solutions. Whether you seek classic elegance or modern practicality, you will find the perfect fit here.
        </p>
        
        {formattedUrl && (
          <div className="mt-4 w-full">
            <Button asChild variant="outline" className="w-full gap-2 h-auto py-3.5 px-4 rounded-xl border-slate-200 hover:bg-slate-50 text-sm shadow-sm hover:shadow transition-all whitespace-normal text-center">
              <a href={formattedUrl} target="_blank" rel="noopener noreferrer" className="flex flex-row items-center justify-center gap-2">
                <span>Browse {partner.name}&apos;s ideas and collections</span>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
