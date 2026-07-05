import { NextRequest, NextResponse } from "next/server"
import { getPayloadClient } from "@/db/client"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const alt = formData.get("alt") as string || "Property photo"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // Convert File to Buffer for Payload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create media document
    const media = await payload.create({
      collection: "media",
      data: {
        alt,
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    })

    return NextResponse.json({
      success: true,
      doc: media,
    })
  } catch (error) {
    console.error("Photo upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload photo" },
      { status: 500 }
    )
  }
}
