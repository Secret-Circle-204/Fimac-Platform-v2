import { NextRequest, NextResponse, after } from "next/server"
import { getPayloadClient } from "@/db/client"
import { sendEmail, emailTemplates } from "@/lib/email/nodemailer"

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, user_type = "buyers" } = body

    if (!email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (user_type !== "buyers" && user_type !== "sellers") {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // Check if user exists in the specified collection
    const users = await payload.find({
      collection: user_type,
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

    // Generate new verification code
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    // Create new verification code record
    await payload.create({
      collection: "verification-codes",
      data: {
        email,
        code: verificationCode,
        user_type,
        expires_at: expiresAt.toISOString(),
        verified: false,
      },
    })

    // Send verification email
    after(async () => {
      try {
        await sendEmail({
          to: email,
          ...emailTemplates.verification(verificationCode, user.full_name),
        })
      } catch (err) {
        console.error("Failed to send verification email:", err)
      }
    })

    return NextResponse.json({
      success: true,
      message: "Verification code resent successfully",
    })
  } catch (error) {
    console.error("Resend code error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to resend verification code" },
      { status: 500 },
    )
  }
}
