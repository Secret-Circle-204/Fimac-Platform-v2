import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/db/client'
import { ADMIN_NOTIFICATIONS_EMAIL, SERVER_URL } from '@/env'
import { emailTemplates, sendEmail } from '@/lib/email/nodemailer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, email, phone, inquiryType, subject, message } = body

    // Validate required fields
    if (!fullName || !email || !inquiryType || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get client IP and user agent
    const ipAddress =
      req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    const payload = await getPayloadClient()

    const confirmationToken = crypto.randomUUID()

    const contactMessage = await payload.create({
      collection: 'contact-messages',
      data: {
        fullName,
        email,
        phone,
        inquiryType,
        subject,
        message,
        status: 'new',
        priority: 'normal',
        ipAddress,
        userAgent,
        doubleOptInConfirmed: false,
        confirmationToken,
        confirmationExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      },
    })

    const confirmationUrl = `${SERVER_URL}/api/contact/confirm?token=${confirmationToken}`

    await Promise.all([
      sendEmail({
        to: email,
        subject: 'Please confirm your contact request',
        html: emailTemplates.contactConfirmation({
          fullName,
          subject,
          confirmationUrl,
        }).html,
        text: emailTemplates.contactConfirmation({
          fullName,
          subject,
          confirmationUrl,
        }).text,
      }),
      sendEmail({
        to: ADMIN_NOTIFICATIONS_EMAIL,
        subject: `Pending contact request from ${fullName}`,
        html: emailTemplates.contactAdminNotification({
          fullName,
          email,
          phone,
          inquiryType,
          subject,
          message,
          ipAddress,
          userAgent,
          confirmed: false,
        }).html,
        text: emailTemplates.contactAdminNotification({
          fullName,
          email,
          phone,
          inquiryType,
          subject,
          message,
          ipAddress,
          userAgent,
          confirmed: false,
        }).text,
      }),
    ])

    return NextResponse.json(
      {
        success: true,
        message: 'Please confirm your email to complete the request.',
        id: contactMessage.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return NextResponse.json(
      { error: 'Failed to submit message. Please try again.' },
      { status: 500 },
    )
  }
}
