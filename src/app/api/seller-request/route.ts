import { NextRequest, NextResponse } from "next/server"
import { getPayloadClient } from "@/db/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      full_name,
      email,
      phone,
      property_type,
      property_title,
      property_description,
      property_location,
      asking_price,
      property_size,
    } = body

    // Validation
    if (
      !full_name ||
      !email ||
      !phone ||
      !property_type ||
      !property_title ||
      !property_description ||
      !property_location
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // Create the seller request
    const sellerRequest = await payload.create({
      collection: "seller-requests",
      data: {
        full_name,
        email,
        phone,
        property_type: typeof property_type === 'string' && !isNaN(Number(property_type)) ? Number(property_type) : property_type,
        property_title,
        property_description,
        property_location,
        asking_price: asking_price ? Number(asking_price) : undefined,
        property_size: property_size ? Number(property_size) : undefined,
        status: "new",
      },
    })

    return NextResponse.json({
      success: true,
      message:
        "Your listing request has been submitted successfully. Our team will review it and get back to you shortly.",
      requestId: sellerRequest.id,
    })
  } catch (error) {
    console.error("Seller request error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit request" },
      { status: 500 },
    )
  }
}
