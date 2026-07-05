
import { LocationRepository } from "./location/location-repository"
import { PropertyRepository } from "./property/property-repository"
import { UserRepository } from "./user/user-repository"
import { PropertyTypeRepository } from "./property-type/property-type-repository"

export const local = {
  property: new PropertyRepository(),
  user: new UserRepository(),
  location: new LocationRepository(),
  propertyType: new PropertyTypeRepository(),
}
