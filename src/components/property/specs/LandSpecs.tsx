import React from 'react'
import { SpecItem } from './SpecItem'
import {
  Compass,
  Move,
  Layers,
  Maximize,
  Info,
  Zap,
} from 'lucide-react'
import type { Property } from '@/payload-types'

const ZONING_LABELS: Record<string, string> = {
  residential: 'Residential Zoning',
  commercial: 'Commercial Zoning',
  industrial: 'Industrial Zoning',
  agricultural: 'Agricultural Zoning',
  mixed: 'Mixed-Use Zoning',
}

const SLOPE_LABELS: Record<string, string> = {
  flat: 'Flat / Level',
  gentle: 'Gentle Slope',
  moderate: 'Moderate Slope',
  steep: 'Steep Slope',
}

interface LandSpecsProps {
  land: NonNullable<Property['land']>
}

/**
 * LandSpecs - Modular renderer for land property specifications (Zoning, Slope, Widths, etc.)
 * Strictly enforces that fields with false/zero/undefined values are NEVER rendered.
 */
export const LandSpecs: React.FC<LandSpecsProps> = ({ land }) => {
  return (
    <>
      {/* Land Specifications */}
      {land.zoning && ZONING_LABELS[land.zoning] && (
        <SpecItem label="Zoning Class" value={ZONING_LABELS[land.zoning]} icon={Compass} />
      )}
      {land.roadWidth !== undefined && land.roadWidth !== null && land.roadWidth > 0 && (
        <SpecItem label="Front Road Width" value={`${land.roadWidth} m`} icon={Move} />
      )}
      {land.frontageWidth !== undefined && land.frontageWidth !== null && land.frontageWidth > 0 && (
        <SpecItem label="Plot Frontage" value={`${land.frontageWidth} m`} icon={Move} />
      )}
      {land.allowedFloors !== undefined && land.allowedFloors !== null && land.allowedFloors > 0 && (
        <SpecItem label="Max Permit Floors" value={`G + ${land.allowedFloors} Floors`} icon={Layers} />
      )}
      {land.buildingRatio !== undefined && land.buildingRatio !== null && land.buildingRatio > 0 && (
        <SpecItem label="Max Build Footprint" value={`${land.buildingRatio}%`} icon={Maximize} />
      )}
      {land.isCorner === true && (
        <SpecItem label="Corner Plot Position" value="Corner Plot" icon={Compass} />
      )}
      {land.slope && SLOPE_LABELS[land.slope] && (
        <SpecItem label="Terrain Slope" value={SLOPE_LABELS[land.slope]} icon={Compass} />
      )}
      {land.soilType && land.soilType.trim() !== '' && (
        <SpecItem label="Soil Category" value={land.soilType} icon={Info} />
      )}
      {land.hasUtilities === true && (
        <SpecItem label="Utilities Connection" value="Available" icon={Zap} />
      )}
    </>
  )
}
