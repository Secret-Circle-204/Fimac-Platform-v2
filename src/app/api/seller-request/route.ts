import { NextRequest, NextResponse } from 'next/server'
import type { Payload, Where } from 'payload'
import { getPayloadClient } from '@/db/client'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { sendEmail, emailTemplates } from '@/lib/email/nodemailer'
import { EMAIL_FROM, SERVER_URL } from '@/env'
import slugify from 'slugify'
import { getCachedCompanySettings } from '@/lib/cache/company-settings'
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
  getMaxPhotosForCategory,
  UPLOAD_CONCURRENCY,
  formatFileSize,
} from '@/lib/media/config'

// ── Concurrency Helper ──────────────────────────────────────────────────────

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let currentIndex = 0

  async function worker() {
    while (currentIndex < items.length) {
      const index = currentIndex++
      results[index] = await fn(items[index], index)
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker(),
  )
  await Promise.all(workers)
  return results
}

// ── Folder Helper ───────────────────────────────────────────────────────────

async function getOrCreateFolder(
  payload: Payload,
  name: string,
  parentId: number | null = null,
): Promise<number> {
  const whereClause: Where = {
    name: { equals: name },
  }
  if (parentId !== null) {
    whereClause['parent'] = { equals: parentId }
  } else {
    whereClause['parent'] = { exists: false }
  }

  const existing = await payload.find({
    collection: 'media-folders',
    where: whereClause,
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length > 0) {
    return Number(existing.docs[0].id)
  }

  const newFolder = await payload.create({
    collection: 'media-folders',
    data: {
      name,
      slug: '',
      path: '',
      depth: 0,
      sortOrder: 0,
      parent: parentId,
    },
  })

  return Number(newFolder.id)
}

// ── Main Route Handler ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let createdSellerRequestId: number | null = null
  let createdFolderId: number | null = null
  const createdMediaIds: number[] = []

  let payloadInstance: Payload | null = null

  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'seller') {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged in as a seller to submit a request.' },
        { status: 401 },
      )
    }

    const payload = await getPayloadClient()
    payloadInstance = payload

    // 1. Parse Multipart FormData or JSON
    const contentType = request.headers.get('content-type') || ''
    let body: Record<string, unknown> = {}
    const files: File[] = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const dataStr = formData.get('data')

      if (typeof dataStr === 'string') {
        try {
          body = JSON.parse(dataStr) as Record<string, unknown>
        } catch {
          return NextResponse.json({ error: 'Invalid JSON data payload' }, { status: 400 })
        }
      } else {
        formData.forEach((value, key) => {
          if (key !== 'photos' && typeof value === 'string') {
            body[key] = value
          }
        })
      }

      const allPhotos = formData.getAll('photos')
      for (const item of allPhotos) {
        if (item instanceof File && item.size > 0) {
          files.push(item)
        }
      }
    } else {
      body = (await request.json()) as Record<string, unknown>
    }

    const {
      property_type,
      category,
      property_title,
      property_description,
      property_location,
      city,
      state,
      country,
      zip,
      full_address,
      asking_price,
      currency,
      property_size,
      bedrooms,
      bathrooms,
      constructionStatus,
      latitude,
      longitude,
      google_maps_url,
      features,
      customFeatures,
      customSpecifications,
      residential,
      commercial,
      hospitality,
      land,
      idempotencyKey,
    } = body

    console.log('📥 [SellerRequest API] Received submission request.')
    console.log(`   ↳ Content-Type: "${contentType.split(';')[0]}", Photos Attached: ${files.length}, IdempotencyKey: "${idempotencyKey || 'none'}"`)
    console.log(`   ↳ Authenticated User: "${user.full_name}" <${user.email}>`)

    // 2. Validation
    if (
      !property_type ||
      !property_title ||
      !property_description ||
      !property_location ||
      !city ||
      !state ||
      !country ||
      !asking_price ||
      !currency
    ) {
      console.warn('⚠️ [SellerRequest API] Validation failed: Missing required fields.')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 3. Idempotency Check
    if (typeof idempotencyKey === 'string' && idempotencyKey.trim().length > 0) {
      const existingRequest = await payload.find({
        collection: 'seller-requests',
        where: {
          idempotencyKey: { equals: idempotencyKey.trim() },
        },
        limit: 1,
        depth: 0,
      })

      if (existingRequest.docs.length > 0) {
        const doc = existingRequest.docs[0]
        if (doc.status !== 'draft') {
          console.log(`🔁 [SellerRequest API] Duplicate submission detected for IdempotencyKey "${idempotencyKey}". Returning existing Request #${doc.id}.`)
          return NextResponse.json({
            success: true,
            message:
              'Your listing request has already been submitted and is under review.',
            requestId: doc.id,
            isDuplicate: true,
          })
        }
      }
    }

    // 4. File Count & Pre-Validation Checks
    const maxAllowedPhotos = getMaxPhotosForCategory(typeof category === 'string' ? category : null)
    if (files.length > maxAllowedPhotos) {
      console.warn(`⚠️ [SellerRequest API] Too many photos for category "${category || 'default'}": ${files.length} > ${maxAllowedPhotos}`)
      return NextResponse.json(
        {
          error: `Maximum ${maxAllowedPhotos} photos allowed for ${category || 'this'} property. Received ${files.length}.`,
        },
        { status: 400 },
      )
    }

    for (const file of files) {
      if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
        console.warn(`⚠️ [SellerRequest API] File "${file.name}" size ${file.size} exceeds ${MAX_IMAGE_FILE_SIZE_BYTES}`)
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds the maximum allowed size of ${formatFileSize(MAX_IMAGE_FILE_SIZE_BYTES)}.`,
          },
          { status: 400 },
        )
      }

      const allowedTypes: readonly string[] = ALLOWED_IMAGE_MIME_TYPES
      if (file.type && !allowedTypes.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
        console.warn(`⚠️ [SellerRequest API] File "${file.name}" unsupported type: "${file.type}"`)
        return NextResponse.json(
          {
            error: `File type "${file.type}" for "${file.name}" is not supported. Allowed formats: JPEG, PNG, WebP, GIF, AVIF, HEIC/HEIF.`,
          },
          { status: 400 },
        )
      }
    }

    console.log(`🔍 [SellerRequest API] [1/5] Pre-validation passed for "${property_title}" (${files.length} photo(s)).`)

    // 5. Resolve Construction Status
    let constructionStatusId: number | undefined = undefined
    if (constructionStatus) {
      const statusDoc = await payload.find({
        collection: 'construction-statuses',
        where: {
          slug: {
            equals: constructionStatus,
          },
        },
        limit: 1,
        depth: 0,
      })
      if (statusDoc.docs.length > 0) {
        constructionStatusId = Number(statusDoc.docs[0].id)
      }
    }

    if (!constructionStatusId) {
      const defaultStatus = await payload.find({
        collection: 'construction-statuses',
        where: { slug: { equals: 'ready' } },
        limit: 1,
        depth: 0,
      })
      if (defaultStatus.docs.length > 0) {
        constructionStatusId = Number(defaultStatus.docs[0].id)
      }
    }

    if (!constructionStatusId) {
      const allStatuses = await payload.find({
        collection: 'construction-statuses',
        limit: 1,
        depth: 0,
      })
      if (allStatuses.docs.length > 0) {
        constructionStatusId = Number(allStatuses.docs[0].id)
      }
    }

    if (!constructionStatusId) {
      return NextResponse.json({ error: 'Valid construction status is required' }, { status: 400 })
    }

    const derivedBedrooms = bedrooms ?? (typeof residential === 'object' && residential !== null ? (residential as Record<string, unknown>).bedrooms : undefined)
    const derivedBathrooms = bathrooms ?? (typeof residential === 'object' && residential !== null ? (residential as Record<string, unknown>).bathrooms : undefined)

    // 6. Resolve / Create Custom Features
    const finalFeatureIds: number[] = []
    if (features && Array.isArray(features)) {
      features.forEach((id) => {
        const numericId = Number(id)
        if (!isNaN(numericId)) {
          finalFeatureIds.push(numericId)
        }
      })
    }

    if (Array.isArray(customFeatures) && customFeatures.length > 0) {
      for (const customName of customFeatures) {
        const trimmed = String(customName).trim()
        if (!trimmed) continue

        const customSlug = slugify(trimmed, { lower: true, strict: true })
        const existing = await payload.find({
          collection: 'features',
          where: { slug: { equals: customSlug } },
          limit: 1,
          depth: 0,
        })

        if (existing.docs.length > 0) {
          finalFeatureIds.push(Number(existing.docs[0].id))
        } else {
          const newFeature = await payload.create({
            collection: 'features',
            data: {
              name: trimmed,
              slug: customSlug,
              visibleInCategories: category
                ? [category as 'residential' | 'commercial' | 'hospitality' | 'land']
                : undefined,
            },
          })
          finalFeatureIds.push(Number(newFeature.id))
        }
      }
    }

    // 7. Step 1: Create Seller Request in 'draft' status
    console.log('📝 [SellerRequest API] [2/5] Creating draft Seller Request...')
    const sellerRequest = await payload.create({
      collection: 'seller-requests',
      data: {
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        property_type:
          typeof property_type === 'number'
            ? property_type
            : Number(property_type),
        property_title: String(property_title),
        property_description: String(property_description),
        property_location: String(property_location),
        city: String(city),
        state: String(state),
        country: String(country),
        zip: typeof zip === 'string' ? zip : undefined,
        full_address: typeof full_address === 'string' ? full_address : undefined,
        asking_price: Number(asking_price),
        currency: currency as 'EGP' | 'USD' | 'EUR',
        property_size: property_size ? Number(property_size) : undefined,
        constructionStatus: constructionStatusId,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        google_maps_url: typeof google_maps_url === 'string' ? google_maps_url : undefined,
        features: finalFeatureIds.length > 0 ? finalFeatureIds : undefined,
        customSpecifications: Array.isArray(customSpecifications) ? customSpecifications : undefined,
        seller: Number(user.id),
        status: 'draft',
        category: category as 'residential' | 'commercial' | 'hospitality' | 'land' | undefined,
        residential: typeof residential === 'object' && residential !== null ? residential : undefined,
        commercial: typeof commercial === 'object' && commercial !== null ? commercial : undefined,
        hospitality: typeof hospitality === 'object' && hospitality !== null ? hospitality : undefined,
        land: typeof land === 'object' && land !== null ? land : undefined,
        idempotencyKey: typeof idempotencyKey === 'string' && idempotencyKey.trim() ? idempotencyKey.trim() : undefined,
      },
    })

    createdSellerRequestId = Number(sellerRequest.id)
    console.log(`   ↳ Draft Request #${sellerRequest.id} created successfully.`)

    // 8. Step 2: Create / Resolve Virtual Folders
    let requestFolderId: number | null = null
    if (files.length > 0) {
      console.log('📁 [SellerRequest API] [3/5] Resolving virtual folder hierarchy...')
      const rootFolderId = await getOrCreateFolder(payload, 'Seller Requests', null)
      requestFolderId = await getOrCreateFolder(
        payload,
        `Request #${sellerRequest.id} - ${property_title}`,
        rootFolderId,
      )
      createdFolderId = requestFolderId
      console.log(`   ↳ Virtual Folder ready: "Seller Requests / Request #${sellerRequest.id} - ${property_title}" (ID: ${requestFolderId})`)

      // 9. Step 3: Process and Upload Photos with Concurrency Control
      console.log(`🖼️ [SellerRequest API] [4/5] Uploading ${files.length} photo(s) via Payload Media (Concurrency: ${UPLOAD_CONCURRENCY})...`)
      await runWithConcurrency(files, UPLOAD_CONCURRENCY, async (file, index) => {
        console.log(`   ↳ [Upload Worker ${index + 1}/${files.length}] Processing "${file.name}" (${(file.size / 1024).toFixed(1)} KB)...`)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const mediaDoc = await payload.create({
          collection: 'media',
          data: {
            alt: `${property_title} - photo ${index + 1}`,
            folder: requestFolderId,
          },
          file: {
            data: buffer,
            mimetype: file.type,
            name: file.name,
            size: file.size,
          },
        })

        createdMediaIds.push(Number(mediaDoc.id))
        console.log(`   ↳ [Upload Worker ${index + 1}/${files.length}] ✅ Uploaded successfully -> Media ID: #${mediaDoc.id}`)
      })
    }

    // 10. Step 4: Finalize Seller Request (Attach Photos and transition to 'new')
    console.log(`🔗 [SellerRequest API] [5/5] Attaching ${createdMediaIds.length} media IDs to Request #${sellerRequest.id} and updating status to 'new'...`)
    const finalizedRequest = await payload.update({
      collection: 'seller-requests',
      id: sellerRequest.id,
      data: {
        photos: createdMediaIds.length > 0 ? createdMediaIds : undefined,
        status: 'new',
      },
    })

    // 11. Step 5: Dispatch Email Notifications
    try {
      let propertyTypeLabel = 'Property'
      try {
        const typeDoc = await payload.findByID({
          collection: 'property-types',
          id:
            typeof property_type === 'string' && !isNaN(Number(property_type))
              ? Number(property_type)
              : (property_type as number),
          depth: 0,
        })
        if (typeDoc) {
          propertyTypeLabel = typeDoc.name || 'Property'
        }
      } catch (e) {
        console.warn('Failed to resolve property type label for email:', e)
      }

      const adminUrl = `${SERVER_URL}/admin/collections/seller-requests/${sellerRequest.id}`

      const sellerMail = emailTemplates.sellerRequestReceipt({
        fullName: user.full_name,
        propertyTitle: String(property_title),
        propertyTypeLabel,
        askingPrice: Number(asking_price),
        currency: String(currency),
        propertyLocation: String(property_location),
        city: String(city),
        state: String(state),
        country: String(country),
        googleMapsUrl: typeof google_maps_url === 'string' ? google_maps_url : undefined,
        propertySize: property_size ? Number(property_size) : undefined,
        bedrooms: derivedBedrooms ? Number(derivedBedrooms) : undefined,
        bathrooms: derivedBathrooms ? Number(derivedBathrooms) : undefined,
        constructionStatus: String(constructionStatus),
      })

      const adminMail = emailTemplates.sellerRequestAdminNotification({
        sellerName: user.full_name,
        sellerEmail: user.email,
        sellerPhone: user.phone,
        propertyTitle: String(property_title),
        propertyTypeLabel,
        askingPrice: Number(asking_price),
        currency: String(currency),
        propertyLocation: String(property_location),
        city: String(city),
        state: String(state),
        country: String(country),
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        googleMapsUrl: typeof google_maps_url === 'string' ? google_maps_url : undefined,
        propertySize: property_size ? Number(property_size) : undefined,
        bedrooms: derivedBedrooms ? Number(derivedBedrooms) : undefined,
        bathrooms: derivedBathrooms ? Number(derivedBathrooms) : undefined,
        constructionStatus: String(constructionStatus),
        adminUrl,
      })

      let adminEmail = EMAIL_FROM
      try {
        const settings = await getCachedCompanySettings()
        if (settings?.notificationEmail) {
          adminEmail = settings.notificationEmail
        }
      } catch (err) {
        console.error('Failed to fetch notification email from settings:', err)
      }

      Promise.all([
        sendEmail({
          to: user.email,
          subject: sellerMail.subject,
          html: sellerMail.html,
          text: sellerMail.text,
        }),
        sendEmail({
          to: adminEmail,
          subject: adminMail.subject,
          html: adminMail.html,
          text: adminMail.text,
        }),
      ]).catch((err) => {
        console.error('Failed to send seller request notifications:', err)
      })
    } catch (emailErr) {
      console.error('Email notification dispatch error:', emailErr)
    }

    return NextResponse.json({
      success: true,
      message:
        'Your listing request has been submitted successfully. Our team will review it and get back to you shortly.',
      requestId: finalizedRequest.id,
      photosCount: createdMediaIds.length,
    })
  } catch (error) {
    // ── Compensation Cleanup on Failure ─────────────────────────────────────
    console.error('💥 [SellerRequest API] Submission error, initiating compensation cleanup:', error)

    if (payloadInstance) {
      // 1. Delete all partially uploaded Media documents & physical files
      if (createdMediaIds.length > 0) {
        console.log(`   ↳ [Compensation] Cleaning up ${createdMediaIds.length} partially uploaded media document(s)...`)
        for (const mediaId of createdMediaIds) {
          try {
            await payloadInstance.delete({
              collection: 'media',
              id: mediaId,
              overrideAccess: true,
            })
            console.log(`   ↳ [Compensation] ✅ Deleted Media #${mediaId}`)
          } catch (cleanupErr) {
            console.error(`   ↳ [Compensation] ❌ Failed to delete media #${mediaId}:`, cleanupErr)
          }
        }
      }

      // 2. Delete the created virtual folder if created
      if (createdFolderId) {
        console.log(`   ↳ [Compensation] Cleaning up virtual folder #${createdFolderId}...`)
        try {
          await payloadInstance.delete({
            collection: 'media-folders',
            id: createdFolderId,
            overrideAccess: true,
          })
          console.log(`   ↳ [Compensation] ✅ Deleted Folder #${createdFolderId}`)
        } catch (cleanupErr) {
          console.error(`   ↳ [Compensation] ❌ Failed to delete folder #${createdFolderId}:`, cleanupErr)
        }
      }

      // 3. Delete the draft Seller Request
      if (createdSellerRequestId) {
        console.log(`   ↳ [Compensation] Cleaning up draft Seller Request #${createdSellerRequestId}...`)
        try {
          await payloadInstance.delete({
            collection: 'seller-requests',
            id: createdSellerRequestId,
            overrideAccess: true,
          })
        } catch (cleanupErr) {
          console.error(`[Compensation] Failed to delete draft seller request #${createdSellerRequestId}:`, cleanupErr)
        }
      }
    }

    const userMessage = error instanceof Error ? error.message : 'Failed to submit listing request'
    return NextResponse.json({ error: userMessage }, { status: 500 })
  }
}
