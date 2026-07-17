import { z } from "zod"

// This schema is used to validate input from client.
export const schema = z.object({
  propertyId: z.string(),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  message: z
    .string()
    .min(1, { message: "Please include a message" })
    .max(256, { message: "Message must be at most 256 characters long" }),
  preferredContact: z.enum(["email", "phone", "whatsapp"], {
    message: "Please select a preferred contact method",
  }),
  buyingTimeline: z.enum(["immediate", "later", "browsing"], {
    message: "Please select a buying timeline",
  }),
})

export type PropertyInquirySchema = z.infer<typeof schema>
