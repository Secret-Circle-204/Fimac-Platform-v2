"use client"

import React from 'react'
import {
  Bed,
  Bath,
  Layers,
  Calendar,
  Flame,
  Waves,
  Trees,
  Warehouse,
  Car,
  Wifi,
  Shield,
  Coffee,
  Zap,
  Store,
  Activity,
  Utensils,
  Building2,
  Compass,
  Tent,
  Map,
  Grid,
  Droplet,
  ArrowUpDown,
  Percent,
  FileText,
  Gauge,
  DoorClosed,
  Thermometer,
  Star,
  Flag, // Imported Flag icon
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { SpecItem } from './SpecItem'
import type { Property } from '@/payload-types'
import { ALL_SPEC_FIELDS, PROFILES, PROFILE_MAP } from '@/collections/Properties/specs-registry'
import type { SpecIconKey, SpecFieldDefinition } from '@/collections/Properties/specs-registry'

// Safe registry icons map
export const SPEC_ICONS: Record<SpecIconKey, LucideIcon> = {
  bed: Bed,
  bath: Bath,
  layers: Layers,
  calendar: Calendar,
  flame: Flame,
  pool: Waves,
  trees: Trees,
  car: Car,
  warehouse: Warehouse,
  wifi: Wifi,
  shield: Shield,
  coffee: Coffee,
  zap: Zap,
  store: Store,
  activity: Activity,
  utensils: Utensils,
  building: Building2,
  compass: Compass,
  tent: Tent,
  map: Map,
  grid: Grid,
  droplet: Droplet,
  'arrow-up-down': ArrowUpDown,
  percent: Percent,
  'file-text': FileText,
  gauge: Gauge,
  'door-closed': DoorClosed,
  thermometer: Thermometer,
  star: Star,
  flag: Flag, // Mapped flag to Flag component
}

interface PropertySpecsProps {
  property: Property
}

// Safely get a nested value from an object using a dot-path
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

// Format the display value based on type, selectOptions, and unit
function formatDisplayValue(val: unknown, spec: SpecFieldDefinition): string | null {
  if (val === undefined || val === null || val === '') return null

  let displayVal = val
  if (spec.type === 'select' && spec.selectOptions) {
    const selectedOpt = spec.selectOptions.find((opt) => opt.value === val)
    displayVal = selectedOpt ? selectedOpt.label : val
  }

  const formattedStr = typeof displayVal === 'number'
    ? displayVal.toLocaleString()
    : String(displayVal)

  if (spec.unit) {
    return `${formattedStr} ${spec.unit}`
  }

  return formattedStr
}

export const PropertySpecs: React.FC<PropertySpecsProps> = ({ property }) => {
  if (!property) return null

  const category = property.category as 'residential' | 'commercial' | 'hospitality' | 'land'
  if (!category) return null

  // 1. Resolve Profile Name using PROFILE_MAP
  const slug =
    property.propertyTypeSlug ||
    (property.propertyType && typeof property.propertyType === 'object'
      ? property.propertyType.slug
      : null)

  const profile = slug && PROFILE_MAP[slug] ? PROFILE_MAP[slug] : 'none'

  // 2. Collect flat common fields for this category
  const commonSpecs = Object.values(ALL_SPEC_FIELDS)
    .filter((spec) => spec.category === category && spec.subGroup === 'common')
    .map((spec) => spec.path)

  // 3. Collect subgroup fields based on active profile
  const profileSpecs = profile && PROFILES[profile] ? PROFILES[profile] : []

  // 4. Combine paths (common first, then profile subgroup)
  let activePaths = Array.from(new Set([...commonSpecs, ...profileSpecs]))

  // Deduplicate beach fields: if privateBeachArea is set, skip rendering hasPrivateBeach
  const beachAreaVal = getNestedValue(property, 'hospitality.resort.privateBeachArea')
  if (beachAreaVal !== undefined && beachAreaVal !== null && beachAreaVal !== '') {
    activePaths = activePaths.filter((path) => path !== 'hospitality.resort.hasPrivateBeach')
  }

  return (
    <>
      {activePaths.map((path) => {
        const spec = ALL_SPEC_FIELDS[path]
        if (!spec) return null

        const rawValue = getNestedValue(property, spec.path)

        // Don't render empty, false, or "No" values
        if (
          rawValue === undefined ||
          rawValue === null ||
          rawValue === '' ||
          rawValue === false ||
          rawValue === 'false' ||
          rawValue === 'No' ||
          rawValue === 'no'
        ) {
          return null
        }

        const IconComponent = SPEC_ICONS[spec.iconKey] || Sparkles

        // Special handling for Checkbox (Boolean) fields
        if (spec.type === 'checkbox') {
          // If checkbox is checked (true), render the specification label as the value
          if (rawValue) {
            return (
              <SpecItem
                key={spec.path}
                label=""
                value={spec.label.en}
                icon={IconComponent}
              />
            )
          }
          return null // If unchecked, don't display it at all
        }

        // Default handling for other fields
        const displayValue = formatDisplayValue(rawValue, spec)
        if (displayValue === null || displayValue === undefined) {
          return null
        }

        return (
          <SpecItem
            key={spec.path}
            label={spec.label.en}
            value={displayValue}
            icon={IconComponent}
          />
        )
      })}
    </>
  )
}
