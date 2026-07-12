import React from 'react'
import {
  TrendingUp,
  Percent,
  Calendar,
  DollarSign,
  Briefcase,
} from 'lucide-react'
import type { Property } from '@/payload-types'

interface OperationalMetricsProps {
  operationalData: NonNullable<Property['operationalData']>
  currency: Property['currency']
}

/**
 * OperationalMetrics - Displays the hospitality business metrics (ADR, Occupancy, RevPAR, etc.)
 * in a premium dashboard layout.
 * Strictly checks that each value is defined, non-null, and greater than 0 before rendering.
 */
export const OperationalMetrics: React.FC<OperationalMetricsProps> = ({
  operationalData,
  currency,
}) => {
  const { avgDailyRate, occupancyRate, revPAR, lastReportDate } = operationalData

  const hasADR = avgDailyRate !== undefined && avgDailyRate !== null && avgDailyRate > 0
  const hasOcc = occupancyRate !== undefined && occupancyRate !== null && occupancyRate > 0
  const hasRevPAR = revPAR !== undefined && revPAR !== null && revPAR > 0

  // Only render the component at all if there is at least one active metric populated
  if (!hasADR && !hasOcc && !hasRevPAR) {
    return null
  }

  // Format currency value helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="bg-white rounded-[32px] border border-navy-deep/5 shadow-2xl-soft p-8 md:p-12 flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gold-royal/10 text-gold-royal">
          <Briefcase className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-navy-deep tracking-tight">Business Operational Metrics</h2>
      </div>

      <p className="text-navy-deep/60 leading-relaxed text-sm">
        Key performance indicators (KPIs) and operational data for this hospitality asset.
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2">
        {/* ADR Card */}
        {hasADR && (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy-deep/40 mb-1">
                Average Daily Rate (ADR)
              </p>
              <p className="text-2xl font-bold text-navy-deep">{formatCurrency(avgDailyRate!)}</p>
            </div>
          </div>
        )}

        {/* Occupancy Card */}
        {hasOcc && (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy-deep/40 mb-1">
                Occupancy Rate
              </p>
              <p className="text-2xl font-bold text-navy-deep">{occupancyRate}%</p>
            </div>
          </div>
        )}

        {/* RevPAR Card */}
        {hasRevPAR && (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-royal/10 text-gold-royal flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy-deep/40 mb-1">
                RevPAR
              </p>
              <p className="text-2xl font-bold text-navy-deep">{formatCurrency(revPAR!)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Date Updated */}
      {lastReportDate && (
        <div className="flex items-center gap-2 text-xs text-navy-deep/40 mt-2 pl-1">
          <Calendar className="w-4 h-4" />
          <span>Last report date: {new Date(lastReportDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
        </div>
      )}
    </div>
  )
}
