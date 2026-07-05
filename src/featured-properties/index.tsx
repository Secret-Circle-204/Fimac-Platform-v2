import { FeaturedPropertiesClient } from "./featured-properties-client"
import { getCachedFeaturedProperties } from "@/lib/cache/featured-properties"

export async function FeaturedProperties() {
  try {
    const properties = await getCachedFeaturedProperties()

    const carouselProperties = properties.map((p) => ({
      id: p.id,
      title: p.title,
      url: p.url,
      price: p.price,
      images: p.photos.map((photo) => ({
        url: photo.sizes?.card?.url || photo.url || "https://placehold.co/600x400.png",
        alt: photo.alt ?? p.title,
      })),
      address: {
        city: p.address?.city,
        state_abbr: (p.address as Record<string, string | undefined>)?.state_abbr || p.address?.state,
      },
      details: {
        bedrooms: p.details.bedrooms,
        bathrooms: p.details.bathrooms,
        sqM: p.details.squareMeters,
      },
      propertyType: p.details.Property,
      views: p.views,
    }))

    return <FeaturedPropertiesClient properties={carouselProperties} />
  } catch (error) {
    console.error("Database connection failed:", error)
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200 my-8">
        <p className="font-bold">عذراً، حدث خطأ في الاتصال بقاعدة البيانات</p>
        <p className="text-sm mt-2 opacity-80">جاري إعادة المحاولة تلقائياً...</p>
      </div>
    )
  }
}
