import { PropertyInquirySchema } from "@/forms/property-inquiry/schema"
import { getPayloadClient } from "@/db/client"

export class ContactService {
  async processLead({ propertyId, ...message }: PropertyInquirySchema) {
    console.log("Processing lead for property:", propertyId, "with message:", message)
    try {
      const payload = await getPayloadClient()
      
      const contactMessage = await payload.create({
        collection: "contact-messages",
        data: {
          fullName: message.name,
          email: message.email,
          phone: message.phone,
          message: message.message,
          subject: `Inquiry about property ${propertyId}`,
          inquiryType: "property-owner",
          property: propertyId,
          status: "new",
          priority: "normal",
        },
      })

      return {
        contact: contactMessage,
        inquiry: contactMessage,
      }
    } catch (error) {
      console.error("Error processing lead:", error)
      throw error
    }
  }
}
