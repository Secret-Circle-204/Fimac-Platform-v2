import React from 'react'
import { SpecItem } from './SpecItem'
import {
  Key,
  Sparkles,
  Award,
  Building,
  Home,
  ParkingCircle,
  Move,
  Waves,
  Zap,
  Tent,
  Layers,
  Calendar,
  Utensils,
} from 'lucide-react'
import type { Property } from '@/payload-types'

interface HospitalitySpecsProps {
  hospitality: NonNullable<Property['hospitality']>
  propertyTypeSlug?: string
}

export const HospitalitySpecs: React.FC<HospitalitySpecsProps> = ({
  hospitality,
  propertyTypeSlug,
}) => {
  const isHotelType = propertyTypeSlug === 'hotel' || propertyTypeSlug === 'boutique-hotel'
  const isMotelType = propertyTypeSlug === 'motel'
  const isResortType = propertyTypeSlug === 'resort'
  const isCampType = propertyTypeSlug === 'camp' || propertyTypeSlug === 'eco-lodge'

  return (
    <>
      {/* Common Hospitality Specifications */}
      {hospitality.totalRooms !== undefined && hospitality.totalRooms !== null && hospitality.totalRooms > 0 && (
        <SpecItem label="Total Rooms" value={`${hospitality.totalRooms} Rooms`} icon={Key} />
      )}
      {hospitality.floors !== undefined && hospitality.floors !== null && hospitality.floors > 0 && (
        <SpecItem label="Floors" value={`${hospitality.floors} Floors`} icon={Layers} />
      )}
      {hospitality.starRating && (
        <SpecItem label="Star Rating" value={`${hospitality.starRating} Stars`} icon={Award} />
      )}
      {hospitality.brand && hospitality.brand.trim() !== '' && (
        <SpecItem label="Management Brand" value={hospitality.brand} icon={Sparkles} />
      )}
      {hospitality.lastRenovationYear !== undefined && hospitality.lastRenovationYear !== null && hospitality.lastRenovationYear > 0 && (
        <SpecItem label="Last Renovated" value={hospitality.lastRenovationYear} icon={Calendar} />
      )}
      {hospitality.hasBeachAccess === true && (
        <SpecItem label="Beach Access" value="Available" icon={Waves} />
      )}

      {/* Hotel / Boutique Hotel Specifics */}
      {isHotelType && hospitality.hotel && (
        <>
          {hospitality.hotel.suites !== undefined && hospitality.hotel.suites !== null && hospitality.hotel.suites > 0 && (
            <SpecItem label="Total Suites" value={`${hospitality.hotel.suites} Suites`} icon={Building} />
          )}
          {hospitality.hotel.restaurants !== undefined && hospitality.hotel.restaurants !== null && hospitality.hotel.restaurants > 0 && (
            <SpecItem
              label="Restaurants"
              value={`${hospitality.hotel.restaurants} Restaurants`}
              icon={Utensils}
            />
          )}
          {hospitality.hotel.conferenceRooms !== undefined && hospitality.hotel.conferenceRooms !== null && hospitality.hotel.conferenceRooms > 0 && (
            <SpecItem
              label="Meeting Rooms"
              value={`${hospitality.hotel.conferenceRooms} Rooms`}
              icon={Home}
            />
          )}
        </>
      )}

      {/* Motel Specifics */}
      {isMotelType && hospitality.motel && (
        <>
          {hospitality.motel.parkingSpaces !== undefined && hospitality.motel.parkingSpaces !== null && hospitality.motel.parkingSpaces > 0 && (
            <SpecItem
              label="Parking Spaces"
              value={`${hospitality.motel.parkingSpaces} Spaces`}
              icon={ParkingCircle}
            />
          )}
          {hospitality.motel.driveUpRooms === true && (
            <SpecItem label="Drive-up Rooms" value="Yes" icon={Key} />
          )}
          {hospitality.motel.isHighwayAccess === true && (
            <SpecItem label="Highway Access" value="Yes" icon={Move} />
          )}
        </>
      )}

      {/* Resort Specifics */}
      {isResortType && hospitality.resort && (
        <>
          {hospitality.resort.suites !== undefined && hospitality.resort.suites !== null && hospitality.resort.suites > 0 && (
            <SpecItem label="Total Suites" value={`${hospitality.resort.suites} Suites`} icon={Building} />
          )}
          {hospitality.resort.hasPrivateBeach === true && (
            <SpecItem label="Private Beach" value="Yes" icon={Waves} />
          )}
          {hospitality.resort.hasGolfCourse === true && (
            <SpecItem label="Golf Course" value="Yes" icon={Sparkles} />
          )}
        </>
      )}

      {/* Camp Specifics */}
      {isCampType && hospitality.camp && (
        <>
          {hospitality.camp.tentCapacity !== undefined && hospitality.camp.tentCapacity !== null && hospitality.camp.tentCapacity > 0 && (
            <SpecItem label="Tent Capacity" value={`${hospitality.camp.tentCapacity} Guests`} icon={Tent} />
          )}
          {hospitality.camp.hasShowers === true && (
            <SpecItem label="Showers" value="Available" icon={Waves} />
          )}
          {hospitality.camp.hasElectricity === true && (
            <SpecItem label="Electricity" value="Available" icon={Zap} />
          )}
        </>
      )}
    </>
  )
}
