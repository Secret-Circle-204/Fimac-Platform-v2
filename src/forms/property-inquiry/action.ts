"use server" // don't forget to add this!

import { actionClient } from "@/lib/safe-action"
import { schema } from "./schema"
import { service } from "@/services"

export const propertyInquiryAction = actionClient.schema(schema).action(async (args) => {
  const { parsedInput } = args
  // Simulate updating form submissions collection
  // In a real application, you would save this data to your database.
  await service.contact.processLead(parsedInput)

  return { success: "Message sent successfully" }
})
