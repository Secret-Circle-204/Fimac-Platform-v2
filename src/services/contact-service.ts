import { PropertyInquirySchema } from "@/forms/property-inquiry/schema"
import { getPayloadClient } from "@/db/client"
import { ADMIN_NOTIFICATIONS_EMAIL } from "@/env"
import { sendEmail, emailTemplates } from "@/lib/email/nodemailer"
import { after } from "next/server"
import { getCachedCompanySettings } from "@/lib/cache/company-settings"

export class ContactService {
  async processLead(
    message: PropertyInquirySchema & { ipAddress?: string; userAgent?: string }
  ) {
    const { propertyId, name, email, phone, message: msgText, ipAddress, userAgent } = message
    console.log("Processing lead for property:", propertyId, "with message:", message)
    try {
      const payload = await getPayloadClient()
      
      // Check for duplicate inquiry in the last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const existingInquiries = await payload.find({
        collection: "contact-messages",
        where: {
          and: [
            { email: { equals: email } },
            { property: { equals: propertyId } },
            { createdAt: { greater_than: twentyFourHoursAgo.toISOString() } },
          ]
        },
        limit: 1,
      })

      if (existingInquiries.docs.length > 0) {
        throw new Error("You have already submitted an inquiry for this property in the last 24 hours.")
      }

      // Fetch property to get its title
      let propertyTitle = propertyId
      try {
        const property = await payload.findByID({
          collection: "properties",
          id: propertyId,
        })
        if (property && property.title) {
          propertyTitle = property.title
        }
      } catch (err) {
        console.error("Error fetching property title:", err)
      }

      const contactMessage = await payload.create({
        collection: "contact-messages",
        data: {
          fullName: name,
          email: email,
          phone: phone,
          message: msgText,
          subject: `Inquiry about property: ${propertyTitle}`,
          inquiryType: "buyer",
          property: propertyId,
          status: "new",
          priority: "normal",
          ipAddress: ipAddress,
          userAgent: userAgent,
          preferredContact: message.preferredContact,
          buyingTimeline: message.buyingTimeline,
        },
      })

      // Defer email sending so the response is returned instantly
      after(async () => {
        try {
          // Fetch dynamic admin notification email from Company Settings (fallback to env)
          let adminEmail = ADMIN_NOTIFICATIONS_EMAIL
          try {
            const settings = await getCachedCompanySettings()
            if (settings?.notificationEmail) {
              adminEmail = settings.notificationEmail
            }
          } catch (err) {
            console.error("Failed to fetch notification email from settings, falling back to env:", err)
          }

          await Promise.all([
            // Send receipt to client
            sendEmail({
              to: email,
              subject: `Inquiry Received: ${propertyTitle}`,
              html: emailTemplates.propertyInquiryReceipt({
                fullName: name,
                propertyTitle: propertyTitle,
              }).html,
              text: emailTemplates.propertyInquiryReceipt({
                fullName: name,
                propertyTitle: propertyTitle,
              }).text,
            }),
            // Send notification to admin
            sendEmail({
              to: adminEmail,
              subject: `New property inquiry from ${name}`,
              html: emailTemplates.contactAdminNotification({
                fullName: name,
                email: email,
                phone: phone,
                inquiryType: "buyer",
                subject: `Inquiry about property: ${propertyTitle}`,
                message: msgText,
                ipAddress: ipAddress || "127.0.0.1",
                userAgent: userAgent || "unknown",
                confirmed: true,
              }).html,
              text: emailTemplates.contactAdminNotification({
                fullName: name,
                email: email,
                phone: phone,
                inquiryType: "buyer",
                subject: `Inquiry about property: ${propertyTitle}`,
                message: msgText,
                ipAddress: ipAddress || "127.0.0.1",
                userAgent: userAgent || "unknown",
                confirmed: true,
              }).text,
            })
          ])
          console.log("Inquiry emails sent successfully!")
        } catch (emailError) {
          console.error("Error sending inquiry emails:", emailError)
        }
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
