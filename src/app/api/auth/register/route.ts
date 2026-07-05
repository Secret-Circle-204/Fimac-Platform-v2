import { NextRequest, NextResponse } from "next/server"
import { getPayloadClient } from "@/db/client"
import { sendEmail, emailTemplates } from "@/lib/email/nodemailer"

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name, phone, company_name, user_type = "investors" } = body

    // Validation
    if (!email || !password || !full_name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (user_type !== "investors" && user_type !== "sellers") {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // Check if user already exists
    const existingUser = await payload.find({
      collection: user_type,
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    if (existingUser.docs.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Generate verification code
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    // Create verification code record
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
    try {
      await sendEmail({
        to: email,
        ...emailTemplates.verification(verificationCode, full_name),
      })
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Continue anyway - user can request resend
    }

    // Create user account (unverified)
    const newUser = await payload.create({
      collection: user_type,
      data: {
        email,
        password,
        full_name,
        phone,
        verification_status: "pending",
        ...(company_name ? { company_name } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email for verification code.",
      userId: newUser.id,
      email: newUser.email,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 },
    )
  }
}
