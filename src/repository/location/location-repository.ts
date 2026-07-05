import { Location } from "@/payload-types"
import { CollectionSlug } from "payload"
import { BaseRepository } from "../base-repository"
import { BaseDecorator } from "../base-decorator"

export class LocationRepository extends BaseRepository<Location, LocationDecorator> {
  override collection: CollectionSlug = "locations"
  override DecoratorClass = LocationDecorator
}

export class LocationDecorator extends BaseDecorator<Location> {}
