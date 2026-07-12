import { Media, Property, Seller, Feature } from "@/payload-types"
import { formatPrice } from "@/lib/format-price"
import { ListingStatus } from "@/collections/Properties/listing-status-map"
import { generateUrl } from "./generate-url"
import { BaseDecorator } from "../base-decorator"

type PropertyPhoto = {
  id: Media["id"]
  url: Media["url"]
  alt: Media["alt"]
  sizes: Media["sizes"]
}

export class PropertyDecorator extends BaseDecorator<Property> {
  get id(): Property["id"] {
    return this.original.id
  }

  get title(): Property["title"] {
    return this.original.title
  }

  get description(): Property["description"] {
    return this.original.description
  }

  get url(): string {
    return generateUrl(this.original)
  }

  get propertyTypeSlug(): string | undefined {
    if (this.original.propertyTypeSlug) {
      return this.original.propertyTypeSlug
    }
    if (
      this.original.propertyType &&
      typeof this.original.propertyType === 'object' &&
      'slug' in this.original.propertyType
    ) {
      return this.original.propertyType.slug
    }
    return undefined
  }

  get propertyType(): Property["propertyType"] {
    return this.original.propertyType
  }

  get features(): Feature[] {
    if (!this.original.features) {
      return []
    }
    const features = this.original.features as Feature[]
    return features
  }

  get price(): string {
    return formatPrice(this.original.price, this.original.currency)
  }

  get location() {
    return this.original.location
  }

  get location_legacy() {
    return this.original.location_legacy
  }

  get address() {
    return this.original.location?.address || { street: '', city: '', state: '', zip: '', fullAddress: '' }
  }

  get photos(): PropertyPhoto[] {
    const photoData = (this.original.photos ?? []) as Media[]
    const photos = photoData
      .filter((p) => !!p.url)
      .map((photo) => {
        return {
          id: photo.id,
          url: photo.url,
          alt: photo.alt,
          sizes: photo.sizes,
        }
      })

    return photos
  }

  get category(): string | undefined {
    return this.original.category
  }

  get area(): number | null | undefined {
    return this.original.area
  }

  get residential() {
    return this.original.residential
  }

  get commercial() {
    return this.original.commercial
  }

  get hospitality() {
    return this.original.hospitality
  }

  get land() {
    return this.original.land
  }

  get operationalData() {
    return this.original.operationalData
  }

  get customSpecifications() {
    return this.original.customSpecifications ?? []
  }

  get details() {
    return {
      bedrooms: this.original.residential?.bedrooms ?? 0,
      bathrooms: this.original.residential?.bathrooms ?? 0,
      squareMeters: this.original.area?.toLocaleString() ?? "0",
      lotSize: this.original.category === 'land' ? (this.original.area?.toLocaleString() ?? "0") : "0",
      yearBuilt: this.original.residential?.yearBuilt ?? 0,
      Property: typeof this.original.propertyType === 'object' && this.original.propertyType !== null
        ? this.original.propertyType.name
        : undefined,
      heatingType: this.original.residential?.heatingType,
    }
  }

  get listingStatus(): ListingStatus {
    const rawStatus = typeof this.original.listingStatus === 'object' && this.original.listingStatus
      ? (this.original.listingStatus.slug as string)
      : typeof this.original.listingStatus === 'string'
        ? (this.original.listingStatus as string)
        : 'draft'

    const normalized = rawStatus === 'for-sale' ? 'forsale' : rawStatus
    return normalized as ListingStatus
  }

  get constructionStatus(): Property['constructionStatus'] {
    return this.original.constructionStatus
  }

  get seller(): Seller | null {
    return this.original.seller as Seller | null
  }

  get views(): number {
    return this.original.views ?? 0
  }

  get hasProject(): boolean {
    return !!this.original.hasProject
  }

  get projectImage(): Media | null {
    if (!this.original.projectImage) return null
    return this.original.projectImage as Media
  }

  get projectDescription(): Property['projectDescription'] {
    return this.original.projectDescription
  }
}
