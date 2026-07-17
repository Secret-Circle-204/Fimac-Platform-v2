import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/db/client'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { sendEmail, emailTemplates } from '@/lib/email/nodemailer'
import { EMAIL_FROM, SERVER_URL } from '@/env'
import slugify from 'slugify'
import { getCachedCompanySettings } from '@/lib/cache/company-settings'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'seller') {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged in as a seller to submit a request.' },
        { status: 401 },
      )
    }

    const body = await request.json()
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
    } = body

    // Validation
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
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // Resolve construction status slug to its numeric database ID
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
      return NextResponse.json({ error: 'Invalid construction status value' }, { status: 400 })
    }

    const derivedBedrooms = bedrooms ?? residential?.bedrooms
    const derivedBathrooms = bathrooms ?? residential?.bathrooms

    // Resolve features and dynamically create new custom features
    const finalFeatureIds: number[] = []

    // 1. Process selected pre-existing features
    if (features && Array.isArray(features)) {
      features.forEach((id) => {
        const numericId = Number(id)
        if (!isNaN(numericId)) {
          finalFeatureIds.push(numericId)
        }
      })
    }

    // 2. Process typed custom features (create them if they don't exist yet)
    if (customFeatures && Array.isArray(customFeatures)) {
      for (const name of customFeatures) {
        const trimmedName = name.trim()
        if (!trimmedName) continue

        const slug = slugify(trimmedName, { lower: true, strict: true })

        // Check if this feature already exists by slug or name
        const existingFeature = await payload.find({
          collection: 'features',
          where: {
            or: [{ slug: { equals: slug } }, { name: { equals: trimmedName } }],
          },
          limit: 1,
          depth: 0,
        })

        if (existingFeature.docs.length > 0) {
          finalFeatureIds.push(Number(existingFeature.docs[0].id))
        } else {
          // Create new feature in DB
          const newFeature = await payload.create({
            collection: 'features',
            data: {
              name: trimmedName,
              slug,
            },
          })
          finalFeatureIds.push(Number(newFeature.id))
        }
      }
    }

    // Create the seller request and link directly to active seller profile
    const sellerRequest = await payload.create({
      collection: 'seller-requests',
      data: {
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        property_type:
          typeof property_type === 'string' && !isNaN(Number(property_type))
            ? Number(property_type)
            : property_type,
        property_title,
        property_description,
        property_location,
        city,
        state,
        country,
        zip,
        full_address,
        asking_price: Number(asking_price),
        currency,
        property_size: property_size ? Number(property_size) : undefined,
        constructionStatus: constructionStatusId,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        google_maps_url,
        features: finalFeatureIds.length > 0 ? finalFeatureIds : undefined,
        customSpecifications: customSpecifications || undefined,
        seller: Number(user.id), // Dynamic direct database linkage!
        status: 'new',
        category: category || undefined,
        residential: residential || undefined,
        commercial: commercial || undefined,
        hospitality: hospitality || undefined,
        land: land || undefined,
      },
    })

    // Dispatch email notifications safely (fully isolated from API response lifecycle)
    try {
      // Resolve property type label to display it cleanly in email templates
      let propertyTypeLabel = 'Property'
      try {
        const typeDoc = await payload.findByID({
          collection: 'property-types',
          id:
            typeof property_type === 'string' && !isNaN(Number(property_type))
              ? Number(property_type)
              : property_type,
          depth: 0,
        })
        if (typeDoc) {
          propertyTypeLabel = typeDoc.name || 'Property'
        }
      } catch (e) {
        console.warn('Failed to find property type label for email template:', e)
      }

      // Prepare redirect URL for Admin CRM
      const adminUrl = `${SERVER_URL}/admin/collections/seller-requests/${sellerRequest.id}`

      // 1. Compile Seller Receipt Email
      const sellerMail = emailTemplates.sellerRequestReceipt({
        fullName: user.full_name,
        propertyTitle: property_title,
        propertyTypeLabel,
        askingPrice: Number(asking_price),
        currency,
        propertyLocation: property_location,
        city,
        state,
        country,
        googleMapsUrl: google_maps_url || undefined,
        propertySize: property_size ? Number(property_size) : undefined,
        bedrooms: derivedBedrooms ? Number(derivedBedrooms) : undefined,
        bathrooms: derivedBathrooms ? Number(derivedBathrooms) : undefined,
        constructionStatus,
      })

      // 2. Compile Admin Notification Email
      const adminMail = emailTemplates.sellerRequestAdminNotification({
        sellerName: user.full_name,
        sellerEmail: user.email,
        sellerPhone: user.phone,
        propertyTitle: property_title,
        propertyTypeLabel,
        askingPrice: Number(asking_price),
        currency,
        propertyLocation: property_location,
        city,
        state,
        country,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        googleMapsUrl: google_maps_url || undefined,
        propertySize: property_size ? Number(property_size) : undefined,
        bedrooms: derivedBedrooms ? Number(derivedBedrooms) : undefined,
        bathrooms: derivedBathrooms ? Number(derivedBathrooms) : undefined,
        constructionStatus,
        adminUrl,
      })

      // Dispatch emails concurrently (non-blocking)
      let adminEmail = EMAIL_FROM
      try {
        const settings = await getCachedCompanySettings()
        if (settings?.notificationEmail) {
          adminEmail = settings.notificationEmail
        }
      } catch (err) {
        console.error("Failed to fetch notification email from settings, falling back to env:", err)
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
      console.error(
        'Email notification dispatch error (database request save succeeded):',
        emailErr,
      )
    }

    return NextResponse.json({
      success: true,
      message:
        'Your listing request has been submitted successfully. Our team will review it and get back to you shortly.',
      requestId: sellerRequest.id,
    })
  } catch (error) {
    console.error('Seller request error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit request' },
      { status: 500 },
    )
  }
}
