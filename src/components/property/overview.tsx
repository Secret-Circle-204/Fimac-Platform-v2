"use client"

import React from 'react'
import { PropertyDescription } from './description'
import { useProperty } from '../providers/property'
import { SpecItem } from './specs/SpecItem'
import { PropertySpecs } from './specs/PropertySpecs'
import { Info, Maximize } from 'lucide-react'
import * as Icons from 'lucide-react'

// Helper to dynamically resolve Lucide icons by name safely
const getIconComponent = (iconName?: string | null): Icons.LucideIcon => {
  if (!iconName) return Icons.Sparkles
  const formattedName = iconName.charAt(0).toUpperCase() + iconName.slice(1)
  if (formattedName in Icons) {
    return Icons[formattedName as keyof typeof Icons] as Icons.LucideIcon
  }
  return Icons.Sparkles
}

// Format values based on valueType for Specs rendering
const formatCustomValue = (
  value: string,
  valueType: 'text' | 'number' | 'date' | 'boolean' | 'url'
): React.ReactNode => {
  if (value === undefined || value === null || value === '') return null

  switch (valueType) {
    case 'boolean':
      const isTrue =
        value.toLowerCase() === 'true' ||
        value === '1' ||
        value.toLowerCase() === 'yes'
      return isTrue ? 'Yes' : 'No'

    case 'url':
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-royal hover:underline flex items-center gap-1.5"
        >
          Open Link
        </a>
      )

    case 'date':
      try {
        return new Date(value).toLocaleDateString(undefined, {
          dateStyle: 'medium',
        })
      } catch {
        return value
      }

    case 'number':
      try {
        return Number(value).toLocaleString()
      } catch {
        return value
      }

    default:
      return value
  }
}

/**
 * PropertyOverview - Frontend detail section that displays property description
 * and a dynamic grid of specifications.
 * Imports modular specs renderers per category for easy maintenance.
 */
export const PropertyOverview = () => {
  const property = useProperty()

  return (
    <div className="bg-white rounded-[32px] border border-navy-deep/5 shadow-2xl-soft p-8 md:p-12 flex flex-col gap-10">
      {/* ── Section A: Description ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gold-royal/10 text-gold-royal">
            <Info className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-navy-deep tracking-tight">Property Overview</h2>
        </div>
        <div className="text-navy-deep/70 leading-relaxed text-lg pl-1">
          <PropertyDescription />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h3 className="text-xl font-bold text-navy-deep tracking-tight">Property Specifications</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {property.area !== undefined && property.area !== null && property.area > 0 && (
            <SpecItem
              label="Area Size"
              value={`${property.area.toLocaleString()} m²`}
              icon={Maximize}
            />
          )}

          {/* Dynamic Specifications */}
          <PropertySpecs property={property.original} />

          {/* Custom Specifications */}
          {property.customSpecifications?.map((spec) => {
            const Icon = getIconComponent(spec.icon)

            if (spec.valueType === 'boolean') {
              const isTrue =
                spec.value?.toLowerCase() === 'true' ||
                spec.value === '1' ||
                spec.value?.toLowerCase() === 'yes'

              if (isTrue) {
                return (
                  <SpecItem
                    key={spec.id}
                    label=""
                    value={spec.label}
                    icon={Icon}
                  />
                )
              }
              return null
            }

            const formattedVal = formatCustomValue(spec.value, spec.valueType)
            return (
              <SpecItem
                key={spec.id}
                label={spec.label}
                value={formattedVal}
                icon={Icon}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
