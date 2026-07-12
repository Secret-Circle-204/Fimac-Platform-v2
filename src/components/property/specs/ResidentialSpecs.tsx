import React from 'react'
import { SpecItem } from './SpecItem'
import {
  Bed,
  Bath,
  Layers,
  Calendar,
  Thermometer,
  Waves,
  Sparkles,
} from 'lucide-react'
import type { Property } from '@/payload-types'

const HEATING_LABELS: Record<string, string> = {
  central: 'Central Heating',
  electric: 'Electric Heating',
  gas: 'Gas Heating',
  oil: 'Oil Heating',
  propane: 'Propane Heating',
}

interface ResidentialSpecsProps {
  residential: NonNullable<Property['residential']>
  propertyTypeSlug?: string
}

/**
 * ResidentialSpecs - Modular renderer for residential properties (Villa, Apartment, Chalet, etc.)
 * Strictly enforces that fields with false/zero/undefined values are NEVER rendered.
 * Strictly maps sub-types only when the selected propertyTypeSlug matches their criteria.
 */
export const ResidentialSpecs: React.FC<ResidentialSpecsProps> = ({
  residential,
  propertyTypeSlug,
}) => {
  const isVillaType =
    propertyTypeSlug === 'villa' ||
    propertyTypeSlug === 'penthouse' ||
    propertyTypeSlug === 'townhouse' ||
    propertyTypeSlug === 'duplex'

  const isApartmentType =
    propertyTypeSlug === 'apartment' ||
    propertyTypeSlug === 'studio' ||
    propertyTypeSlug === 'duplex'

  const isChaletType = propertyTypeSlug === 'chalet'

  return (
    <>
      {/* Core Residential Specifications */}
      {residential.bedrooms !== undefined && residential.bedrooms !== null && residential.bedrooms > 0 && (
        <SpecItem label="Bedrooms" value={`${residential.bedrooms} Beds`} icon={Bed} />
      )}
      {residential.bathrooms !== undefined && residential.bathrooms !== null && residential.bathrooms > 0 && (
        <SpecItem label="Bathrooms" value={`${residential.bathrooms} Baths`} icon={Bath} />
      )}
      {residential.floor !== undefined && residential.floor !== null && (
        <SpecItem label="Floor Level" value={`Floor ${residential.floor}`} icon={Layers} />
      )}
      {residential.floors !== undefined && residential.floors !== null && residential.floors > 0 && (
        <SpecItem label="Total Floors" value={`${residential.floors} Floors`} icon={Layers} />
      )}
      {residential.yearBuilt !== undefined && residential.yearBuilt !== null && residential.yearBuilt > 0 && (
        <SpecItem label="Year Built" value={residential.yearBuilt} icon={Calendar} />
      )}
      {residential.heatingType && HEATING_LABELS[residential.heatingType] && (
        <SpecItem
          label="Heating System"
          value={HEATING_LABELS[residential.heatingType]}
          icon={Thermometer}
        />
      )}

      {/* Villa Specifics */}
      {isVillaType && residential.villa && (
        <>
          {residential.villa.pools !== undefined && residential.villa.pools !== null && residential.villa.pools > 0 && (
            <SpecItem label="Private Pools" value={`${residential.villa.pools} Pools`} icon={Waves} />
          )}
          {residential.villa.hasGarden === true && (
            <SpecItem label="Private Garden" value="Yes" icon={Sparkles} />
          )}
          {residential.villa.hasGarage === true && (
            <SpecItem label="Garage" value="Yes" icon={Sparkles} />
          )}
          {residential.villa.hasMajlis === true && (
            <SpecItem label="Majlis" value="Yes" icon={Sparkles} />
          )}
          {residential.villa.hasDriverRoom === true && (
            <SpecItem label="Driver Room" value="Yes" icon={Sparkles} />
          )}
          {residential.villa.hasMaidRoom === true && (
            <SpecItem label="Maid Room" value="Yes" icon={Sparkles} />
          )}
        </>
      )}

      {/* Apartment Specifics */}
      {isApartmentType && residential.apartment && (
        <>
          {residential.apartment.hasBalcony === true && (
            <SpecItem label="Balcony" value="Yes" icon={Sparkles} />
          )}
          {residential.apartment.hasMaidRoom === true && (
            <SpecItem label="Maid Room" value="Yes" icon={Sparkles} />
          )}
        </>
      )}

      {/* Chalet Specifics */}
      {isChaletType && residential.chalet && (
        <>
          {residential.chalet.hasPool === true && (
            <SpecItem label="Private Pool" value="Yes" icon={Waves} />
          )}
          {residential.chalet.hasGarden === true && (
            <SpecItem label="Garden" value="Yes" icon={Sparkles} />
          )}
          {residential.chalet.isBeachfront === true && (
            <SpecItem label="Beachfront" value="Yes" icon={Waves} />
          )}
        </>
      )}
    </>
  )
}
