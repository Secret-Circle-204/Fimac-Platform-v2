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

  get details() {
    return {
      bedrooms: this.original.details?.bedrooms ?? 0,
      bathrooms: this.original.details?.bathrooms ?? 0,
      squareMeters: this.original.details?.squareMeters?.toLocaleString() ?? "0",
      lotSize: this.original.details?.lotSize?.toLocaleString() ?? "0",
      yearBuilt: this.original.details?.yearBuilt ?? 0,
      Property: typeof this.original.propertyType === 'object' && this.original.propertyType !== null
        ? this.original.propertyType.name
        : undefined,
      heatingType: this.original.details?.heatingType,
    }
  }

  get listingStatus(): ListingStatus {
    return this.original.listingStatus
  }

  get constructionStatus(): string | null | undefined {
    return this.original.constructionStatus
  }

  get seller(): Seller | null {
    return this.original.seller as Seller | null
  }

  get views(): number {
    return this.original.views ?? 0
  }


}
