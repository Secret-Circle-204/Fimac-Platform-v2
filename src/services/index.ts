import { ContactService } from "./contact-service"
import { PropertyPublishingService } from "./property-publishing.service"
import { SellerCounterService } from "./seller-counter.service"

export const service = {
  contact: new ContactService(),
  propertyPublishing: new PropertyPublishingService(),
  sellerCounter: new SellerCounterService(),
}
