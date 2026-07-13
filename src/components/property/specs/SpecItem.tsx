import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface SpecItemProps {
  label: string
  value: React.ReactNode
  icon: LucideIcon
}

/**
 * SpecItem - An atomic UI component to display a single property specification.
 * Statically typed, responsive, and animated on hover.
 */
export const SpecItem: React.FC<SpecItemProps> = ({ label, value, icon: IconComponent }) => {
  if (value === undefined || value === null || value === '') return null

  return (
    <div
      className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-4 transition-all duration-300 hover:bg-slate-100 hover:border-gold-royal/20 hover:-translate-y-1 hover:shadow-lg-soft"
    >
      {/* Icon Wrapper */}
      <div className="w-12 h-12 rounded-2xl bg-gold-royal/10 text-gold-royal flex items-center justify-center">
        <IconComponent className="w-6 h-6" />
      </div>

      {/* Text Details */}
      <div>
        {label && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-navy-deep/40 mb-1">
            {label}
          </p>
        )}
        <p className="font-bold text-navy-deep text-lg">
          {value}
        </p>
      </div>
    </div>
  )
}
