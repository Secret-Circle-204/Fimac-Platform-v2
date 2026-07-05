import { CollectionSlug } from "payload"
import { Property } from "@/payload-types"
import { BaseRepository } from "../base-repository"
import { PropertyDecorator } from "./property-decorator"

export class PropertyRepository extends BaseRepository<Property, PropertyDecorator> {
  override collection: CollectionSlug = "properties"
  override DecoratorClass = PropertyDecorator
}
