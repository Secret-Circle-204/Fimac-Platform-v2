import { PropertyType } from "@/payload-types"
import { CollectionSlug } from "payload"
import { BaseRepository } from "../base-repository"
import { BaseDecorator } from "../base-decorator"

export class PropertyTypeRepository extends BaseRepository<PropertyType, PropertyTypeDecorator> {
  override collection: CollectionSlug = "property-types"
  override DecoratorClass = PropertyTypeDecorator
}

export class PropertyTypeDecorator extends BaseDecorator<PropertyType> {
  get name(): string {
    return this.original.name
  }

  get slug(): string {
    return this.original.slug
  }
}
