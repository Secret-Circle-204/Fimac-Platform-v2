import { NextRequest, NextResponse } from "next/server"
import { getPayloadClient } from "@/db/client"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, firstName, lastName, source = "unknown", interests = [] } = body

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Get client IP and user agent
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"

    const payload = await getPayloadClient()

    // Check if email already exists
    const existing = await payload.find({
      collection: "newsletters",
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      const existingSubscriber = existing.docs[0]
      
      // If unsubscribed, resubscribe
      if (existingSubscriber.status === "unsubscribed") {
        await payload.update({
          collection: "newsletters",
          id: existingSubscriber.id,
          data: {
            status: "subscribed",
            subscribeDate: new Date().toISOString(),
            unsubscribeDate: null,
          },
        })
        
        return NextResponse.json({
          success: true,
          message: "Welcome back! You've been resubscribed to our newsletter.",
        })
      }
      
      // Already subscribed
      return NextResponse.json({
        success: true,
        message: "You're already subscribed to our newsletter!",
      })
    }

    // Create new subscriber
    await payload.create({
      collection: "newsletters",
      data: {
        email,
        firstName,
        lastName,
        status: "subscribed",
        source,
        interests,
        ipAddress,
        userAgent,
        subscribeDate: new Date().toISOString(),
      },
    })

    // TODO: Send welcome email
    // TODO: Send double opt-in confirmation if required

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for subscribing! Check your email for confirmation.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    )
  }
}
