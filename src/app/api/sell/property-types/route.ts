import { NextRequest, NextResponse } from 'next/server'
import { getCachedPropertyTypes } from '@/lib/cache/property-types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json({ error: 'Category query parameter is required' }, { status: 400 })
    }

    console.log(`🔌 [API] GET /api/sell/property-types called for category: "${category}"`)

    // 1. Fetch from Next.js server cache (tied to tag: "property-types")
    const allTypes = await getCachedPropertyTypes()

    // 2. Filter by category slug in memory
    const filteredTypes = allTypes.filter((t) => {
      if (t.category && typeof t.category === 'object') {
        return t.category.slug === category
      }
      return false
    })

    const options = filteredTypes.map((t) => ({
      label: t.name,
      value: t.id,
      slug: t.slug,
      specificationProfile: t.specificationProfile,
      categorySlug: category,
    }))

    console.log(`⚡ [API] Resolved ${options.length} property types from Next.js server cache (tag: "property-types")`)

    return NextResponse.json(options)
  } catch (err) {
    console.error('Error fetching property types options:', err)
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 })
  }
}
