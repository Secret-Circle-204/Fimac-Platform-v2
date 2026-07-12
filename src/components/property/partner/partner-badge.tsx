import React from 'react'
import type { CompanySettingsData } from '@/lib/cache/company-settings'

interface PartnerBadgeProps {
  partner?: CompanySettingsData['partner']
  constructionStatus?: string | null
}

export function PartnerBadge({ partner, constructionStatus: _constructionStatus }: PartnerBadgeProps) {
  if (!partner || !partner.isActive || !partner.name) return null

  return (
    <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-full border border-amber-500/20 shadow-sm animate-in fade-in zoom-in duration-500 mb-4">
      <span className="text-lg">🛋️</span>
      <span className="text-sm font-semibold">
        Ready to move? Furnish it with {partner.name} in 14 days
      </span>
    </div>
  )
}
