import type { Field } from 'payload'
import type { Property } from '@/payload-types'

export type SpecIconKey =
  | 'bed'
  | 'bath'
  | 'layers'
  | 'calendar'
  | 'flame'
  | 'pool'
  | 'trees'
  | 'car'
  | 'warehouse'
  | 'wifi'
  | 'shield'
  | 'coffee'
  | 'zap'
  | 'store'
  | 'activity'
  | 'utensils'
  | 'building'
  | 'compass'
  | 'tent'
  | 'map'
  | 'grid'
  | 'droplet'
  | 'arrow-up-down'
  | 'percent'
  | 'file-text'
  | 'gauge'
  | 'door-closed'
  | 'thermometer'
  | 'star'
  | 'flag' // Added flag icon for golf/marking

export interface SpecFieldDefinition {
  name: string
  path: string // e.g. 'commercial.office.meetingRooms'
  label: {
    en: string
    ar: string
  }
  iconKey: SpecIconKey
  type: 'number' | 'text' | 'checkbox' | 'select'
  category: 'residential' | 'commercial' | 'hospitality' | 'land'
  subGroup: string // 'common' or subgroup name like 'office', 'warehouse', 'villa', etc.
  selectOptions?: { label: string; value: string }[]
  unit?: string | null
  // Optional condition to restrict visibility in Admin UI
  adminCondition?: (data: Record<string, unknown>, siblingData: Record<string, unknown>) => boolean
}

export const ALL_SPEC_FIELDS: Record<string, SpecFieldDefinition> = {
  // Residential - Common
  'residential.bedrooms': {
    name: 'bedrooms',
    path: 'residential.bedrooms',
    label: { en: 'Bedrooms', ar: 'غرف النوم' },
    iconKey: 'bed',
    type: 'number',
    category: 'residential',
    subGroup: 'common',
  },
  'residential.bathrooms': {
    name: 'bathrooms',
    path: 'residential.bathrooms',
    label: { en: 'Bathrooms', ar: 'الحمامات' },
    iconKey: 'bath',
    type: 'number',
    category: 'residential',
    subGroup: 'common',
  },
  'residential.floor': {
    name: 'floor',
    path: 'residential.floor',
    label: { en: 'Floor Number', ar: 'رقم الطابق' },
    iconKey: 'layers',
    type: 'number',
    category: 'residential',
    subGroup: 'common',
  },
  'residential.floors': {
    name: 'floors',
    path: 'residential.floors',
    label: { en: 'Total Floors', ar: 'إجمالي الطوابق' },
    iconKey: 'layers',
    type: 'number',
    category: 'residential',
    subGroup: 'common',
  },
  'residential.yearBuilt': {
    name: 'yearBuilt',
    path: 'residential.yearBuilt',
    label: { en: 'Year Built', ar: 'سنة البناء' },
    iconKey: 'calendar',
    type: 'number',
    category: 'residential',
    subGroup: 'common',
  },
  'residential.heatingType': {
    name: 'heatingType',
    path: 'residential.heatingType',
    label: { en: 'Heating Type', ar: 'نوع التدفئة' },
    iconKey: 'flame',
    type: 'select',
    category: 'residential',
    subGroup: 'common',
    selectOptions: [
      { label: 'Central', value: 'central' },
      { label: 'Electric', value: 'electric' },
      { label: 'Gas', value: 'gas' },
      { label: 'Oil', value: 'oil' },
      { label: 'Propane', value: 'propane' },
    ],
  },

  // Residential - Villa Subgroup
  'residential.villa.pools': {
    name: 'pools',
    path: 'residential.villa.pools',
    label: { en: 'Swimming Pools', ar: 'حمامات السباحة' },
    iconKey: 'pool',
    type: 'number',
    category: 'residential',
    subGroup: 'villa',
  },
  'residential.villa.hasGarden': {
    name: 'hasGarden',
    path: 'residential.villa.hasGarden',
    label: { en: 'Garden', ar: 'حديقة' },
    iconKey: 'trees',
    type: 'checkbox',
    category: 'residential',
    subGroup: 'villa',
  },
  'residential.villa.hasGarage': {
    name: 'hasGarage',
    path: 'residential.villa.hasGarage',
    label: { en: 'Garage', ar: 'مرآب' },
    iconKey: 'car',
    type: 'checkbox',
    category: 'residential',
    subGroup: 'villa',
  },
  'residential.villa.hasMajlis': {
    name: 'hasMajlis',
    path: 'residential.villa.hasMajlis',
    label: { en: 'Majlis', ar: 'مجلس' },
    iconKey: 'building',
    type: 'checkbox',
    category: 'residential',
    subGroup: 'villa',
  },
  'residential.villa.hasDriverRoom': {
    name: 'hasDriverRoom',
    path: 'residential.villa.hasDriverRoom',
    label: { en: 'Driver Room', ar: 'غرفة سائق' },
    iconKey: 'door-closed',
    type: 'checkbox',
    category: 'residential',
    subGroup: 'villa',
  },
  'residential.villa.hasMaidRoom': {
    name: 'hasMaidRoom',
    path: 'residential.villa.hasMaidRoom',
    label: { en: 'Maid Room', ar: 'غرفة عاملة' },
    iconKey: 'door-closed',
    type: 'checkbox',
    category: 'residential',
    subGroup: 'villa',
  },

  // Residential - Apartment Subgroup
  'residential.apartment.hasBalcony': {
    name: 'hasBalcony',
    path: 'residential.apartment.hasBalcony',
    label: { en: 'Balcony', ar: 'شرفة' },
    iconKey: 'building',
    type: 'checkbox',
    category: 'residential',
    subGroup: 'apartment',
  },
  'residential.apartment.hasMaidRoom': {
    name: 'hasMaidRoom',
    path: 'residential.apartment.hasMaidRoom',
    label: { en: 'Maid Room', ar: 'غرفة عاملة' },
    iconKey: 'door-closed',
    type: 'checkbox',
    category: 'residential',
    subGroup: 'apartment',
  },

  // Residential - Chalet Subgroup
  'residential.chalet.hasPool': {
    name: 'hasPool',
    path: 'residential.chalet.hasPool',
    label: { en: 'Private Pool', ar: 'حمام سباحة خاص' },
    iconKey: 'pool',
    type: 'checkbox',
    category: 'residential',
    subGroup: 'chalet',
  },
  'residential.chalet.hasGarden': {
    name: 'hasGarden',
    path: 'residential.chalet.hasGarden',
    label: { en: 'Garden', ar: 'حديقة' },
    iconKey: 'trees',
    type: 'checkbox',
    category: 'residential',
    subGroup: 'chalet',
  },
  'residential.chalet.isBeachfront': {
    name: 'isBeachfront',
    path: 'residential.chalet.isBeachfront',
    label: { en: 'Beachfront', ar: 'على الشاطئ' },
    iconKey: 'compass',
    type: 'checkbox',
    category: 'residential',
    subGroup: 'chalet',
  },

  // Commercial - Common
  'commercial.floor': {
    name: 'floor',
    path: 'commercial.floor',
    label: { en: 'Floor Number', ar: 'رقم الطابق' },
    iconKey: 'layers',
    type: 'number',
    category: 'commercial',
    subGroup: 'common',
  },
  'commercial.parkingSpaces': {
    name: 'parkingSpaces',
    path: 'commercial.parkingSpaces',
    label: { en: 'Parking Spaces', ar: 'مواقف السيارات' },
    iconKey: 'car',
    type: 'number',
    category: 'commercial',
    subGroup: 'common',
  },
  'commercial.licenseType': {
    name: 'licenseType',
    path: 'commercial.licenseType',
    label: { en: 'License Type', ar: 'نوع الترخيص' },
    iconKey: 'file-text',
    type: 'text',
    category: 'commercial',
    subGroup: 'common',
  },

  // Commercial - Office
  'commercial.office.meetingRooms': {
    name: 'meetingRooms',
    path: 'commercial.office.meetingRooms',
    label: { en: 'Meeting Rooms', ar: 'غرف الاجتماعات' },
    iconKey: 'building',
    type: 'number',
    category: 'commercial',
    subGroup: 'office',
  },
  'commercial.office.hasReception': {
    name: 'hasReception',
    path: 'commercial.office.hasReception',
    label: { en: 'Reception', ar: 'استقبال' },
    iconKey: 'door-closed',
    type: 'checkbox',
    category: 'commercial',
    subGroup: 'office',
  },
  'commercial.office.internetType': {
    name: 'internetType',
    path: 'commercial.office.internetType',
    label: { en: 'Internet Type', ar: 'نوع الإنترنت' },
    iconKey: 'wifi',
    type: 'select',
    category: 'commercial',
    subGroup: 'office',
    selectOptions: [
      { label: 'Fiber', value: 'fiber' },
      { label: 'ADSL', value: 'adsl' },
      { label: 'None', value: 'none' },
    ],
  },
  'commercial.office.securityLevel': {
    name: 'securityLevel',
    path: 'commercial.office.securityLevel',
    label: { en: 'Security Level', ar: 'مستوى الأمن' },
    iconKey: 'shield',
    type: 'select',
    category: 'commercial',
    subGroup: 'office',
    selectOptions: [
      { label: '24/7 Security', value: '24_7' },
      { label: 'Business Hours', value: 'business_hours' },
      { label: 'None', value: 'none' },
    ],
  },
  'commercial.office.elevators': {
    name: 'elevators',
    path: 'commercial.office.elevators',
    label: { en: 'Elevators', ar: 'المصاعد' },
    iconKey: 'arrow-up-down',
    type: 'number',
    category: 'commercial',
    subGroup: 'office',
  },

  // Commercial - Restaurant
  'commercial.restaurant.kitchenCount': {
    name: 'kitchenCount',
    path: 'commercial.restaurant.kitchenCount',
    label: { en: 'Kitchen Count', ar: 'عدد المطابخ' },
    iconKey: 'utensils',
    type: 'number',
    category: 'commercial',
    subGroup: 'restaurant',
  },
  'commercial.restaurant.hasExhaust': {
    name: 'hasExhaust',
    path: 'commercial.restaurant.hasExhaust',
    label: { en: 'Exhaust System', ar: 'نظام تهوية' },
    iconKey: 'flame',
    type: 'checkbox',
    category: 'commercial',
    subGroup: 'restaurant',
  },
  'commercial.restaurant.hasGasConnection': {
    name: 'hasGasConnection',
    path: 'commercial.restaurant.hasGasConnection',
    label: { en: 'Gas Connection', ar: 'توصيل غاز' },
    iconKey: 'flame',
    type: 'checkbox',
    category: 'commercial',
    subGroup: 'restaurant',
  },
  'commercial.restaurant.outdoorSeatingCapacity': {
    name: 'outdoorSeatingCapacity',
    path: 'commercial.restaurant.outdoorSeatingCapacity',
    label: { en: 'Outdoor Seating Capacity', ar: 'سعة الجلوس الخارجية' },
    iconKey: 'coffee',
    type: 'number',
    category: 'commercial',
    subGroup: 'restaurant',
  },

  // Commercial - Warehouse
  'commercial.warehouse.loadingDocks': {
    name: 'loadingDocks',
    path: 'commercial.warehouse.loadingDocks',
    label: { en: 'Loading Docks', ar: 'أرصفة الشحن' },
    iconKey: 'warehouse',
    type: 'number',
    category: 'commercial',
    subGroup: 'warehouse',
  },
  'commercial.warehouse.ceilingHeight': {
    name: 'ceilingHeight',
    path: 'commercial.warehouse.ceilingHeight',
    label: { en: 'Ceiling Height', ar: 'ارتفاع السقف' },
    iconKey: 'arrow-up-down',
    type: 'number',
    category: 'commercial',
    subGroup: 'warehouse',
    unit: 'm',
  },
  'commercial.warehouse.hasTruckAccess': {
    name: 'hasTruckAccess',
    path: 'commercial.warehouse.hasTruckAccess',
    label: { en: 'Truck Access', ar: 'مدخل شاحنات' },
    iconKey: 'car',
    type: 'checkbox',
    category: 'commercial',
    subGroup: 'warehouse',
  },
  'commercial.warehouse.fireSystem': {
    name: 'fireSystem',
    path: 'commercial.warehouse.fireSystem',
    label: { en: 'Fire System Type', ar: 'نوع نظام الحريق' },
    iconKey: 'flame',
    type: 'select',
    category: 'commercial',
    subGroup: 'warehouse',
    selectOptions: [
      { label: 'Sprinkler', value: 'sprinkler' },
      { label: 'Extinguisher', value: 'extinguisher' },
      { label: 'Full System', value: 'full' },
      { label: 'None', value: 'none' },
    ],
  },

  // Commercial - Factory
  'commercial.factory.powerCapacityKW': {
    name: 'powerCapacityKW',
    path: 'commercial.factory.powerCapacityKW',
    label: { en: 'Power Capacity', ar: 'قدرة الكهرباء' },
    iconKey: 'zap',
    type: 'number',
    category: 'commercial',
    subGroup: 'factory',
    unit: 'kW',
  },
  'commercial.factory.hazardZone': {
    name: 'hazardZone',
    path: 'commercial.factory.hazardZone',
    label: { en: 'Hazard Zone Level', ar: 'مستوى منطقة الخطورة' },
    iconKey: 'shield',
    type: 'select',
    category: 'commercial',
    subGroup: 'factory',
    selectOptions: [
      { label: 'None', value: 'none' },
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
    ],
  },
  'commercial.factory.industrialLicense': {
    name: 'industrialLicense',
    path: 'commercial.factory.industrialLicense',
    label: { en: 'Industrial License', ar: 'الترخيص الصناعي' },
    iconKey: 'file-text',
    type: 'text',
    category: 'commercial',
    subGroup: 'factory',
  },

  // Commercial - Retail
  'commercial.retail.frontageWidth': {
    name: 'frontageWidth',
    path: 'commercial.retail.frontageWidth',
    label: { en: 'Frontage Width', ar: 'عرض الواجهة' },
    iconKey: 'arrow-up-down',
    type: 'number',
    category: 'commercial',
    subGroup: 'retail',
    unit: 'm',
  },
  'commercial.retail.hasStorageRoom': {
    name: 'hasStorageRoom',
    path: 'commercial.retail.hasStorageRoom',
    label: { en: 'Storage Room', ar: 'غرفة تخزين' },
    iconKey: 'warehouse',
    type: 'checkbox',
    category: 'commercial',
    subGroup: 'retail',
  },
  'commercial.retail.ceilingHeight': {
    name: 'ceilingHeight',
    path: 'commercial.retail.ceilingHeight',
    label: { en: 'Ceiling Height', ar: 'ارتفاع السقف' },
    iconKey: 'arrow-up-down',
    type: 'number',
    category: 'commercial',
    subGroup: 'retail',
    unit: 'm',
  },

  // Commercial - Medical
  'commercial.medical.hasWaitingRoom': {
    name: 'hasWaitingRoom',
    path: 'commercial.medical.hasWaitingRoom',
    label: { en: 'Waiting Room', ar: 'غرفة انتظار' },
    iconKey: 'door-closed',
    type: 'checkbox',
    category: 'commercial',
    subGroup: 'medical',
  },
  'commercial.medical.medicalLicense': {
    name: 'medicalLicense',
    path: 'commercial.medical.medicalLicense',
    label: { en: 'Medical License Type', ar: 'نوع الترخيص الطبي' },
    iconKey: 'file-text',
    type: 'text',
    category: 'commercial',
    subGroup: 'medical',
  },
  'commercial.medical.numberOfExamRooms': {
    name: 'numberOfExamRooms',
    path: 'commercial.medical.numberOfExamRooms',
    label: { en: 'Exam Rooms Count', ar: 'عدد غرف الفحص' },
    iconKey: 'activity',
    type: 'number',
    category: 'commercial',
    subGroup: 'medical',
  },

  // Hospitality - Common
  'hospitality.totalRooms': {
    name: 'totalRooms',
    path: 'hospitality.totalRooms',
    label: { en: 'Total Rooms/Keys', ar: 'إجمالي الغرف/المفاتيح' },
    iconKey: 'door-closed',
    type: 'number',
    category: 'hospitality',
    subGroup: 'common',
  },
  'hospitality.floors': {
    name: 'floors',
    path: 'hospitality.floors',
    label: { en: 'Total Floors', ar: 'إجمالي الطوابق' },
    iconKey: 'layers',
    type: 'number',
    category: 'hospitality',
    subGroup: 'common',
  },
  'hospitality.starRating': {
    name: 'starRating',
    path: 'hospitality.starRating',
    label: { en: 'Star Rating', ar: 'تصنيف النجوم' },
    iconKey: 'star',
    type: 'select',
    category: 'hospitality',
    subGroup: 'common',
    selectOptions: [
      { label: '1 Star', value: '1' },
      { label: '2 Stars', value: '2' },
      { label: '3 Stars', value: '3' },
      { label: '4 Stars', value: '4' },
      { label: '5 Stars', value: '5' },
    ],
  },
  'hospitality.brand': {
    name: 'brand',
    path: 'hospitality.brand',
    label: { en: 'Operating Brand', ar: 'العلامة التجارية التشغيلية' },
    iconKey: 'building',
    type: 'text',
    category: 'hospitality',
    subGroup: 'common',
  },
  'hospitality.lastRenovationYear': {
    name: 'lastRenovationYear',
    path: 'hospitality.lastRenovationYear',
    label: { en: 'Last Renovation Year', ar: 'سنة آخر تجديد' },
    iconKey: 'calendar',
    type: 'number',
    category: 'hospitality',
    subGroup: 'common',
  },
  'hospitality.hasBeachAccess': {
    name: 'hasBeachAccess',
    path: 'hospitality.hasBeachAccess',
    label: { en: 'Has a beach', ar: 'دخول الشاطئ' },
    iconKey: 'pool',
    type: 'checkbox',
    category: 'hospitality',
    subGroup: 'common',
  },

  // Hospitality - Hotel
  'hospitality.hotel.suites': {
    name: 'suites',
    path: 'hospitality.hotel.suites',
    label: { en: 'Suites Count', ar: 'عدد الأجنحة' },
    iconKey: 'door-closed',
    type: 'number',
    category: 'hospitality',
    subGroup: 'hotel',
  },
  'hospitality.hotel.restaurants': {
    name: 'restaurants',
    path: 'hospitality.hotel.restaurants',
    label: { en: 'Restaurants Count', ar: 'عدد المطاعم' },
    iconKey: 'utensils',
    type: 'number',
    category: 'hospitality',
    subGroup: 'hotel',
  },
  'hospitality.hotel.conferenceRooms': {
    name: 'conferenceRooms',
    path: 'hospitality.hotel.conferenceRooms',
    label: { en: 'Conference Rooms', ar: 'قاعات المؤتمرات' },
    iconKey: 'building',
    type: 'number',
    category: 'hospitality',
    subGroup: 'hotel',
  },

  // Hospitality - Motel
  'hospitality.motel.parkingSpaces': {
    name: 'parkingSpaces',
    path: 'hospitality.motel.parkingSpaces',
    label: { en: 'Guest Parking Spaces', ar: 'مواقف سيارات النزلاء' },
    iconKey: 'car',
    type: 'number',
    category: 'hospitality',
    subGroup: 'motel',
  },
  'hospitality.motel.driveUpRooms': {
    name: 'driveUpRooms',
    path: 'hospitality.motel.driveUpRooms',
    label: { en: 'Drive-Up Access Rooms', ar: 'غرف بمدخل سيارة' },
    iconKey: 'car',
    type: 'checkbox',
    category: 'hospitality',
    subGroup: 'motel',
  },
  'hospitality.motel.isHighwayAccess': {
    name: 'isHighwayAccess',
    path: 'hospitality.motel.isHighwayAccess',
    label: { en: 'Highway Access', ar: 'مدخل على الطريق السريع' },
    iconKey: 'compass',
    type: 'checkbox',
    category: 'hospitality',
    subGroup: 'motel',
  },

  // Hospitality - Resort
  'hospitality.resort.suites': {
    name: 'suites',
    path: 'hospitality.resort.suites',
    label: { en: 'Suites Count', ar: 'عدد الأجنحة' },
    iconKey: 'door-closed',
    type: 'number',
    category: 'hospitality',
    subGroup: 'resort',
  },
  'hospitality.resort.hasPrivateBeach': {
    name: 'hasPrivateBeach',
    path: 'hospitality.resort.hasPrivateBeach',
    label: { en: 'Private Beach', ar: 'شاطئ خاص' },
    iconKey: 'pool',
    type: 'checkbox',
    category: 'hospitality',
    subGroup: 'resort',
  },
  'hospitality.resort.privateBeachArea': {
    name: 'privateBeachArea',
    path: 'hospitality.resort.privateBeachArea',
    label: { en: 'Private Beach', ar: 'مساحة الشاطئ الخاص' },
    iconKey: 'pool',
    type: 'number',
    category: 'hospitality',
    subGroup: 'resort',
    unit: 'm²',
    adminCondition: (data, siblingData) => {
      return typeof siblingData === 'object' && siblingData !== null && 'hasPrivateBeach' in siblingData && !!siblingData.hasPrivateBeach
    },
  },
  'hospitality.resort.hasGolfCourse': {
    name: 'hasGolfCourse',
    path: 'hospitality.resort.hasGolfCourse',
    label: { en: 'Golf Course', ar: 'ملعب جولف' },
    iconKey: 'flag', // Changed iconKey from 'compass' to 'flag' for golf green
    type: 'checkbox',
    category: 'hospitality',
    subGroup: 'resort',
  },

  // Hospitality - Camp
  'hospitality.camp.tentCapacity': {
    name: 'tentCapacity',
    path: 'hospitality.camp.tentCapacity',
    label: { en: 'Tent Capacity', ar: 'سعة الخيام' },
    iconKey: 'tent',
    type: 'number',
    category: 'hospitality',
    subGroup: 'camp',
  },
  'hospitality.camp.hasShowers': {
    name: 'hasShowers',
    path: 'hospitality.camp.hasShowers',
    label: { en: 'Showers', ar: 'حمامات استحمام' },
    iconKey: 'droplet',
    type: 'checkbox',
    category: 'hospitality',
    subGroup: 'camp',
  },
  'hospitality.camp.hasElectricity': {
    name: 'hasElectricity',
    path: 'hospitality.camp.hasElectricity',
    label: { en: 'Electricity', ar: 'كهرباء' },
    iconKey: 'zap',
    type: 'checkbox',
    category: 'hospitality',
    subGroup: 'camp',
  },

  // Land - Common
  'land.zoning': {
    name: 'zoning',
    path: 'land.zoning',
    label: { en: 'Zoning Classification', ar: 'تصنيف المخطط' },
    iconKey: 'map',
    type: 'select',
    category: 'land',
    subGroup: 'common',
    selectOptions: [
      { label: 'Residential', value: 'residential' },
      { label: 'Commercial', value: 'commercial' },
      { label: 'Industrial', value: 'industrial' },
      { label: 'Agricultural', value: 'agricultural' },
      { label: 'Mixed Use', value: 'mixed' },
    ],
  },
  'land.roadWidth': {
    name: 'roadWidth',
    path: 'land.roadWidth',
    label: { en: 'Facing Road Width', ar: 'عرض الشارع المقابل' },
    iconKey: 'arrow-up-down',
    type: 'number',
    category: 'land',
    subGroup: 'common',
    unit: 'm',
  },
  'land.frontageWidth': {
    name: 'frontageWidth',
    path: 'land.frontageWidth',
    label: { en: 'Frontage Width', ar: 'عرض الواجهة' },
    iconKey: 'arrow-up-down',
    type: 'number',
    category: 'land',
    subGroup: 'common',
    unit: 'm',
  },
  'land.hasUtilities': {
    name: 'hasUtilities',
    path: 'land.hasUtilities',
    label: { en: 'Utilities Connections', ar: 'توصيلات مرافق' },
    iconKey: 'zap',
    type: 'checkbox',
    category: 'land',
    subGroup: 'common',
  },
  'land.allowedFloors': {
    name: 'allowedFloors',
    path: 'land.allowedFloors',
    label: { en: 'Allowed Building Floors', ar: 'طوابق البناء المسموح بها' },
    iconKey: 'layers',
    type: 'number',
    category: 'land',
    subGroup: 'common',
  },
  'land.buildingRatio': {
    name: 'buildingRatio',
    path: 'land.buildingRatio',
    label: { en: 'Building Footprint Ratio', ar: 'نسبة البناء المسموح بها' },
    iconKey: 'percent',
    type: 'number',
    category: 'land',
    subGroup: 'common',
    unit: '%',
  },
  'land.isCorner': {
    name: 'isCorner',
    path: 'land.isCorner',
    label: { en: 'Corner Plot', ar: 'أرض ناصية' },
    iconKey: 'compass',
    type: 'checkbox',
    category: 'land',
    subGroup: 'common',
  },
  'land.slope': {
    name: 'slope',
    path: 'land.slope',
    label: { en: 'Land Gradient/Slope', ar: 'انحدار الأرض' },
    iconKey: 'arrow-up-down',
    type: 'select',
    category: 'land',
    subGroup: 'common',
    selectOptions: [
      { label: 'Flat', value: 'flat' },
      { label: 'Gentle Slope', value: 'gentle' },
      { label: 'Moderate Slope', value: 'moderate' },
      { label: 'Steep Slope', value: 'steep' },
    ],
  },
  'land.soilType': {
    name: 'soilType',
    path: 'land.soilType',
    label: { en: 'Soil Type', ar: 'نوع التربة' },
    iconKey: 'grid',
    type: 'text',
    category: 'land',
    subGroup: 'common',
  },
}

export const PROFILES: Record<string, string[]> = {
  villa: [
    'residential.villa.pools',
    'residential.villa.hasGarden',
    'residential.villa.hasGarage',
    'residential.villa.hasMajlis',
    'residential.villa.hasDriverRoom',
    'residential.villa.hasMaidRoom',
  ],
  apartment: [
    'residential.apartment.hasBalcony',
    'residential.apartment.hasMaidRoom',
  ],
  chalet: [
    'residential.chalet.hasPool',
    'residential.chalet.hasGarden',
    'residential.chalet.isBeachfront',
  ],
  office: [
    'commercial.office.meetingRooms',
    'commercial.office.hasReception',
    'commercial.office.internetType',
    'commercial.office.securityLevel',
    'commercial.office.elevators',
  ],
  restaurant: [
    'commercial.restaurant.kitchenCount',
    'commercial.restaurant.hasExhaust',
    'commercial.restaurant.hasGasConnection',
    'commercial.restaurant.outdoorSeatingCapacity',
  ],
  warehouse: [
    'commercial.warehouse.loadingDocks',
    'commercial.warehouse.ceilingHeight',
    'commercial.warehouse.hasTruckAccess',
    'commercial.warehouse.fireSystem',
  ],
  factory: [
    'commercial.factory.powerCapacityKW',
    'commercial.factory.hazardZone',
    'commercial.factory.industrialLicense',
  ],
  retail: [
    'commercial.retail.frontageWidth',
    'commercial.retail.hasStorageRoom',
    'commercial.retail.ceilingHeight',
  ],
  medical: [
    'commercial.medical.hasWaitingRoom',
    'commercial.medical.medicalLicense',
    'commercial.medical.numberOfExamRooms',
  ],
  hotel: [
    'hospitality.hotel.suites',
    'hospitality.hotel.restaurants',
    'hospitality.hotel.conferenceRooms',
  ],
  motel: [
    'hospitality.motel.parkingSpaces',
    'hospitality.motel.driveUpRooms',
    'hospitality.motel.isHighwayAccess',
  ],
  resort: [
    'hospitality.resort.suites',
    'hospitality.resort.hasPrivateBeach',
    'hospitality.resort.privateBeachArea',
    'hospitality.resort.hasGolfCourse',
  ],
  camp: [
    'hospitality.camp.tentCapacity',
    'hospitality.camp.hasShowers',
    'hospitality.camp.hasElectricity',
  ],
  land: [
    'land.zoning',
    'land.roadWidth',
    'land.frontageWidth',
    'land.hasUtilities',
    'land.allowedFloors',
    'land.buildingRatio',
    'land.isCorner',
    'land.slope',
    'land.soilType',
  ],
  none: [],
}

export const PROFILE_MAP: Record<string, string> = {
  // Commercial
  office: 'office',
  'business-center': 'office',
  'coworking-space': 'office',
  'retail-shop': 'retail',
  showroom: 'retail',
  restaurant: 'restaurant',
  cafe: 'restaurant',
  warehouse: 'warehouse',
  factory: 'factory',
  workshop: 'factory',
  clinic: 'medical',

  // Residential
  apartment: 'apartment',
  studio: 'apartment',
  duplex: 'apartment',
  'serviced-apartment': 'apartment',
  loft: 'apartment',
  villa: 'villa',
  penthouse: 'villa',
  'townhouse': 'villa',
  'twin-house': 'villa',
  'farm-house': 'villa',
  mansion: 'villa',
  palace: 'villa',
  chalet: 'chalet',
  cabin: 'chalet',

  // Hospitality
  hotel: 'hotel',
  'boutique-hotel': 'hotel',
  aparthotel: 'hotel',
  'hotel-apartment': 'hotel',
  resort: 'resort',
  'holiday-village': 'resort',
  motel: 'motel',
  'guest-house': 'motel',
  hostel: 'motel',
  'bed-and-breakfast': 'motel',
  camp: 'camp',
  'glamping-site': 'camp',
  'eco-lodge': 'camp',
  lodge: 'camp',

  // Land
  'residential-land': 'land',
  'commercial-land': 'land',
  'industrial-land': 'land',
  'agricultural-land': 'land',
  'mixed-use-land': 'land',
  'investment-land': 'land',
  'farm-land': 'land',
  'desert-land': 'land',
  'coastal-land': 'land',
  'mountain-land': 'land',
  island: 'land',
  'development-site': 'land',
  'building-plot': 'land',
}

export function buildSpecField(spec: SpecFieldDefinition): Field {
  const baseConfig = {
    name: spec.name,
    label: spec.label.en,
    index: false,
  }

  const admin: {
    description?: string
    condition?: (data: Record<string, unknown>, siblingData: Record<string, unknown>) => boolean
    disableListColumn?: boolean
    disableListFilter?: boolean
  } = {
    disableListColumn: true,
    disableListFilter: true,
  }
  if (spec.unit) {
    admin.description = `Unit: ${spec.unit}`
  }
  if (spec.adminCondition) {
    admin.condition = spec.adminCondition
  }

  const hasAdmin = Object.keys(admin).length > 0

  if (spec.type === 'select') {
    return {
      ...baseConfig,
      type: 'select',
      options: spec.selectOptions || [],
      admin: hasAdmin ? admin : undefined,
    }
  }

  if (spec.type === 'checkbox') {
    return {
      ...baseConfig,
      type: 'checkbox',
      admin: hasAdmin ? admin : undefined,
    }
  }

  if (spec.type === 'number') {
    return {
      ...baseConfig,
      type: 'number',
      admin: hasAdmin ? admin : undefined,
    }
  }

  return {
    ...baseConfig,
    type: 'text',
    admin: hasAdmin ? admin : undefined,
  }
}

export function buildCategoryFields(category: 'residential' | 'commercial' | 'hospitality' | 'land'): Field[] {
  const categorySpecs = Object.values(ALL_SPEC_FIELDS).filter((spec) => spec.category === category)

  // 1. Get flat common specs (where subGroup is 'common')
  const commonFields = categorySpecs
    .filter((spec) => spec.subGroup === 'common')
    .map(buildSpecField)

  // 2. Get unique sub-groups (excluding 'common')
  const subGroupNames = Array.from(
    new Set(
      categorySpecs.filter((spec) => spec.subGroup !== 'common').map((spec) => spec.subGroup),
    ),
  )

  // 3. For each sub-group, build a Payload group field
  const subGroupFields = subGroupNames.map((subGroupName) => {
    const subGroupSpecs = categorySpecs.filter((spec) => spec.subGroup === subGroupName)
    const childFields = subGroupSpecs.map(buildSpecField)

    return {
      name: subGroupName,
      type: 'group',
      label: `${subGroupName.charAt(0).toUpperCase() + subGroupName.slice(1)} Specifications`,
      admin: {
        condition: (data: Partial<Property> | undefined) => {
          const slug = data?.propertyTypeSlug
          return !!(slug && PROFILE_MAP[slug] === subGroupName)
        },
      },
      fields: childFields,
    } as Field
  })

  return [...commonFields, ...subGroupFields]
}

