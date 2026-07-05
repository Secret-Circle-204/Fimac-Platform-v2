import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/db/client'
import { ADMIN_NOTIFICATIONS_EMAIL } from '@/env'
import { emailTemplates, sendEmail } from '@/lib/email/nodemailer'
import type { ContactMessage } from '@/payload-types'

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'contact-messages',
    where: {
      confirmationToken: {
        equals: token,
      },
    },
    limit: 1,
  })

  if (result.docs.length === 0) {
    return NextResponse.json({ error: 'Invalid or already used token' }, { status: 404 })
  }

  const message = result.docs[0] as ContactMessage

  if (message.doubleOptInConfirmed) {
    return NextResponse.json({ success: true, message: 'Request already confirmed' })
  }

  const expiresAt = message.confirmationExpiresAt ? new Date(message.confirmationExpiresAt) : null
  if (expiresAt && expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: 'Confirmation link expired' }, { status: 410 })
  }

  const updatedMessage = await payload.update({
    collection: 'contact-messages',
    id: message.id,
    data: {
      status: 'new',
      doubleOptInConfirmed: true,
      confirmedAt: new Date().toISOString(),
      confirmationToken: null,
      confirmationExpiresAt: null,
    },
  })

  const normalized = {
    fullName: updatedMessage.fullName || 'Valued Contact',
    email: updatedMessage.email || message.email,
    phone: updatedMessage.phone ?? undefined,
    inquiryType: updatedMessage.inquiryType || 'general',
    subject: updatedMessage.subject || 'General Inquiry',
    message: updatedMessage.message || '',
    ipAddress: updatedMessage.ipAddress || 'unknown',
    userAgent: updatedMessage.userAgent || 'unknown',
  }

  await Promise.all([
    sendEmail({
      to: ADMIN_NOTIFICATIONS_EMAIL,
      subject: `Confirmed contact request from ${normalized.fullName}`,
      html: emailTemplates.contactAdminNotification({
        ...normalized,
        email: normalized.email || ADMIN_NOTIFICATIONS_EMAIL,
        confirmed: true,
      }).html,
      text: emailTemplates.contactAdminNotification({
        ...normalized,
        email: normalized.email || ADMIN_NOTIFICATIONS_EMAIL,
        confirmed: true,
      }).text,
    }),
    sendEmail({
      to: normalized.email,
      subject: "We've received your request",
      html: emailTemplates.contactReceipt({
        fullName: normalized.fullName,
        subject: normalized.subject,
      }).html,
      text: emailTemplates.contactReceipt({
        fullName: normalized.fullName,
        subject: normalized.subject,
      }).text,
    }),
  ])

  return NextResponse.json({ success: true, message: 'Contact request confirmed' })
}
