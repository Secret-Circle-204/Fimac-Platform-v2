import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import fs from 'fs'
import path from 'path'
import { SellerCounterService } from '../src/services/seller-counter.service'
import { seedPropertyCategories } from '../src/db/seedPropertyCategories'

async function main() {
  console.log('🏁 Initializing Payload...')
  const payload = await getPayload({ config: configPromise })

  console.log('⚡ Running categories seeder...')
  await seedPropertyCategories(payload)

  console.log('📊 Counting existing properties...')
  const countResult = await payload.count({
    collection: 'properties',
  })
  console.log(`📊 Found ${countResult.totalDocs} properties in the database.`)
  if (countResult.totalDocs >= 5000) {
    console.log('✅ Database already has 5000 or more properties. Skipping seeding.')
    process.exit(0)
  }

  const remainingToSeed = 5000 - countResult.totalDocs
  console.log(`🏗️ Seeding remaining ${remainingToSeed} properties to reach 5000...`)

  console.log('🔍 Fetching listing statuses...')
  const statusesResult = await payload.find({
    collection: 'listing-statuses',
    limit: 100,
  })
  const statusMap: Record<string, number> = {}
  statusesResult.docs.forEach((doc) => {
    statusMap[doc.slug] = Number(doc.id)
  })

  console.log('🔍 Fetching construction statuses...')
  const constructionStatusesResult = await payload.find({
    collection: 'construction-statuses',
    limit: 100,
  })
  const constructionStatusMap: Record<string, number> = {}
  constructionStatusesResult.docs.forEach((doc) => {
    constructionStatusMap[doc.slug] = Number(doc.id)
  })

  console.log('👥 Finding or creating seed seller...')
  let sellerId: number
  const existingSeller = await payload.find({
    collection: 'sellers',
    where: { email: { equals: 'seed-seller@fimac.com' } },
    limit: 1,
  })

  if (existingSeller.docs.length > 0) {
    sellerId = Number(existingSeller.docs[0].id)
    console.log(`%c[PropertiesSeed] Using existing seller: ${existingSeller.docs[0].full_name}`, 'color: green')
  } else {
    const newSeller = await payload.create({
      collection: 'sellers',
      data: {
        email: 'seed-seller@fimac.com',
        password: 'password123',
        full_name: 'Premium Properties Developer',
        phone: '+201023456789',
        verification_status: 'verified',
      },
    })
    sellerId = Number(newSeller.id)
    console.log(`%c[PropertiesSeed] Created new seller: ${newSeller.full_name}`, 'color: green')
  }

  console.log('🔍 Fetching categories for type mapping...')
  const categoriesRes = await payload.find({
    collection: 'property-categories',
    limit: 100,
  })
  const categoryIdMap: Record<string, number> = {}
  categoriesRes.docs.forEach((doc) => {
    categoryIdMap[doc.slug] = Number(doc.id)
  })

  console.log('🏷️ Finding or creating property types...')
  const propertyTypeNames = ['Apartment', 'Villa', 'Chalet', 'Office', 'Studio']
  const typeMap: Record<string, number> = {}

  for (const name of propertyTypeNames) {
    const existingType = await payload.find({
      collection: 'property-types',
      where: { name: { equals: name } },
      limit: 1,
    })

    if (existingType.docs.length > 0) {
      typeMap[name] = Number(existingType.docs[0].id)
      console.log(`[PropertiesSeed] Using existing type: ${name}`)
    } else {
      const typeCategorySlug = name === 'Office' ? 'commercial' : 'residential'
      const typeCategoryId = categoryIdMap[typeCategorySlug]

      const newType = await payload.create({
        collection: 'property-types',
        data: {
          name,
          slug: name.toLowerCase(),
          category: typeCategoryId,
        },
      })
      typeMap[name] = Number(newType.id)
      console.log(`[PropertiesSeed] Created type: ${name} linked to category ${typeCategorySlug}`)
    }
  }

  console.log('✨ Finding or creating features...')
  const featureList: { name: string }[] = [
    { name: 'Swimming Pool' },
    { name: 'Private Garden' },
    { name: 'Elevator' },
    { name: 'Central A/C' },
    { name: 'Sea View' },
    { name: '24/7 Security' },
  ]
  const featureIds: number[] = []

  for (const feat of featureList) {
    const existingFeat = await payload.find({
      collection: 'features',
      where: { name: { equals: feat.name } },
      limit: 1,
    })

    if (existingFeat.docs.length > 0) {
      featureIds.push(Number(existingFeat.docs[0].id))
      console.log(`[PropertiesSeed] Using existing feature: ${feat.name}`)
    } else {
      const newFeat = await payload.create({
        collection: 'features',
        data: {
          name: feat.name,
          slug: feat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        },
      })
      featureIds.push(Number(newFeat.id))
      console.log(`[PropertiesSeed] Created feature: ${feat.name}`)
    }
  }

  console.log('🖼️ Checking and uploading seed images from public folder...')
  const seedImageNames = [
    'apartment-seed-1.webp',
    'apartment-seed-2.webp',
    'apartment-seed-3.webp',
    'villa-seed-1.jpg',
    'villa-seed-2.jpg',
    'chalet-seed-1.webp',
    'office-seed-1.webp',
    'studio-seed-1.webp',
  ]
  const mediaIds: number[] = []

  for (const imageName of seedImageNames) {
    const existingMedia = await payload.find({
      collection: 'media',
      where: { filename: { equals: imageName } },
      limit: 1,
    })

    if (existingMedia.docs.length > 0) {
      mediaIds.push(Number(existingMedia.docs[0].id))
      console.log(`[PropertiesSeed] Using existing media for ${imageName}`)
    } else {
      const publicPath = path.join(process.cwd(), 'public', imageName)
      if (fs.existsSync(publicPath)) {
        console.log(`[PropertiesSeed] Uploading seed image: ${imageName} from ${publicPath}...`)
        try {
          const fileBuffer = fs.readFileSync(publicPath)
          const fileStats = fs.statSync(publicPath)

          const mediaDoc = await payload.create({
            collection: 'media',
            data: {
              alt: `Fimac Elite Seed Image for ${imageName.split('-')[0]}`,
            },
            file: {
              data: fileBuffer,
              name: imageName,
              size: fileStats.size,
              mimetype: imageName.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
            },
          })
          mediaIds.push(Number(mediaDoc.id))
          console.log(`[PropertiesSeed] Uploaded new media: ${imageName}`)
        } catch (uploadErr) {
          console.error(`[PropertiesSeed] Failed to upload image ${imageName}:`, uploadErr)
        }
      }
    }
  }

  if (mediaIds.length === 0) {
    console.warn('⚠️ No media files were uploaded. Make sure you have the files in the public/ folder.')
  }

  // Define 19 distinct luxury destinations worldwide (diverse states, countries)
  const locations = [
    {
      city: 'Cairo',
      state: 'Cairo Governorate',
      country: 'Egypt',
      zip: '11511',
      lat: 30.0444,
      lng: 31.2357,
      streets: ['El-Tahrir Street', '9th Street Maadi', 'El-Moez Street', 'Zamalek Blvd', 'El-Bustan Street'],
      descriptions: [
        'A magnificent residence in the heart of historic Cairo, featuring luxury finishes and unmatched city views.',
        'Spacious property located in a quiet street, perfect for families seeking convenience and premium style.',
        'Elegant living space designed for modern living with state-of-the-art facilities and prime city access.'
      ]
    },
    {
      city: 'Alexandria',
      state: 'Alexandria Governorate',
      country: 'Egypt',
      zip: '21500',
      lat: 31.2001,
      lng: 29.9187,
      streets: ['El-Geish Road', 'Fouad Street', 'Corniche Road', 'El-Mansheya Square', 'Stanly Street'],
      descriptions: [
        'Coastal masterpiece providing fresh sea breeze and breathtaking sunsets over the Mediterranean.',
        'Centrally located near legendary landmarks, boasting classic European style merged with modern amenities.',
        'Fabulous design featuring large glass panels, marble flooring, and spacious reception areas.'
      ]
    },
    {
      city: 'Hurghada',
      state: 'Red Sea Governorate',
      country: 'Egypt',
      zip: '84511',
      lat: 27.2579,
      lng: 33.8116,
      streets: ['Sheraton Road', 'El-Mamsha El-Seiahy', 'El-Dahar Square', 'Sahl Hasheesh Blvd', 'El-Gouna Road'],
      descriptions: [
        'Exclusive resort-style living with spectacular Red Sea views and private outdoor garden.',
        'Excellent option for holiday home seekers, featuring contemporary coastal designs and sunlit spaces.',
        'Premium chalet offering direct lagoon access, modern open-plan kitchen, and elegant finishing.'
      ]
    },
    {
      city: 'Sharm El Sheikh',
      state: 'South Sinai Governorate',
      country: 'Egypt',
      zip: '46619',
      lat: 27.9158,
      lng: 34.3299,
      streets: ['Naama Bay Promenade', 'El-Salam Road', 'Soho Square Blvd', 'Nabq Bay Street', 'Hadaba Road'],
      descriptions: [
        'Stunning retreat nestled between beautiful mountains and crystal-clear waters, boasting ultimate privacy.',
        'Modern smart home with private pool, sun deck, and proximity to elite dining destinations.',
        'Scenic luxury studio offering peaceful atmosphere, private patio, and direct beach access.'
      ]
    },
    {
      city: 'Giza',
      state: 'Giza Governorate',
      country: 'Egypt',
      zip: '12511',
      lat: 29.9870,
      lng: 31.2118,
      streets: ['Pyramids Road', 'El-Haram Street', 'Smart Village Road', 'Mehwar 26th July'],
      descriptions: [
        'Magnificent villa overlooking the historic Pyramids landscape, boasting ultra-modern amenities.',
        'Luxury penthouse situated in a high-end compound in 6th of October, featuring private security and parking.'
      ]
    },
    {
      city: 'North Coast',
      state: 'Matrouh Governorate',
      country: 'Egypt',
      zip: '51718',
      lat: 30.9160,
      lng: 28.9480,
      streets: ['Alex-Matrouh Coastal Road', 'Hacienda Bay Blvd', 'Marassi Drive', 'Amwaj Avenue'],
      descriptions: [
        'Spectacular summer residence on the white sandy beaches of Sahel, offering premium resort amenities.',
        'Elegant sea-front chalet with a spacious private terrace and direct access to swimming lagoons.'
      ]
    },
    {
      city: 'El Gouna',
      state: 'Red Sea Governorate',
      country: 'Egypt',
      zip: '84513',
      lat: 27.3941,
      lng: 33.6788,
      streets: ['Abu Tig Marina Road', 'Downtown El Gouna Street', 'Golf Course Drive'],
      descriptions: [
        'Premium lagoon-front villa with a private jetty, spacious outdoor pool, and elegant contemporary design.',
        'Chic marina apartment offering steps-away access to luxury yacht berths and fine dining spots.'
      ]
    },
    {
      city: 'New Capital',
      state: 'Cairo Governorate',
      country: 'Egypt',
      zip: '11835',
      lat: 30.0131,
      lng: 31.7424,
      streets: ['Regional Ring Road', 'Green River Walk', 'Governmental District Blvd', 'Diplomatic Quarter Rd'],
      descriptions: [
        'Futuristic smart villa in the new capital, featuring central automation, green power, and modern design.',
        'High-end administrative office space in a premium business tower with state-of-the-art facilities.'
      ]
    },
    {
      city: 'Dubai',
      state: 'Dubai',
      country: 'United Arab Emirates',
      zip: '00000',
      lat: 25.2048,
      lng: 55.2708,
      streets: ['Sheikh Zayed Road', 'Dubai Marina Walk', 'Palm Jumeirah Crescent', 'Downtown Blvd'],
      descriptions: [
        'Spectacular high-rise residence with panoramic views of the Arabian Gulf and Dubai skyline.',
        'Ultra-luxury villa featuring a private infinity pool, state-of-the-art home automation, and private beach access.',
        'Chic metropolitan apartment steps away from world-class dining and high-end shopping.'
      ]
    },
    {
      city: 'Abu Dhabi',
      state: 'Abu Dhabi',
      country: 'United Arab Emirates',
      zip: '00000',
      lat: 24.4539,
      lng: 54.3773,
      streets: ['Corniche Road', 'Yas Island Blvd', 'Saadiyat Cultural District'],
      descriptions: [
        'Stunning waterfront property with elegant architectural finishes and direct canal views.',
        'Sophisticated villa in a prestigious community, boasting private landscaped gardens and luxury amenities.'
      ]
    },
    {
      city: 'Riyadh',
      state: 'Riyadh Province',
      country: 'Saudi Arabia',
      zip: '11461',
      lat: 24.7136,
      lng: 46.6753,
      streets: ['Tahlia Street', 'King Fahd Road', 'Olaya Main Street'],
      descriptions: [
        'Grand modern mansion in Riyadh featuring elegant Najdi-modern architectural fusion.',
        'Upscale luxury apartment in the heart of Olaya, offering maximum security and private parking.'
      ]
    },
    {
      city: 'London',
      state: 'Greater London',
      country: 'United Kingdom',
      zip: 'W1K 7AA',
      lat: 51.5074,
      lng: -0.1278,
      streets: ['Piccadilly', 'Park Lane', 'Kensington High Street', 'Mayfair Square'],
      descriptions: [
        'An elegant townhouse in Mayfair, featuring classic Victorian architecture and meticulously restored interiors.',
        'Sophisticated modern penthouse overlooking Hyde Park, featuring double-height ceilings and concierge service.'
      ]
    },
    {
      city: 'Paris',
      state: 'Île-de-France',
      country: 'France',
      zip: '75008',
      lat: 48.8566,
      lng: 2.3522,
      streets: ['Avenue des Champs-Élysées', 'Avenue Montaigne', 'Rue de Rivoli', 'Boulevard Saint-Germain'],
      descriptions: [
        'Haussmann-style luxury apartment featuring high ceilings, original fireplaces, and views of the Eiffel Tower.',
        'Exquisite residence in Saint-Germain-des-Prés, offering a blend of historic charm and luxury modern finishes.'
      ]
    },
    {
      city: 'Monaco',
      state: 'Monte Carlo',
      country: 'Monaco',
      zip: '98000',
      lat: 43.7384,
      lng: 7.4246,
      streets: ['Avenue Princesse Grace', 'Avenue de la Costa', 'Boulevard Albert 1er'],
      descriptions: [
        'Exclusive penthouse in Monte Carlo offering breathtaking views of the Mediterranean Sea and the harbor.',
        'Ultra-private luxury residence featuring state-of-the-art security, absolute privacy, and elite amenities.'
      ]
    },
    {
      city: 'Saint-Tropez',
      state: 'Provence-Alpes-Côte d\'Azur',
      country: 'France',
      zip: '83990',
      lat: 43.2689,
      lng: 6.6406,
      streets: ['Rue Allard', 'Route des Plages', 'Quai Suffren'],
      descriptions: [
        'Stunning Riviera villa with private tennis court, swimming pool, and direct sea access.',
        'Charming coastal chalet located in a prestigious gated estate, featuring beautiful olive groves.'
      ]
    },
    {
      city: 'New York',
      state: 'New York',
      country: 'United States',
      zip: '10019',
      lat: 40.7128,
      lng: -74.0060,
      streets: ['Fifth Avenue', 'Broadway', 'Park Avenue', 'Central Park West'],
      descriptions: [
        'Iconic Manhattan penthouse offering 360-degree views of Central Park and the city skyline.',
        'Spacious luxury loft in Soho with exposed brick walls, custom finishes, and high-end chef kitchen.'
      ]
    },
    {
      city: 'Miami',
      state: 'Florida',
      country: 'United States',
      zip: '33131',
      lat: 25.7617,
      lng: -80.1918,
      streets: ['Ocean Drive', 'Collins Avenue', 'Brickell Avenue', 'Biscayne Blvd'],
      descriptions: [
        'Tropical paradise villa with private dock, infinity pool, and open-concept indoor-outdoor layout.',
        'Stunning waterfront condo in Brickell, featuring custom marble bathrooms and private balcony.'
      ]
    },
    {
      city: 'Los Angeles',
      state: 'California',
      country: 'United States',
      zip: '90210',
      lat: 34.0522,
      lng: -118.2437,
      streets: ['Rodeo Drive', 'Sunset Blvd', 'Wilshire Blvd', 'Melrose Avenue'],
      descriptions: [
        'Modern Bel Air architectural marvel with sweeping canyon-to-ocean views and automated sliding walls.',
        'Private gated estate in Beverly Hills featuring a massive home theater, wine cellar, and manicured lawns.'
      ]
    },
    {
      city: 'Rome',
      state: 'Lazio',
      country: 'Italy',
      zip: '00187',
      lat: 41.9028,
      lng: 12.4964,
      streets: ['Via Veneto', 'Via Condotti', 'Via del Corso'],
      descriptions: [
        'Palatial residence steps away from historic monuments, featuring frescoed ceilings and marble columns.',
        'Elegantly renovated penthouse in the historic center, offering a quiet oasis with spacious terrace views.'
      ]
    }
  ]

  const adjectives = ['Luxurious', 'Premium', 'Modern', 'Spacious', 'Stunning', 'Cosy', 'Cozy', 'Elegant', 'Charming', 'Elite', 'Breathtaking', 'Scenic', 'Grand', 'Renovated', 'Exclusive']
  const listingStatuses: ('for-sale' | 'sold')[] = ['for-sale', 'for-sale', 'for-sale', 'sold']
  const constructionStatuses: ('ready' | 'under_construction' | 'brand_new' | 'off_plan' | 'renovated')[] = ['ready', 'ready', 'under_construction', 'brand_new']
  const heatingTypes: ('central' | 'electric' | 'gas' | 'oil' | 'propane')[] = ['central', 'electric', 'gas']

  const usedCoordinates = new Set<string>()
  const batchSize = 5

  for (let i = 0; i < remainingToSeed; i += batchSize) {
    const promises = []

    for (let j = 0; j < batchSize && (i + j) < remainingToSeed; j++) {
      const idx = i + j
      const baseLoc = locations[idx % locations.length]

      // Choose property type
      const typesKeys = Object.keys(typeMap)
      const typeName = typesKeys[Math.floor(Math.random() * typesKeys.length)]
      const propertyTypeId = typeMap[typeName]
      const category = typeName === 'Office' ? 'commercial' : 'residential'

      // Construct random titles and details
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
      const streetName = baseLoc.streets[Math.floor(Math.random() * baseLoc.streets.length)]
      const title = `${adj} ${typeName} at ${streetName}, ${baseLoc.city}`

      const descList = baseLoc.descriptions
      const description = `${descList[Math.floor(Math.random() * descList.length)]} Enjoy a highly sought-after location combined with high-quality interior finishes, efficient layouts, and natural light.`

      // Select currency based on country
      let currency: 'EGP' | 'USD' | 'EUR' = 'USD'
      if (baseLoc.country === 'Egypt') {
        currency = Math.random() > 0.3 ? 'EGP' : 'USD'
      } else if (baseLoc.country === 'France' || baseLoc.country === 'Italy' || baseLoc.country === 'Monaco') {
        currency = 'EUR'
      }

      const bedrooms = Math.floor(1 + Math.random() * 5)
      const bathrooms = Math.max(1, bedrooms - Math.floor(Math.random() * 2))
      const squareMeters = bedrooms * 50 + Math.floor(Math.random() * 80)
      const lotSize = squareMeters + Math.floor(Math.random() * 200)
      const yearBuilt = Math.floor(2015 + Math.random() * 11)

      // Select random features (1 to 4)
      const shuffledFeatures = [...featureIds].sort(() => 0.5 - Math.random())
      const selectedFeatures = shuffledFeatures.slice(0, Math.floor(1 + Math.random() * 4))

      // Select random photos (1 to 3) if media uploaded
      const selectedPhotos = mediaIds.length > 0
        ? [...mediaIds].sort(() => 0.5 - Math.random()).slice(0, Math.floor(1 + Math.random() * 3))
        : []

      // Generate unique coordinates
      let lat = 0
      let lng = 0
      let coordKey = ''
      let attempts = 0

      do {
        const angle = Math.random() * 2 * Math.PI
        const distance = 0.002 + Math.random() * 0.12 // up to ~15km spread around city center

        lat = Number((baseLoc.lat + distance * Math.cos(angle)).toFixed(6))
        lng = Number((baseLoc.lng + distance * Math.sin(angle)).toFixed(6))

        coordKey = `${lat.toFixed(6)},${lng.toFixed(6)}`
        attempts++
      } while (usedCoordinates.has(coordKey) && attempts < 100)

      usedCoordinates.add(coordKey)

      // Project logic - 10% of properties get project details
      const hasProject = idx % 10 === 0
      const projectImage = hasProject && selectedPhotos.length > 0 ? selectedPhotos[0] : undefined
      const projectDescription = hasProject
        ? {
            root: {
              type: 'root',
              direction: null as 'ltr' | 'rtl' | null,
              format: '' as 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '',
              indent: 0,
              version: 1,
              children: [
                {
                  type: 'paragraph',
                  format: '' as 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '',
                  indent: 0,
                  version: 1,
                  children: [
                    {
                      type: 'text',
                      text: `This premium project at ${streetName} features state-of-the-art sustainable architecture, bespoke luxury amenities, and exclusive private residences designed for sophisticated modern living.`,
                      format: 0,
                      style: '',
                      version: 1
                    }
                  ]
                }
              ]
            }
          }
        : undefined

      const listingStatusSlug = listingStatuses[Math.floor(Math.random() * listingStatuses.length)]
      const listingStatusId = statusMap[listingStatusSlug]

      const constructionStatusSlug = constructionStatuses[Math.floor(Math.random() * constructionStatuses.length)]
      const constructionStatusId = constructionStatusMap[constructionStatusSlug]

      // Only add to promise list if target status resolved successfully
      if (listingStatusId && constructionStatusId) {
        promises.push(
          payload.create({
            collection: 'properties',
            data: {
              title,
              description,
              propertyType: propertyTypeId,
              price: currency === 'EGP'
                ? Math.floor(3000000 + Math.random() * 32000000)
                : currency === 'USD'
                  ? Math.floor(100000 + Math.random() * 1100000)
                  : Math.floor(90000 + Math.random() * 910000),
              currency,
              listingStatus: listingStatusId,
              constructionStatus: constructionStatusId,
              seller: sellerId,
              category,
              area: squareMeters,
              residential: category === 'residential' ? {
                bedrooms,
                bathrooms,
                yearBuilt,
                heatingType: heatingTypes[Math.floor(Math.random() * heatingTypes.length)],
              } : undefined,
              commercial: category === 'commercial' ? {
                floor: Math.floor(Math.random() * 5) + 1,
                parkingSpaces: Math.floor(Math.random() * 10),
                office: {
                  meetingRooms: Math.floor(Math.random() * 3),
                  elevators: Math.floor(Math.random() * 2),
                }
              } : undefined,
              features: selectedFeatures,
              photos: selectedPhotos,
              location: {
                geo: {
                  lat,
                  lng,
                },
                address: {
                  street: streetName,
                  city: baseLoc.city,
                  state: baseLoc.state,
                  country: baseLoc.country,
                  zip: baseLoc.zip,
                },
                meta: {
                  source: 'manual',
                  extractedAt: new Date().toISOString(),
                },
              },
              hasProject,
              projectImage,
              projectDescription,
            },
          })
        )
      }
    }

    if (promises.length > 0) {
      try {
        await Promise.all(promises)
        console.log(`📈 Seeded ${i + promises.length}/${remainingToSeed} properties (Total: ${countResult.totalDocs + i + promises.length})...`)
        // Sleep for 50ms to release PostgreSQL connections back to the pool
        await new Promise((resolve) => setTimeout(resolve, 50))
      } catch (err) {
        console.error(`❌ Failed in batch starting from #${i}:`, err)
      }
    }
  }

  console.log('🔄 Reconciling and syncing properties_count for all sellers in the database...')
  const counterService = new SellerCounterService()
  await counterService.syncAll({ payload })
  console.log('✅ All seller properties counts successfully synchronized!')

  console.log('🎉 Seeding successfully completed!')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
