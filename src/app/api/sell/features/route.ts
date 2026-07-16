import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/db/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const propertyTypeId = searchParams.get('propertyTypeId')

    if (!category || !propertyTypeId) {
      return NextResponse.json({ error: 'category and propertyTypeId query parameters are required' }, { status: 400 })
    }

    console.log(`🔌 [API] GET /api/sell/features called for category: "${category}", propertyTypeId: "${propertyTypeId}"`)

    const payload = await getPayloadClient()
    
    // Fetch all features sorted by name
    const featuresResult = await payload.find({
      collection: 'features',
      limit: 100,
      sort: 'name',
      depth: 0,
    })

    const COMMON_FEATURE_SLUGS = [
      'air-conditioning',
      'swimming-pool',
      'infinity-pool',
      'private-garden',
      'landscaped-garden',
      'balcony',
      'terrace',
      '247-security',
      'gated-community',
      'security-cameras',
      'smart-access',
      'underground-parking',
      'private-garage',
      'high-speed-internet',
      'fiber-optic-connectivity',
      'backup-generator',
      'solar-panels',
      'fitness-center',
      'spa',
      'city-view',
      'sea-view',
    ]

    const filteredDocs = featuresResult.docs.filter((f) => {
      // 1. Keep only common features
      if (!COMMON_FEATURE_SLUGS.includes(f.slug)) {
        return false
      }
      // 2. Check category restriction
      if (f.visibleInCategories && f.visibleInCategories.length > 0) {
        if (!f.visibleInCategories.includes(category as 'residential' | 'commercial' | 'hospitality' | 'land')) {
          return false
        }
      }
      // 3. Check property type restriction
      if (f.visibleInPropertyTypes && f.visibleInPropertyTypes.length > 0) {
        const typeIdNum = Number(propertyTypeId)
        const typeIds = f.visibleInPropertyTypes.map((t) =>
          typeof t === 'object' && t !== null ? t.id : t
        )
        if (!typeIds.includes(typeIdNum)) {
          return false
        }
      }
      return true
    })

    const options = filteredDocs.map((f) => ({
      label: f.name,
      value: f.id,
      slug: f.slug,
      visibleInCategories: f.visibleInCategories || [],
      visibleInPropertyTypes: (f.visibleInPropertyTypes || []).map((t) =>
        typeof t === 'object' && t !== null ? t.id : t
      ),
      featureGroup: f.featureGroup || undefined,
    }))

    console.log(`⚡ [API] Resolved ${options.length} features (Filtered in memory based on constraints)`)

    return NextResponse.json(options)
  } catch (err) {
    console.error('Error fetching features options:', err)
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 })
  }
}
