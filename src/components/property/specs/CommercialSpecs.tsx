import React from 'react'
import { SpecItem } from './SpecItem'
import {
  Layers,
  ParkingCircle,
  Info,
  Home,
  Wifi,
  Shield,
  Flame,
  Zap,
  AlertTriangle,
  Move,
  Box,
  Sparkles,
} from 'lucide-react'
import type { Property } from '@/payload-types'

const INTERNET_LABELS: Record<string, string> = {
  fiber: 'Fiber Optic High-Speed',
  adsl: 'ADSL / VDSL',
}

const SECURITY_LABELS: Record<string, string> = {
  '24_7': '24/7 Gated Security',
  business_hours: 'Business Hours Only',
}

const FIRE_SYSTEM_LABELS: Record<string, string> = {
  sprinkler: 'Automatic Sprinklers',
  extinguisher: 'Extinguishers Only',
  full: 'Full Integrated Fire System',
}

const HAZARD_LABELS: Record<string, string> = {
  none: 'Safe Zone (No Hazards)',
  low: 'Low Hazard Zone',
  medium: 'Medium Hazard Zone',
  high: 'High Hazard Zone',
}

interface CommercialSpecsProps {
  commercial: NonNullable<Property['commercial']>
  propertyTypeSlug?: string
}

/**
 * CommercialSpecs - Modular renderer for commercial properties (Office, Warehouse, Retail, Factory, Medical, etc.)
 * Strictly enforces that fields with false/zero/none/undefined values are NEVER rendered.
 * Strictly maps sub-types only when the selected propertyTypeSlug matches their criteria.
 */
export const CommercialSpecs: React.FC<CommercialSpecsProps> = ({
  commercial,
  propertyTypeSlug,
}) => {
  const isOfficeType = propertyTypeSlug === 'office' || propertyTypeSlug === 'coworking-space'
  const isRestaurantType = propertyTypeSlug === 'restaurant' || propertyTypeSlug === 'cafe'
  const isWarehouseType = propertyTypeSlug === 'warehouse'
  const isFactoryType = propertyTypeSlug === 'factory'
  const isRetailType = propertyTypeSlug === 'retail-shop' || propertyTypeSlug === 'mall'
  const isMedicalType =
    propertyTypeSlug === 'clinic' ||
    propertyTypeSlug === 'medical-center' ||
    propertyTypeSlug === 'hospital'

  return (
    <>
      {/* Core Commercial Specifications */}
      {commercial.floor !== undefined && commercial.floor !== null && (
        <SpecItem label="Floor Level" value={`Floor ${commercial.floor}`} icon={Layers} />
      )}
      {commercial.parkingSpaces !== undefined && commercial.parkingSpaces !== null && commercial.parkingSpaces > 0 && (
        <SpecItem
          label="Dedicated Parking"
          value={`${commercial.parkingSpaces} Spaces`}
          icon={ParkingCircle}
        />
      )}
      {commercial.licenseType && commercial.licenseType.trim() !== '' && (
        <SpecItem label="Property License" value={commercial.licenseType} icon={Info} />
      )}

      {/* Office Specifics */}
      {isOfficeType && commercial.office && (
        <>
          {commercial.office.meetingRooms !== undefined && commercial.office.meetingRooms !== null && commercial.office.meetingRooms > 0 && (
            <SpecItem label="Meeting Rooms" value={commercial.office.meetingRooms} icon={Home} />
          )}
          {commercial.office.hasReception === true && (
            <SpecItem label="Reception Area" value="Yes" icon={Sparkles} />
          )}
          {commercial.office.internetType && commercial.office.internetType !== 'none' && INTERNET_LABELS[commercial.office.internetType] && (
            <SpecItem
              label="Internet Connection"
              value={INTERNET_LABELS[commercial.office.internetType]}
              icon={Wifi}
            />
          )}
          {commercial.office.securityLevel && commercial.office.securityLevel !== 'none' && SECURITY_LABELS[commercial.office.securityLevel] && (
            <SpecItem
              label="Security Level"
              value={SECURITY_LABELS[commercial.office.securityLevel]}
              icon={Shield}
            />
          )}
          {commercial.office.elevators !== undefined && commercial.office.elevators !== null && commercial.office.elevators > 0 && (
            <SpecItem label="Building Elevators" value={commercial.office.elevators} icon={Layers} />
          )}
        </>
      )}

      {/* Restaurant / Cafe Specifics */}
      {isRestaurantType && commercial.restaurant && (
        <>
          {commercial.restaurant.kitchenCount !== undefined && commercial.restaurant.kitchenCount !== null && commercial.restaurant.kitchenCount > 0 && (
            <SpecItem label="Kitchen Count" value={commercial.restaurant.kitchenCount} icon={Home} />
          )}
          {commercial.restaurant.hasExhaust === true && (
            <SpecItem label="Kitchen Exhaust" value="Installed" icon={Sparkles} />
          )}
          {commercial.restaurant.hasGasConnection === true && (
            <SpecItem label="Gas Connection" value="Installed" icon={Flame} />
          )}
          {commercial.restaurant.outdoorSeatingCapacity !== undefined && commercial.restaurant.outdoorSeatingCapacity !== null && commercial.restaurant.outdoorSeatingCapacity > 0 && (
            <SpecItem
              label="Outdoor Seating"
              value={`${commercial.restaurant.outdoorSeatingCapacity} Guests`}
              icon={Sparkles}
            />
          )}
        </>
      )}

      {/* Warehouse Specifics */}
      {isWarehouseType && commercial.warehouse && (
        <>
          {commercial.warehouse.loadingDocks !== undefined && commercial.warehouse.loadingDocks !== null && commercial.warehouse.loadingDocks > 0 && (
            <SpecItem label="Loading Docks" value={commercial.warehouse.loadingDocks} icon={ParkingCircle} />
          )}
          {commercial.warehouse.ceilingHeight !== undefined && commercial.warehouse.ceilingHeight !== null && commercial.warehouse.ceilingHeight > 0 && (
            <SpecItem label="Ceiling Height" value={`${commercial.warehouse.ceilingHeight} m`} icon={Move} />
          )}
          {commercial.warehouse.hasTruckAccess === true && (
            <SpecItem label="Truck Access" value="Available" icon={Sparkles} />
          )}
          {commercial.warehouse.fireSystem && commercial.warehouse.fireSystem !== 'none' && FIRE_SYSTEM_LABELS[commercial.warehouse.fireSystem] && (
            <SpecItem
              label="Fire Protection"
              value={FIRE_SYSTEM_LABELS[commercial.warehouse.fireSystem]}
              icon={Flame}
            />
          )}
        </>
      )}

      {/* Factory Specifics */}
      {isFactoryType && commercial.factory && (
        <>
          {commercial.factory.powerCapacityKW !== undefined && commercial.factory.powerCapacityKW !== null && commercial.factory.powerCapacityKW > 0 && (
            <SpecItem label="Power Capacity" value={`${commercial.factory.powerCapacityKW} KW`} icon={Zap} />
          )}
          {commercial.factory.hazardZone && commercial.factory.hazardZone !== 'none' && HAZARD_LABELS[commercial.factory.hazardZone] && (
            <SpecItem
              label="Hazard Level"
              value={HAZARD_LABELS[commercial.factory.hazardZone]}
              icon={AlertTriangle}
            />
          )}
          {commercial.factory.industrialLicense && commercial.factory.industrialLicense.trim() !== '' && (
            <SpecItem label="Industrial License" value={commercial.factory.industrialLicense} icon={Info} />
          )}
        </>
      )}

      {/* Retail Specifics */}
      {isRetailType && commercial.retail && (
        <>
          {commercial.retail.frontageWidth !== undefined && commercial.retail.frontageWidth !== null && commercial.retail.frontageWidth > 0 && (
            <SpecItem label="Shop Frontage" value={`${commercial.retail.frontageWidth} m`} icon={Move} />
          )}
          {commercial.retail.hasStorageRoom === true && (
            <SpecItem label="Storage Room" value="Yes" icon={Box} />
          )}
          {commercial.retail.ceilingHeight !== undefined && commercial.retail.ceilingHeight !== null && commercial.retail.ceilingHeight > 0 && (
            <SpecItem label="Ceiling Height" value={`${commercial.retail.ceilingHeight} m`} icon={Move} />
          )}
        </>
      )}

      {/* Medical Specifics */}
      {isMedicalType && commercial.medical && (
        <>
          {commercial.medical.hasWaitingRoom === true && (
            <SpecItem label="Waiting Room" value="Yes" icon={Sparkles} />
          )}
          {commercial.medical.medicalLicense && commercial.medical.medicalLicense.trim() !== '' && (
            <SpecItem label="Medical License" value={commercial.medical.medicalLicense} icon={Info} />
          )}
          {commercial.medical.numberOfExamRooms !== undefined && commercial.medical.numberOfExamRooms !== null && commercial.medical.numberOfExamRooms > 0 && (
            <SpecItem label="Exam Rooms" value={commercial.medical.numberOfExamRooms} icon={Home} />
          )}
        </>
      )}
    </>
  )
}
