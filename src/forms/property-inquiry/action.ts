"use server" // don't forget to add this!

import { actionClient } from "@/lib/safe-action"
import { schema } from "./schema"
import { service } from "@/services"
import { headers } from "next/headers"

export const propertyInquiryAction = actionClient.schema(schema).action(async (args) => {
  const { parsedInput } = args
  
  // Resolve client IP and User Agent
  const reqHeaders = await headers()
  const cfConnectingIp = reqHeaders.get("cf-connecting-ip")
  const trueClientIp = reqHeaders.get("true-client-ip")
  const xRealIp = reqHeaders.get("x-real-ip")
  const xForwardedFor = reqHeaders.get("x-forwarded-for")
  
  let ipAddress = '127.0.0.1'
  if (cfConnectingIp) {
    ipAddress = cfConnectingIp.trim()
  } else if (trueClientIp) {
    ipAddress = trueClientIp.trim()
  } else if (xRealIp) {
    ipAddress = xRealIp.trim()
  } else if (xForwardedFor) {
    ipAddress = xForwardedFor.split(',')[0].trim()
  }
  
  const userAgent = reqHeaders.get("user-agent") || 'unknown'

  try {
    const res = await service.contact.processLead({
      ...parsedInput,
      ipAddress,
      userAgent,
    })
    return { success: "Message sent successfully", id: String(res.contact.id) }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to submit inquiry. Please try again."
    console.error("Inquiry Action Error:", error)
    return { error: errorMessage }
  }
})
