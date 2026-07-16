import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import type { Payload } from 'payload'
import type { PropertyType } from '../src/payload-types'
import slugify from 'slugify'

// Define explicit interfaces to enforce strict TS safety without any/as any/suppressions
interface LocationAddress {
  street: string
  city: string
  state: string
  country: string
  zip: string
}

interface LocationGeo {
  lat: number
  lng: number
}

interface SeedProperty {
  typeSlug: string
  title: string
  description: string
  price: number
  currency: 'EGP' | 'USD' | 'EUR'
  area: number
  address: LocationAddress
  geo: LocationGeo
  imageFile: string
  specifications: Record<string, unknown>
  customSpecs?: {
    label: string
    icon?: string
    valueType: 'text' | 'number' | 'date' | 'boolean' | 'url'
    value: string
  }[]
}

const PROPERTIES_TO_SEED: SeedProperty[] = [
  // ==================== RESIDENTIAL ====================
  // --- 1. Villa ---
  {
    typeSlug: 'villa',
    title: 'Elite Luxury Villa in 90th Street',
    description:
      'A magnificent estate located in the prestigious North 90th Street of New Cairo. Featuring state-of-the-art home automation, private swimming pools, and beautifully landscaped gardens. Perfect for upscale family living with spacious rooms, a separate driver room, and maid quarters.',
    price: 35000000,
    currency: 'EGP',
    area: 650,
    address: {
      street: '90th Street North, Block 12',
      city: 'New Cairo',
      state: 'Cairo',
      country: 'Egypt',
      zip: '11835',
    },
    geo: { lat: 30.0074, lng: 31.4913 },
    imageFile: 'villa.png',
    specifications: {
      bedrooms: 5,
      bathrooms: 6,
      floor: 0,
      floors: 3,
      yearBuilt: 2023,
      heatingType: 'central',
      villa: {
        pools: 2,
        hasGarden: true,
        hasGarage: true,
        hasMajlis: true,
        hasDriverRoom: true,
        hasMaidRoom: true,
      },
    },
  },
  {
    typeSlug: 'villa',
    title: 'Modern Classic Mansion in Riyadh Golden District',
    description:
      "A spectacular modern mansion in Riyadh's prestigious Golden Square district. This property combines classic Najdi architectural elements with contemporary high-end luxury interiors. It offers huge terraces, expansive garden spaces, double-height ceilings in the main lobby, and complete privacy.",
    price: 8500000,
    currency: 'USD',
    area: 920,
    address: {
      street: 'Golden District, Villa Compound Rd',
      city: 'Riyadh',
      state: 'Riyadh Province',
      country: 'Saudi Arabia',
      zip: '11564',
    },
    geo: { lat: 24.7136, lng: 46.6753 },
    imageFile: 'building-dreamy.jpg',
    specifications: {
      bedrooms: 6,
      bathrooms: 8,
      floor: 0,
      floors: 3,
      yearBuilt: 2024,
      heatingType: 'central',
      villa: {
        pools: 1,
        hasGarden: true,
        hasGarage: true,
        hasMajlis: true,
        hasDriverRoom: true,
        hasMaidRoom: true,
      },
    },
  },

  // --- 2. Apartment ---
  {
    typeSlug: 'apartment',
    title: 'High-Rise Apartment with Skyline View',
    description:
      'A luxurious apartment located on the upper floors of a premium tower in London, overlooking the Thames. It features panoramic views of the city, high-end marble flooring, and access to a shared clubhouse and private elevator.',
    price: 3200000,
    currency: 'EUR',
    area: 180,
    address: {
      street: 'Tower Block, Albert Embankment',
      city: 'London',
      state: 'Greater London',
      country: 'United Kingdom',
      zip: 'EC1A 1BB',
    },
    geo: { lat: 51.5074, lng: -0.1278 },
    imageFile: 'apartment.png',
    specifications: {
      bedrooms: 3,
      bathrooms: 2,
      floor: 8,
      floors: 12,
      yearBuilt: 2022,
      heatingType: 'gas',
      apartment: {
        hasBalcony: true,
        hasMaidRoom: true,
      },
    },
  },
  {
    typeSlug: 'apartment',
    title: 'Luxury Family Apartment in Dubai Marina',
    description:
      'Located in the family-friendly Dubai Marina district, this apartment offers close proximity to pristine beaches and high-end shopping malls. Upper floor unit with spacious balcony overlooking the yachts.',
    price: 1200000,
    currency: 'USD',
    area: 165,
    address: {
      street: 'Marina Heights, Central Avenue',
      city: 'Dubai',
      state: 'Dubai',
      country: 'United Arab Emirates',
      zip: '00000',
    },
    geo: { lat: 25.2048, lng: 55.2708 },
    imageFile: 'modern.png',
    specifications: {
      bedrooms: 2,
      bathrooms: 2,
      floor: 15,
      floors: 45,
      yearBuilt: 2023,
      heatingType: 'gas',
      apartment: {
        hasBalcony: true,
        hasMaidRoom: false,
      },
    },
  },

  // --- 3. Chalet ---
  {
    typeSlug: 'chalet',
    title: 'Stunning Beachfront Chalet in Marassi',
    description:
      'Breathtaking first-row sea view chalet in Marassi (Sidi Abdel Rahman). Directly overlooking the pristine Mediterranean beach. High-end modern furnishings, spacious terrace, and steps away from the water.',
    price: 18000000,
    currency: 'EGP',
    area: 150,
    address: {
      street: 'Sidi Abdel Rahman, KM 129',
      city: 'Al Alamein',
      state: 'Matrouh',
      country: 'Egypt',
      zip: '51718',
    },
    geo: { lat: 30.9922, lng: 28.7328 },
    imageFile: 'condo.png',
    specifications: {
      bedrooms: 2,
      bathrooms: 2,
      floor: 1,
      floors: 2,
      yearBuilt: 2024,
      heatingType: 'electric',
      chalet: {
        hasPool: true,
        hasGarden: true,
        isBeachfront: true,
      },
    },
  },
  {
    typeSlug: 'chalet',
    title: 'Premium Oceanside Chalet in Miami Beach',
    description:
      'Beautiful chalet in Miami Beach with direct Atlantic Ocean frontage. Offers a private garden space, outdoor dining deck, private beach lounge access, and premium resort privileges.',
    price: 1850000,
    currency: 'USD',
    area: 175,
    address: {
      street: 'Ocean Drive, Beachside Zone',
      city: 'Miami',
      state: 'Florida',
      country: 'United States',
      zip: '33101',
    },
    geo: { lat: 25.7617, lng: -80.1918 },
    imageFile: 'scandinavian.png',
    specifications: {
      bedrooms: 3,
      bathrooms: 3,
      floor: 0,
      floors: 2,
      yearBuilt: 2023,
      heatingType: 'electric',
      chalet: {
        hasPool: false,
        hasGarden: true,
        isBeachfront: true,
      },
    },
  },

  // ==================== COMMERCIAL ====================
  // --- 4. Office ---
  {
    typeSlug: 'office',
    title: 'Corporate Headquarters Office Suite in Manhattan',
    description:
      'State-of-the-art office floor in Midtown Manhattan. Fully finished with meeting rooms, executive boardrooms, reception lobby, server room, and high-speed fiber optic connection.',
    price: 5500000,
    currency: 'USD',
    area: 320,
    address: {
      street: 'Broadway Ave, Midtown Block 4',
      city: 'New York',
      state: 'New York',
      country: 'United States',
      zip: '10001',
    },
    geo: { lat: 40.7128, lng: -74.006 },
    imageFile: 'office.png',
    specifications: {
      floor: 14,
      parkingSpaces: 6,
      licenseType: 'Commercial Office License',
      office: {
        meetingRooms: 4,
        hasReception: true,
        internetType: 'fiber',
        securityLevel: '24_7',
        elevators: 6,
      },
    },
  },
  {
    typeSlug: 'office',
    title: 'Flexible Workspace in Doha Financial District',
    description:
      'An executive office space situated in the prestigious Doha West Bay District, close to the central bank. Fully furnished with modular desks, shared business lounge, and dedicated secure parking slots.',
    price: 2400000,
    currency: 'USD',
    area: 140,
    address: {
      street: 'West Bay District, Al Corniche Rd',
      city: 'Doha',
      state: 'Ad Dawhah',
      country: 'Qatar',
      zip: '00000',
    },
    geo: { lat: 25.2854, lng: 51.531 },
    imageFile: 'office.png',
    specifications: {
      floor: 5,
      parkingSpaces: 2,
      licenseType: 'Commercial Office License',
      office: {
        meetingRooms: 2,
        hasReception: true,
        internetType: 'fiber',
        securityLevel: 'business_hours',
        elevators: 3,
      },
    },
  },

  // --- 5. Restaurant ---
  {
    typeSlug: 'restaurant',
    title: 'Parisian Bistro & Fine Dining Spot',
    description:
      'A premium restaurant space in the heart of Paris. Complete with professional gas lines, high-capacity exhaust ventilation hoods, dual industrial prep-kitchens, and a beautiful outdoor dining patio area.',
    price: 3800000,
    currency: 'EUR',
    area: 300,
    address: {
      street: 'Rue de la Paix, Block 12',
      city: 'Paris',
      state: 'Île-de-France',
      country: 'France',
      zip: '75001',
    },
    geo: { lat: 48.8566, lng: 2.3522 },
    imageFile: 'office.png',
    specifications: {
      floor: 1,
      parkingSpaces: 2,
      licenseType: 'F&B Catering License',
      restaurant: {
        kitchenCount: 2,
        hasExhaust: true,
        hasGasConnection: true,
        outdoorSeatingCapacity: 60,
      },
    },
  },
  {
    typeSlug: 'restaurant',
    title: 'Zamalek Waterfront Fine Dining Spot',
    description:
      'A spectacular restaurant property overlooking the Nile in Zamalek. High foot traffic location with upscale clientele. The layout includes indoor dining halls, bar space, and terrace seating.',
    price: 22000000,
    currency: 'EGP',
    area: 210,
    address: {
      street: '26th of July Street, Zamalek',
      city: 'Cairo',
      state: 'Cairo',
      country: 'Egypt',
      zip: '11211',
    },
    geo: { lat: 30.0592, lng: 31.2215 },
    imageFile: 'office.png',
    specifications: {
      floor: 0,
      parkingSpaces: 0,
      licenseType: 'F&B Fine Dining License',
      restaurant: {
        kitchenCount: 1,
        hasExhaust: true,
        hasGasConnection: true,
        outdoorSeatingCapacity: 30,
      },
    },
  },

  // --- 6. Warehouse ---
  {
    typeSlug: 'warehouse',
    title: 'Logistics Distribution Center Warehouse Berlin',
    description:
      'A large modern warehouse with double-height ceiling in the Berlin outskirts. Features 4 heavy-duty loading docks, automated fire sprinkler system, and full flat-bed truck turnaround access.',
    price: 4500000,
    currency: 'EUR',
    area: 1800,
    address: {
      street: 'Industriestrasse 14, Warehouse Zone',
      city: 'Berlin',
      state: 'Berlin State',
      country: 'Germany',
      zip: '10115',
    },
    geo: { lat: 52.52, lng: 13.405 },
    imageFile: 'office.png',
    specifications: {
      floor: 0,
      parkingSpaces: 5,
      licenseType: 'Logistics & Storage License',
      warehouse: {
        loadingDocks: 4,
        ceilingHeight: 12,
        hasTruckAccess: true,
        fireSystem: 'full',
      },
    },
  },
  {
    typeSlug: 'warehouse',
    title: 'Cold Storage Industrial Warehouse in Jeddah',
    description:
      'A specialized insulated warehouse equipped with advanced cooling systems. Perfect for pharmaceutical storage or fresh food logistics in Jeddah Port Industrial Zone.',
    price: 4800000,
    currency: 'USD',
    area: 1400,
    address: {
      street: 'King Abdulaziz Port Zone, Road 10',
      city: 'Jeddah',
      state: 'Makkah Province',
      country: 'Saudi Arabia',
      zip: '21146',
    },
    geo: { lat: 21.4858, lng: 39.1925 },
    imageFile: 'office.png',
    specifications: {
      floor: 0,
      parkingSpaces: 3,
      licenseType: 'Industrial Storage License',
      warehouse: {
        loadingDocks: 2,
        ceilingHeight: 10,
        hasTruckAccess: true,
        fireSystem: 'sprinkler',
      },
    },
  },

  // --- 7. Factory ---
  {
    typeSlug: 'factory',
    title: 'Heavy Manufacturing Industrial Plant in Manchester',
    description:
      'Industrial manufacturing plant with high electrical power capacity (1000 KW), structural overhead gantry crane tracks, administrative offices block, and industrial effluent drainage lines.',
    price: 8500000,
    currency: 'EUR',
    area: 4000,
    address: {
      street: 'Industrial Estate Way, Block D',
      city: 'Manchester',
      state: 'Greater Manchester',
      country: 'United Kingdom',
      zip: 'M1 1AE',
    },
    geo: { lat: 53.4808, lng: -2.2426 },
    imageFile: 'office.png',
    specifications: {
      floor: 0,
      parkingSpaces: 8,
      licenseType: 'Heavy Manufacturing License',
      factory: {
        powerCapacityKW: 1200,
        hazardZone: 'high',
        industrialLicense: 'MFG-UK99',
      },
    },
  },
  {
    typeSlug: 'factory',
    title: 'Electronics Assembly Factory Hall in Munich',
    description:
      'Cleanroom assembly floor designed for electronics, consumer goods, or pharmaceuticals. Climate-controlled, dust-free ventilation, and epoxy anti-static flooring.',
    price: 9200000,
    currency: 'EUR',
    area: 2400,
    address: {
      street: 'Bavariastrasse, Assembly Block 2',
      city: 'Munich',
      state: 'Bavaria',
      country: 'Germany',
      zip: '80331',
    },
    geo: { lat: 48.1351, lng: 11.582 },
    imageFile: 'office.png',
    specifications: {
      floor: 0,
      parkingSpaces: 4,
      licenseType: 'Light Assembly License',
      factory: {
        powerCapacityKW: 300,
        hazardZone: 'low',
        industrialLicense: 'ELC-DE44',
      },
    },
  },

  // --- 8. Retail ---
  {
    typeSlug: 'retail',
    title: 'Korba Square Retail Showroom',
    description:
      'A double-height retail showroom in the historic Korba district of Heliopolis. Perfect for luxury brands, automotive showrooms, or premium cosmetics. Highly visible layout with large window facades.',
    price: 48000000,
    currency: 'EGP',
    area: 400,
    address: {
      street: 'Baghdad Street, Korba',
      city: 'Heliopolis',
      state: 'Cairo',
      country: 'Egypt',
      zip: '11341',
    },
    geo: { lat: 30.0912, lng: 31.3289 },
    imageFile: 'office.png',
    specifications: {
      floor: 0,
      parkingSpaces: 2,
      licenseType: 'Retail Trading License',
      retail: {
        frontageWidth: 8,
        hasStorageRoom: true,
        ceilingHeight: 4.5,
      },
    },
  },
  {
    typeSlug: 'retail',
    title: 'Avenue-Facing Shop in Rome Historical Center',
    description:
      "A commercial retail space in one of Rome's busiest shopping streets. Features high foot traffic, dual entrances, full service meters, and dedicated signboards area.",
    price: 2400000,
    currency: 'EUR',
    area: 150,
    address: {
      street: 'Via del Corso, Block 5',
      city: 'Rome',
      state: 'Lazio',
      country: 'Italy',
      zip: '00100',
    },
    geo: { lat: 41.9028, lng: 12.4964 },
    imageFile: 'office.png',
    specifications: {
      floor: 0,
      parkingSpaces: 1,
      licenseType: 'Retail Trading License',
      retail: {
        frontageWidth: 6,
        hasStorageRoom: true,
        ceilingHeight: 4.0,
      },
    },
  },

  // --- 9. Medical ---
  {
    typeSlug: 'medical',
    title: 'State-of-the-Art Dental Clinic Suite in Madrid',
    description:
      'A luxury fully-equipped dental clinic in central Madrid. Contains central air lines, specialized medical sanitation room, recovery lounge, and digital radiology setup space.',
    price: 1200000,
    currency: 'EUR',
    area: 120,
    address: {
      street: 'Paseo de la Castellana, block 18',
      city: 'Madrid',
      state: 'Madrid Community',
      country: 'Spain',
      zip: '28001',
    },
    geo: { lat: 40.4168, lng: -3.7038 },
    imageFile: 'office.png',
    specifications: {
      floor: 2,
      parkingSpaces: 3,
      licenseType: 'Dental Practice License',
      medical: {
        hasWaitingRoom: true,
        medicalLicense: 'DEN-ES11',
        numberOfExamRooms: 4,
      },
    },
  },
  {
    typeSlug: 'medical',
    title: 'Multi-Specialty Clinic in Kuwait City',
    description:
      'Spacious child-friendly clinic with multiple examination chambers, soundproofed consultation zones, vaccine storage space, and kids entertainment area.',
    price: 1800000,
    currency: 'USD',
    area: 250,
    address: {
      street: 'Arabian Gulf Street, Medical Park',
      city: 'Kuwait City',
      state: 'Al Asimah',
      country: 'Kuwait',
      zip: '13001',
    },
    geo: { lat: 29.3759, lng: 47.9774 },
    imageFile: 'office.png',
    specifications: {
      floor: 3,
      parkingSpaces: 2,
      licenseType: 'Medical Clinic License',
      medical: {
        hasWaitingRoom: true,
        medicalLicense: 'PED-KW55',
        numberOfExamRooms: 5,
      },
    },
  },

  // ==================== HOSPITALITY ====================
  // --- 10. Hotel ---
  {
    typeSlug: 'hotel',
    title: '5-Star Luxury Beach Resort Hotel',
    description:
      'A landmark resort in Hurghada featuring private lagoons, full spa treatment centers, multiple international standard dining avenues, conference halls, and premium sea-view guest keys.',
    price: 450000000,
    currency: 'EGP',
    area: 25000,
    address: {
      street: 'Sahl Hasheesh Bay Rd',
      city: 'Hurghada',
      state: 'Red Sea',
      country: 'Egypt',
      zip: '84521',
    },
    geo: { lat: 27.0864, lng: 33.882 },
    imageFile: 'building-dreamy.jpg',
    specifications: {
      totalRooms: 200,
      floors: 5,
      starRating: '5',
      brand: 'Grand Nile Plaza',
      lastRenovationYear: 2022,
      hasBeachAccess: true,
      hotel: {
        suites: 25,
        restaurants: 4,
        conferenceRooms: 3,
      },
    },
  },
  {
    typeSlug: 'hotel',
    title: 'Boutique Hotel in Downtown Los Angeles',
    description:
      'A cozy boutique hotel located in the heart of Sharm El Sheikh. Offers intimate premium accommodation, rooftop lounge bar, immediate pedestrian promenade access, and high occupancy history.',
    price: 24000000,
    currency: 'USD',
    area: 8500,
    address: {
      street: 'Sunset Boulevard, DTLA Block 8',
      city: 'Los Angeles',
      state: 'California',
      country: 'United States',
      zip: '90001',
    },
    geo: { lat: 34.0522, lng: -118.2437 },
    imageFile: 'villa.png',
    specifications: {
      totalRooms: 80,
      floors: 3,
      starRating: '4',
      brand: 'LA Boutique',
      lastRenovationYear: 2024,
      hasBeachAccess: false,
      hotel: {
        suites: 8,
        restaurants: 2,
        conferenceRooms: 1,
      },
    },
  },

  // --- 11. Motel ---
  {
    typeSlug: 'motel',
    title: 'Abu Dhabi Highway Transit Motel',
    description:
      'A transit highway motel located at the junction of Sokhna. Features easy drive-up parking spaces in front of each room, quick service rest stop diner, and complete logistical service facilities.',
    price: 3800000,
    currency: 'USD',
    area: 3200,
    address: {
      street: 'Sheikh Zayed Rd, KM 45, Abu Dhabi',
      city: 'Abu Dhabi',
      state: 'Abu Dhabi',
      country: 'United Arab Emirates',
      zip: '00000',
    },
    geo: { lat: 24.4539, lng: 54.3773 },
    imageFile: 'apartment.png',
    specifications: {
      totalRooms: 40,
      floors: 2,
      starRating: '3',
      brand: 'Abu Dhabi Transit',
      lastRenovationYear: 2023,
      hasBeachAccess: false,
      motel: {
        parkingSpaces: 45,
        driveUpRooms: true,
        isHighwayAccess: true,
      },
    },
  },
  {
    typeSlug: 'motel',
    title: 'Sinai Highway Guest House',
    description:
      'Transit motel and reststop in Ras Sudr on the main highway leading to Sharm. Ideal for quick check-ins, transit travelers, and surfers looking for affordable rooms near the coast.',
    price: 24000000,
    currency: 'EGP',
    area: 2500,
    address: {
      street: 'Suez-Sharm Road, KM 65',
      city: 'Ras Sudr',
      state: 'South Sinai',
      country: 'Egypt',
      zip: '46612',
    },
    geo: { lat: 29.593, lng: 32.709 },
    imageFile: 'scandinavian.png',
    specifications: {
      totalRooms: 30,
      floors: 1,
      starRating: '2',
      brand: 'Sinai Oasis',
      lastRenovationYear: 2024,
      hasBeachAccess: false,
      motel: {
        parkingSpaces: 30,
        driveUpRooms: false,
        isHighwayAccess: true,
      },
    },
  },

  // --- 12. Resort ---
  {
    typeSlug: 'resort',
    title: 'Abu Tig Marina Luxury Resort',
    description:
      'Stunning premium resort overlooking Abu Tig Marina in El Gouna. Combines private beaches, custom yacht parking berths, championship golf course, spa clubs, and luxury suites.',
    price: 680000000,
    currency: 'EGP',
    area: 45000,
    address: {
      street: 'Abu Tig Marina Road',
      city: 'El Gouna',
      state: 'Red Sea',
      country: 'Egypt',
      zip: '84513',
    },
    geo: { lat: 27.4042, lng: 33.6764 },
    imageFile: 'building-dreamy.jpg',
    specifications: {
      totalRooms: 300,
      floors: 4,
      starRating: '5',
      brand: 'Lagoon Paradise',
      lastRenovationYear: 2025,
      hasBeachAccess: true,
      resort: {
        suites: 50,
        hasPrivateBeach: true,
        privateBeachArea: 2000,
        hasGolfCourse: true,
      },
    },
  },
  {
    typeSlug: 'resort',
    title: 'Golf & Spa Resort Somabay',
    description:
      'Located in the exclusive Soma Bay peninsula, this resort offers high-end spa therapies, windsurfing centers, signature golf greens, and breathtaking panoramic sea views from all suites.',
    price: 520000000,
    currency: 'EGP',
    area: 38000,
    address: {
      street: 'Safaga Road, Soma Bay Peninsula',
      city: 'Safaga',
      state: 'Red Sea',
      country: 'Egypt',
      zip: '84711',
    },
    geo: { lat: 26.852, lng: 34.004 },
    imageFile: 'villa.png',
    specifications: {
      totalRooms: 180,
      floors: 3,
      starRating: '5',
      brand: 'Soma Heights',
      lastRenovationYear: 2023,
      hasBeachAccess: true,
      resort: {
        suites: 30,
        hasPrivateBeach: true,
        privateBeachArea: 1000,
        hasGolfCourse: true,
      },
    },
  },

  // --- 13. Camp ---
  {
    typeSlug: 'camp',
    title: 'Dahab Blue Hole Diving Camp',
    description:
      'An eco-friendly beach campsite in Dahab near the Blue Hole. Features structured bamboo tents, communal dining circles, clean shared showers, and solar power stations.',
    price: 6000000,
    currency: 'EGP',
    area: 1800,
    address: {
      street: 'Blue Hole Road, Desert Camp Area',
      city: 'Dahab',
      state: 'South Sinai',
      country: 'Egypt',
      zip: '46617',
    },
    geo: { lat: 28.5685, lng: 34.536 },
    imageFile: 'condo.png',
    specifications: {
      totalRooms: 20,
      floors: 1,
      starRating: '1',
      brand: 'Blue Hole Eco Camp',
      lastRenovationYear: 2024,
      hasBeachAccess: true,
      camp: {
        tentCapacity: 40,
        hasShowers: true,
        hasElectricity: true,
      },
    },
  },
  {
    typeSlug: 'camp',
    title: 'Bedouin Beach Camp Tarabin',
    description:
      'Traditional bedouin beach camp in Nuweiba. Rest and relax right on the Gulf of Aqaba. Authentic reed huts, beach firepits, fresh sea meals, and deep starry sky views.',
    price: 4500000,
    currency: 'EGP',
    area: 1500,
    address: {
      street: 'Tarabin Beach Camp Zone',
      city: 'Nuweiba',
      state: 'South Sinai',
      country: 'Egypt',
      zip: '46618',
    },
    geo: { lat: 29.042, lng: 34.6645 },
    imageFile: 'modern.png',
    specifications: {
      totalRooms: 15,
      floors: 1,
      starRating: '1',
      brand: 'Tarabin Moon Camp',
      lastRenovationYear: 2025,
      hasBeachAccess: true,
      camp: {
        tentCapacity: 30,
        hasShowers: true,
        hasElectricity: false,
      },
    },
  },

  // ==================== LAND ====================
  // --- 14. Land ---
  {
    typeSlug: 'residential-land',
    title: 'Prime Mixed-Use Land Plot in El Shorouk',
    description:
      'A rectangular flat corner land plot situated in Shorouk City. Excellent construction footprint permission, fully serviced with water, electricity, and sewage lines at the boundary.',
    price: 18000000,
    currency: 'EGP',
    area: 1200,
    address: {
      street: 'Plot 15, Area 2',
      city: 'El Shorouk',
      state: 'Cairo',
      country: 'Egypt',
      zip: '11827',
    },
    geo: { lat: 30.125, lng: 31.635 },
    imageFile: 'land.png',
    specifications: {
      zoning: 'mixed',
      roadWidth: 24,
      frontageWidth: 40,
      hasUtilities: true,
      allowedFloors: 5,
      buildingRatio: 60,
      isCorner: true,
      slope: 'flat',
      soilType: 'Sandy',
    },
  },
  {
    typeSlug: 'residential-land',
    title: 'Corner Plot for Villa in West Somid',
    description:
      'An exclusive residential villa plot located in West Somid, 6th of October City. High elevation, double-road facing corner. Perfect for building a custom villa with large yard space.',
    price: 12000000,
    currency: 'EGP',
    area: 950,
    address: {
      street: 'Plot 108, West Somid Area',
      city: '6th of October',
      state: 'Giza',
      country: 'Egypt',
      zip: '12566',
    },
    geo: { lat: 30.015, lng: 30.935 },
    imageFile: 'land.png',
    specifications: {
      zoning: 'residential',
      roadWidth: 18,
      frontageWidth: 30,
      hasUtilities: true,
      allowedFloors: 3,
      buildingRatio: 40,
      isCorner: true,
      slope: 'flat',
      soilType: 'Clay-Sandy',
    },
  },
]

async function ensureMediaFile(
  payload: Payload,
  filename: string,
  altText: string,
): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: {
      displayName: {
        equals: filename,
      },
    },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    return existing.docs[0].id as number
  }

  const filePath = path.join(process.cwd(), 'public', filename)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required seed image not found at: ${filePath}`)
  }

  const fileBuffer = fs.readFileSync(filePath)
  const stats = fs.statSync(filePath)

  const mediaDoc = await payload.create({
    collection: 'media',
    data: {
      displayName: filename,
      alt: altText,
      healthStatus: 'ready',
    },
    file: {
      data: fileBuffer,
      name: filename,
      mimetype: filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
      size: stats.size,
    },
  })

  return mediaDoc.id as number
}

async function getOrCreateListingStatus(
  payload: Payload,
  name: string,
  slug: string,
  colorTheme: 'emerald' | 'rose' | 'gray',
): Promise<number> {
  const found = await payload.find({
    collection: 'listing-statuses',
    where: { name: { equals: name } },
    limit: 1,
  })
  if (found.docs.length > 0) return found.docs[0].id as number

  const created = await payload.create({
    collection: 'listing-statuses',
    data: { name, slug, colorTheme },
  })
  return created.id as number
}

async function getOrCreateConstructionStatus(
  payload: Payload,
  name: string,
  slug: string,
  colorTheme: 'emerald' | 'amber' | 'blue' | 'indigo' | 'purple',
): Promise<number> {
  const found = await payload.find({
    collection: 'construction-statuses',
    where: { name: { equals: name } },
    limit: 1,
  })
  if (found.docs.length > 0) return found.docs[0].id as number

  const created = await payload.create({
    collection: 'construction-statuses',
    data: { name, slug, colorTheme },
  })
  return created.id as number
}

async function getOrCreateCategory(
  payload: Payload,
  name: string,
  slug: string,
  icon: string,
): Promise<number> {
  const found = await payload.find({
    collection: 'property-categories',
    where: { name: { equals: name } },
    limit: 1,
  })
  if (found.docs.length > 0) return found.docs[0].id as number

  const created = await payload.create({
    collection: 'property-categories',
    data: { name, slug, icon, sortOrder: 0 },
  })
  return created.id as number
}

async function getOrCreateSeller(payload: Payload): Promise<number> {
  const found = await payload.find({
    collection: 'sellers',
    where: { email: { equals: 'seed-seller@fimac.com' } },
    limit: 1,
  })
  if (found.docs.length > 0) return found.docs[0].id as number

  const created = await payload.create({
    collection: 'sellers',
    data: {
      full_name: 'Fimac Seed Owner',
      phone: '+201001234567',
      email: 'seed-seller@fimac.com',
      password: 'SeedSellerPassword123!',
      verification_status: 'verified',
      notes: 'Auto-generated seed seller account.',
    },
  })
  return created.id as number
}

async function getOrCreateFeature(
  payload: Payload,
  name: string,
  slug: string,
  featureGroup:
    | 'interior'
    | 'outdoor'
    | 'security'
    | 'parking'
    | 'utilities'
    | 'accessibility'
    | 'business'
    | 'hospitality'
    | 'land_development'
    | 'agriculture'
    | 'sustainability'
    | 'luxury',
  icon?: string | null,
): Promise<number> {
  const found = await payload.find({
    collection: 'features',
    where: { name: { equals: name } },
    limit: 1,
  })
  if (found.docs.length > 0) return found.docs[0].id as number

  const created = await payload.create({
    collection: 'features',
    data: {
      name,
      slug,
      featureGroup,
      icon: icon || null,
    },
  })
  return created.id as number
}

async function getOrCreatePropertyType(
  payload: Payload,
  name: string,
  slug: string,
  specificationProfile:
    | 'villa'
    | 'apartment'
    | 'chalet'
    | 'office'
    | 'restaurant'
    | 'warehouse'
    | 'factory'
    | 'retail'
    | 'medical'
    | 'hotel'
    | 'motel'
    | 'resort'
    | 'camp'
    | 'land'
    | 'none',
  categorySlug: string,
  categoryMap: Record<string, number>,
): Promise<PropertyType> {
  const found = await payload.find({
    collection: 'property-types',
    where: { name: { equals: name } },
    limit: 1,
  })
  if (found.docs.length > 0) return found.docs[0] as unknown as PropertyType

  const categoryId = categoryMap[categorySlug]
  if (!categoryId) {
    throw new Error(`Category ${categorySlug} not found in map`)
  }

  const created = await payload.create({
    collection: 'property-types',
    data: {
      name,
      slug,
      specificationProfile,
      category: categoryId,
    },
  })
  return created as unknown as PropertyType
}

const BASE_LOCATIONS = [
  {
    city: 'Riyadh',
    state: 'Riyadh Province',
    country: 'Saudi Arabia',
    lat: 24.7136,
    lng: 46.6753,
    zip: '11564',
  },
  {
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    zip: 'EC1A 1BB',
  },
  {
    city: 'Dubai',
    state: 'Dubai',
    country: 'United Arab Emirates',
    lat: 25.2048,
    lng: 55.2708,
    zip: '00000',
  },
  {
    city: 'New York',
    state: 'New York',
    country: 'United States',
    lat: 40.7128,
    lng: -74.006,
    zip: '10001',
  },
  {
    city: 'Paris',
    state: 'Île-de-France',
    country: 'France',
    lat: 48.8566,
    lng: 2.3522,
    zip: '75001',
  },
  {
    city: 'Berlin',
    state: 'Berlin State',
    country: 'Germany',
    lat: 52.52,
    lng: 13.405,
    zip: '10115',
  },
  {
    city: 'Jeddah',
    state: 'Makkah Province',
    country: 'Saudi Arabia',
    lat: 21.4858,
    lng: 39.1925,
    zip: '21146',
  },
  { city: 'Rome', state: 'Lazio', country: 'Italy', lat: 41.9028, lng: 12.4964, zip: '00100' },
  {
    city: 'Madrid',
    state: 'Madrid Community',
    country: 'Spain',
    lat: 40.4168,
    lng: -3.7038,
    zip: '28001',
  },
  {
    city: 'Kuwait City',
    state: 'Al Asimah',
    country: 'Kuwait',
    lat: 29.3759,
    lng: 47.9774,
    zip: '13001',
  },
  { city: 'New Cairo', state: 'Cairo', country: 'Egypt', lat: 30.0074, lng: 31.4913, zip: '11835' },
  {
    city: 'Sheikh Zayed',
    state: 'Giza',
    country: 'Egypt',
    lat: 30.0632,
    lng: 30.9661,
    zip: '12588',
  },
  {
    city: 'Al Alamein',
    state: 'Matrouh',
    country: 'Egypt',
    lat: 30.9922,
    lng: 28.7328,
    zip: '51718',
  },
  { city: 'New Capital', state: 'Cairo', country: 'Egypt', lat: 29.988, lng: 31.705, zip: '11956' },
]

function getUniqueLocation(index: number) {
  const base = BASE_LOCATIONS[index % BASE_LOCATIONS.length]
  const offset = index * 0.0013
  return {
    lat: Number((base.lat + offset).toFixed(6)),
    lng: Number((base.lng - offset).toFixed(6)),
    street: `Plot ${index + 200}, Sector ${(index % 6) + 1}, Main Rd`,
    city: base.city,
    state: base.state,
    country: base.country,
    zip: base.zip,
  }
}

function getImageForProfile(category: string, profile: string): string {
  if (category === 'residential') {
    if (profile === 'villa') return 'villa.png'
    if (profile === 'apartment') return 'apartment.png'
    if (profile === 'chalet') return 'condo.png'
    return 'apartment.png'
  }
  if (category === 'commercial') {
    return 'office.png'
  }
  if (category === 'hospitality') {
    if (profile === 'hotel' || profile === 'resort') return 'building-dreamy.jpg'
    return 'condo.png'
  }
  if (category === 'land') {
    return 'land.png'
  }
  return 'apartment.png'
}

function getCommonCategorySpecs(category: string): Record<string, unknown> {
  if (category === 'residential') {
    return {
      bedrooms: 3,
      bathrooms: 2,
      floor: 2,
      floors: 5,
      yearBuilt: 2023,
      heatingType: 'gas',
    }
  }
  if (category === 'commercial') {
    return {
      floor: 1,
      parkingSpaces: 2,
      licenseType: 'General Commercial License',
    }
  }
  if (category === 'hospitality') {
    return {
      totalRooms: 50,
      floors: 3,
      starRating: '3',
      brand: 'Standard Inn',
      lastRenovationYear: 2022,
      hasBeachAccess: false,
    }
  }
  if (category === 'land') {
    return {
      zoning: 'residential',
      roadWidth: 15,
      frontageWidth: 25,
      hasUtilities: true,
      allowedFloors: 3,
      buildingRatio: 50,
      isCorner: false,
      slope: 'flat',
      soilType: 'Sandy',
    }
  }
  return {}
}

function getSpecificationsForProfile(profile: string): Record<string, unknown> {
  switch (profile) {
    case 'villa':
      return {
        villa: {
          pools: 1,
          hasGarden: true,
          hasGarage: true,
          hasMajlis: true,
          hasDriverRoom: true,
          hasMaidRoom: true,
        },
      }
    case 'apartment':
      return {
        apartment: {
          hasBalcony: true,
          hasMaidRoom: true,
        },
      }
    case 'chalet':
      return {
        chalet: {
          hasPool: true,
          hasGarden: true,
          isBeachfront: true,
        },
      }
    case 'office':
      return {
        office: {
          meetingRooms: 2,
          hasReception: true,
          internetType: 'fiber',
          securityLevel: '24_7',
          elevators: 2,
        },
      }
    case 'restaurant':
      return {
        restaurant: {
          kitchenCount: 2,
          hasExhaust: true,
          hasGasConnection: true,
          outdoorSeatingCapacity: 45,
        },
      }
    case 'warehouse':
      return {
        warehouse: {
          loadingDocks: 3,
          ceilingHeight: 10,
          hasTruckAccess: true,
          fireSystem: 'full',
        },
      }
    case 'factory':
      return {
        factory: {
          powerCapacityKW: 400,
          hazardZone: 'medium',
          industrialLicense: 'IND-7788',
        },
      }
    case 'retail':
      return {
        retail: {
          frontageWidth: 6,
          hasStorageRoom: true,
          ceilingHeight: 4,
        },
      }
    case 'medical':
      return {
        medical: {
          hasWaitingRoom: true,
          medicalLicense: 'MED-1122',
          numberOfExamRooms: 4,
        },
      }
    case 'hotel':
      return {
        hotel: {
          suites: 12,
          restaurants: 2,
          conferenceRooms: 2,
        },
      }
    case 'motel':
      return {
        motel: {
          parkingSpaces: 50,
          driveUpRooms: true,
          isHighwayAccess: true,
        },
      }
    case 'resort':
      return {
        resort: {
          suites: 25,
          hasPrivateBeach: true,
          privateBeachArea: 1200,
          hasGolfCourse: true,
        },
      }
    case 'camp':
      return {
        camp: {
          tentCapacity: 50,
          hasShowers: true,
          hasElectricity: true,
        },
      }
    case 'land':
      return {}
    default:
      return {}
  }
}

async function main() {
  console.log('🚀 Starting property seeding process...')
  const payload = await getPayload({ config: configPromise })

  // 1. Core Listing Statuses
  console.log('📝 Setting up listing statuses...')
  const forSaleStatusId = await getOrCreateListingStatus(payload, 'For Sale', 'forsale', 'emerald')
  const soldStatusId = await getOrCreateListingStatus(payload, 'Sold', 'sold', 'rose')
  // We\'ll list the properties under "For Sale" status
  console.log(`✅ Listing Statuses setup complete. "For Sale" ID: ${forSaleStatusId}`)

  // 2. Core Construction Statuses
  console.log('🏗️ Setting up construction statuses...')
  const readyStatusId = await getOrCreateConstructionStatus(
    payload,
    'Ready to Move In',
    'ready',
    'emerald',
  )
  const underConstructionStatusId = await getOrCreateConstructionStatus(
    payload,
    'Under Construction',
    'under_construction',
    'amber',
  )
  console.log(`✅ Construction Statuses setup complete. "Ready to Move In" ID: ${readyStatusId}`)

  // 3. Core Categories
  console.log('📂 Setting up property categories...')
  const categoriesList = [
    { name: 'Residential', slug: 'residential', icon: 'Home' },
    { name: 'Commercial', slug: 'commercial', icon: 'Building2' },
    { name: 'Hospitality', slug: 'hospitality', icon: 'Hotel' },
    { name: 'Land', slug: 'land', icon: 'Map' },
  ]
  const categoryMap: Record<string, number> = {}
  for (const cat of categoriesList) {
    const id = await getOrCreateCategory(payload, cat.name, cat.slug, cat.icon)
    categoryMap[cat.slug] = id
  }
  console.log('✅ Property Categories setup complete:', categoryMap)

  // 4. Core Property Types (Syncing all 55 default property types)
  console.log('🏷️ Setting up property types...')
  const defaultPropertyTypes = [
    // Commercial
    { name: 'Office', slug: 'office', profile: 'office' as const, categorySlug: 'commercial' },
    {
      name: 'Retail Shop',
      slug: 'retail-shop',
      profile: 'retail' as const,
      categorySlug: 'commercial',
    },
    {
      name: 'Restaurant',
      slug: 'restaurant',
      profile: 'restaurant' as const,
      categorySlug: 'commercial',
    },
    { name: 'Cafe', slug: 'cafe', profile: 'restaurant' as const, categorySlug: 'commercial' },
    { name: 'Showroom', slug: 'showroom', profile: 'retail' as const, categorySlug: 'commercial' },
    {
      name: 'Warehouse',
      slug: 'warehouse',
      profile: 'warehouse' as const,
      categorySlug: 'commercial',
    },
    { name: 'Factory', slug: 'factory', profile: 'factory' as const, categorySlug: 'commercial' },
    { name: 'Workshop', slug: 'workshop', profile: 'factory' as const, categorySlug: 'commercial' },
    { name: 'Clinic', slug: 'clinic', profile: 'medical' as const, categorySlug: 'commercial' },
    {
      name: 'Business Center',
      slug: 'business-center',
      profile: 'office' as const,
      categorySlug: 'commercial',
    },
    {
      name: 'Coworking Space',
      slug: 'coworking-space',
      profile: 'office' as const,
      categorySlug: 'commercial',
    },
    {
      name: 'Commercial Building',
      slug: 'commercial-building',
      profile: 'none' as const,
      categorySlug: 'commercial',
    },
    {
      name: 'Mixed Use Building',
      slug: 'mixed-use-building',
      profile: 'none' as const,
      categorySlug: 'commercial',
    },

    // Residential
    {
      name: 'Apartment',
      slug: 'apartment',
      profile: 'apartment' as const,
      categorySlug: 'residential',
    },
    { name: 'Studio', slug: 'studio', profile: 'apartment' as const, categorySlug: 'residential' },
    { name: 'Duplex', slug: 'duplex', profile: 'apartment' as const, categorySlug: 'residential' },
    {
      name: 'Penthouse',
      slug: 'penthouse',
      profile: 'villa' as const,
      categorySlug: 'residential',
    },
    { name: 'Villa', slug: 'villa', profile: 'villa' as const, categorySlug: 'residential' },
    {
      name: 'Townhouse',
      slug: 'townhouse',
      profile: 'villa' as const,
      categorySlug: 'residential',
    },
    {
      name: 'Twin House',
      slug: 'twin-house',
      profile: 'villa' as const,
      categorySlug: 'residential',
    },
    { name: 'Chalet', slug: 'chalet', profile: 'chalet' as const, categorySlug: 'residential' },
    { name: 'Cabin', slug: 'cabin', profile: 'chalet' as const, categorySlug: 'residential' },
    {
      name: 'Farm House',
      slug: 'farm-house',
      profile: 'villa' as const,
      categorySlug: 'residential',
    },
    { name: 'Mansion', slug: 'mansion', profile: 'villa' as const, categorySlug: 'residential' },
    { name: 'Palace', slug: 'palace', profile: 'villa' as const, categorySlug: 'residential' },
    {
      name: 'Compound Unit',
      slug: 'compound-unit',
      profile: 'none' as const,
      categorySlug: 'residential',
    },
    {
      name: 'Serviced Apartment',
      slug: 'serviced-apartment',
      profile: 'apartment' as const,
      categorySlug: 'residential',
    },
    { name: 'Loft', slug: 'loft', profile: 'apartment' as const, categorySlug: 'residential' },

    // Hospitality
    { name: 'Hotel', slug: 'hotel', profile: 'hotel' as const, categorySlug: 'hospitality' },
    {
      name: 'Boutique Hotel',
      slug: 'boutique-hotel',
      profile: 'hotel' as const,
      categorySlug: 'hospitality',
    },
    { name: 'Resort', slug: 'resort', profile: 'resort' as const, categorySlug: 'hospitality' },
    { name: 'Motel', slug: 'motel', profile: 'motel' as const, categorySlug: 'hospitality' },
    {
      name: 'Aparthotel',
      slug: 'aparthotel',
      profile: 'hotel' as const,
      categorySlug: 'hospitality',
    },
    {
      name: 'Hotel Apartment',
      slug: 'hotel-apartment',
      profile: 'hotel' as const,
      categorySlug: 'hospitality',
    },
    { name: 'Eco Lodge', slug: 'eco-lodge', profile: 'camp' as const, categorySlug: 'hospitality' },
    { name: 'Lodge', slug: 'lodge', profile: 'camp' as const, categorySlug: 'hospitality' },
    {
      name: 'Guest House',
      slug: 'guest-house',
      profile: 'motel' as const,
      categorySlug: 'hospitality',
    },
    {
      name: 'Bed & Breakfast',
      slug: 'bed-and-breakfast',
      profile: 'motel' as const,
      categorySlug: 'hospitality',
    },
    { name: 'Camp', slug: 'camp', profile: 'camp' as const, categorySlug: 'hospitality' },
    {
      name: 'Glamping Site',
      slug: 'glamping-site',
      profile: 'camp' as const,
      categorySlug: 'hospitality',
    },
    {
      name: 'Holiday Village',
      slug: 'holiday-village',
      profile: 'resort' as const,
      categorySlug: 'hospitality',
    },

    // Land
    {
      name: 'Residential Land',
      slug: 'residential-land',
      profile: 'land' as const,
      categorySlug: 'land',
    },
    {
      name: 'Commercial Land',
      slug: 'commercial-land',
      profile: 'land' as const,
      categorySlug: 'land',
    },
    {
      name: 'Industrial Land',
      slug: 'industrial-land',
      profile: 'land' as const,
      categorySlug: 'land',
    },
    {
      name: 'Agricultural Land',
      slug: 'agricultural-land',
      profile: 'land' as const,
      categorySlug: 'land',
    },
    {
      name: 'Mixed-Use Land',
      slug: 'mixed-use-land',
      profile: 'land' as const,
      categorySlug: 'land',
    },
    {
      name: 'Investment Land',
      slug: 'investment-land',
      profile: 'land' as const,
      categorySlug: 'land',
    },
    { name: 'Farm Land', slug: 'farm-land', profile: 'land' as const, categorySlug: 'land' },
    { name: 'Desert Land', slug: 'desert-land', profile: 'land' as const, categorySlug: 'land' },
    { name: 'Coastal Land', slug: 'coastal-land', profile: 'land' as const, categorySlug: 'land' },
    {
      name: 'Mountain Land',
      slug: 'mountain-land',
      profile: 'land' as const,
      categorySlug: 'land',
    },
    { name: 'Island', slug: 'island', profile: 'land' as const, categorySlug: 'land' },
    {
      name: 'Development Site',
      slug: 'development-site',
      profile: 'land' as const,
      categorySlug: 'land',
    },
    {
      name: 'Building Plot',
      slug: 'building-plot',
      profile: 'land' as const,
      categorySlug: 'land',
    },
  ]

  const typeDocsMap: Record<string, PropertyType> = {}
  for (const pt of defaultPropertyTypes) {
    const typeDoc = await getOrCreatePropertyType(
      payload,
      pt.name,
      pt.slug,
      pt.profile,
      pt.categorySlug,
      categoryMap,
    )
    typeDocsMap[pt.slug] = typeDoc
  }
  console.log('✅ Property Types setup complete.')

  // 5. Features
  console.log('✨ Setting up features...')
  const featuresList = [
    { name: 'Infinity Pool', slug: 'infinity-pool', featureGroup: 'outdoor' as const },
    { name: 'Gated Community', slug: 'gated-community', featureGroup: 'security' as const },
    {
      name: 'Fiber Optic Connectivity',
      slug: 'fiber-optic-connectivity',
      featureGroup: 'utilities' as const,
    },
    { name: 'Air Conditioning', slug: 'air-conditioning', featureGroup: 'interior' as const },
    { name: 'Landscaped Garden', slug: 'landscaped-garden', featureGroup: 'outdoor' as const },
    { name: 'Underground Parking', slug: 'underground-parking', featureGroup: 'parking' as const },
  ]
  const featureIds: number[] = []
  for (const feat of featuresList) {
    const id = await getOrCreateFeature(payload, feat.name, feat.slug, feat.featureGroup)
    featureIds.push(id)
  }
  console.log(`✅ Features setup complete: ${featureIds.length} features added.`)

  // 6. Seller
  console.log('👤 Setting up seller...')
  const sellerId = await getOrCreateSeller(payload)
  console.log(`✅ Seller setup complete. Seller ID: ${sellerId}`)

  // Generate missing properties so that we cover all 55 types, 2 of each
  const finalPropertiesToSeed = [...PROPERTIES_TO_SEED]
  let generatedCount = 0

  for (const pt of defaultPropertyTypes) {
    const existingCount = finalPropertiesToSeed.filter((p) => p.typeSlug === pt.slug).length
    const remainingToCreate = 2 - existingCount

    for (let i = 0; i < remainingToCreate; i++) {
      const generatedIndex = generatedCount++
      const location = getUniqueLocation(generatedIndex)
      const imageFile = getImageForProfile(pt.categorySlug, pt.profile)
      const specifications = getSpecificationsForProfile(pt.profile)

      finalPropertiesToSeed.push({
        typeSlug: pt.slug,
        title: `Premium ${pt.name} - Unit ${i + 1}`,
        description: `An exceptional ${pt.name} property offering high quality finishes, premium zoning, and all required administrative approvals. Located in the rapidly developing area of ${location.city}.`,
        price:
          pt.categorySlug === 'land'
            ? 8000000 + generatedIndex * 500000
            : 12000000 + generatedIndex * 1000000,
        currency: 'EGP',
        area: pt.categorySlug === 'land' ? 1000 + generatedIndex * 100 : 220 + generatedIndex * 20,
        address: {
          street: location.street,
          city: location.city,
          state: location.state,
          country: location.country,
          zip: location.zip,
        },
        geo: {
          lat: location.lat,
          lng: location.lng,
        },
        imageFile,
        specifications,
      })
    }
  }
  console.log(
    `📊 Total properties prepared for seeding: ${finalPropertiesToSeed.length} (covers all 55 types, 2 per type)`,
  )

  // 7. Ensure Media images exist in DB and retrieve IDs
  console.log('🖼️ Setting up images in media database...')
  const mediaMap: Record<string, number> = {}
  const uniqueImages = Array.from(new Set(finalPropertiesToSeed.map((p) => p.imageFile)))
  for (const imgName of uniqueImages) {
    const mediaId = await ensureMediaFile(payload, imgName, `Seed image for ${imgName}`)
    mediaMap[imgName] = mediaId
  }
  const projectMediaId = await ensureMediaFile(
    payload,
    'building-dreamy.jpg',
    'Project Development Layout Plan',
  )
  console.log('✅ Media files ready.')

  // 8. Properties Seeding Loop
  console.log('🏠 Seeding properties...')
  let seedCount = 0
  for (const prop of finalPropertiesToSeed) {
    const typeDoc = typeDocsMap[prop.typeSlug]
    if (!typeDoc) {
      console.warn(
        `⚠️ Skipped seeding "${prop.title}": property type slug "${prop.typeSlug}" not registered.`,
      )
      continue
    }

    const typeId = typeDoc.id
    const categorySlug =
      typeDoc.category && typeof typeDoc.category === 'object'
        ? typeDoc.category.slug
        : typeof typeDoc.category === 'number'
          ? Object.keys(categoryMap).find((key) => categoryMap[key] === typeDoc.category)
          : ''

    const imageMediaId = mediaMap[prop.imageFile]
    if (!imageMediaId) {
      console.warn(
        `⚠️ Skipped seeding "${prop.title}": media not resolved for "${prop.imageFile}".`,
      )
      continue
    }

    // Determine category specific specs grouping to populate
    const specsData: Record<string, unknown> = {}
    if (categorySlug === 'residential') {
      specsData.residential = {
        ...getCommonCategorySpecs('residential'),
        ...prop.specifications,
      }
    } else if (categorySlug === 'commercial') {
      specsData.commercial = {
        ...getCommonCategorySpecs('commercial'),
        ...prop.specifications,
      }
    } else if (categorySlug === 'hospitality') {
      specsData.hospitality = {
        ...getCommonCategorySpecs('hospitality'),
        ...prop.specifications,
      }
      // Populate hospitality operational metrics (adr, occupancy, revPAR, reportDate)
      specsData.operationalData = {
        avgDailyRate: 150,
        occupancyRate: 85,
        revPAR: 127.5,
        lastReportDate: new Date('2026-07-01').toISOString(),
      }
    } else if (categorySlug === 'land') {
      specsData.land = {
        ...getCommonCategorySpecs('land'),
        ...prop.specifications,
      }
    }

    // Server-side ID generation fallback
    const propertyCustomId = crypto.randomBytes(8).toString('hex')

    // Create the Property Document
    await payload.create({
      collection: 'properties',
      data: {
        id: propertyCustomId,
        title: prop.title,
        description: prop.description,
        price: prop.price,
        currency: prop.currency,
        area: prop.area,
        category: categorySlug as 'residential' | 'commercial' | 'hospitality' | 'land',
        propertyType: typeId,
        listingStatus: forSaleStatusId,
        constructionStatus: readyStatusId,
        seller: sellerId,
        features: featureIds,
        photos: [imageMediaId],
        hasProject: true,
        projectImage: projectMediaId,
        projectDescription: {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'paragraph',
                format: '',
                indent: 0,
                version: 1,
                children: [
                  {
                    type: 'text',
                    text: `This is a sample project development description for ${prop.title}, showcasing high-end architectural drawings and zoning layout specifications.`,
                    version: 1,
                  },
                ],
              },
            ],
            direction: 'ltr',
          },
        },
        customSpecifications: [
          {
            label: 'Eco-Friendly Rating',
            icon: 'Shield',
            valueType: 'text',
            value: 'LEED Certified Platinum',
          },
          {
            label: 'Construction Warranty',
            icon: 'FileText',
            valueType: 'number',
            value: '10',
          },
        ],
        location: {
          geo: {
            lat: prop.geo.lat,
            lng: prop.geo.lng,
          },
          address: {
            street: prop.address.street,
            city: prop.address.city,
            state: prop.address.state,
            country: prop.address.country,
            zip: prop.address.zip,
          },
          meta: {
            source: 'manual',
            extractedAt: new Date().toISOString(),
            extractionConfidence: 1.0,
          },
        },
        ...specsData,
      },
    })
    seedCount++
  }

  console.log(`🎉 Seeding complete! Created ${seedCount} properties successfully.`)
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ CRITICAL ERROR during property seeding:', err)
  process.exit(1)
})
