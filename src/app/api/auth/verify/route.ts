import { NextRequest, NextResponse } from "next/server"
import { getPayloadClient } from "@/db/client"
import { sendEmail, emailTemplates } from "@/lib/email/nodemailer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // Find verification code
    const verificationRecords = await payload.find({
      collection: "verification-codes" as 'verification-codes',
      where: {
        and: [
          {
            email: {
              equals: email,
            },
          },
          {
            code: {
              equals: code,
            },
          },
          {
            verified: {
              equals: false,
            },
          },
        ],
      },
      sort: "-createdAt",
      limit: 1,
    })

    if (verificationRecords.docs.length === 0) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    const verificationRecord = verificationRecords.docs[0]

    // Check if code is expired
    const expiresAt = new Date(verificationRecord.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 400 })
    }

    // Mark verification code as used
    await payload.update({
      collection: "verification-codes" as 'verification-codes',
      id: verificationRecord.id,
      data: {
        verified: true,
        verified_at: new Date().toISOString(),
      },
    })

    const userType = ((verificationRecord.user_type as string) === "sellers" ? "sellers" : "buyers") as "sellers" | "buyers"

    // Update user verification status
    const users = await payload.find({
      collection: userType,
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    if (users.docs.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users.docs[0]

    await payload.update({
      collection: userType,
      id: user.id,
      data: {
        verification_status: "verified",
      },
    })

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        ...emailTemplates.welcome(user.full_name, userType === "sellers" ? "Seller" : "Buyer"),
      })
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        role: userType,
      },
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 },
    )
  }
}
