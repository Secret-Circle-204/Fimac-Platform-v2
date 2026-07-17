import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { EMAIL_FROM, SMTP_SETTINGS } from '@/env'

const APP_NAME = 'FIMAC Platform'
const FOOTER_LOCATION = 'Tennessee, United States'

let transporter: Transporter | null = null

export function getEmailTransporter() {
  if (transporter) {
    return transporter
  }

  transporter = nodemailer.createTransport(SMTP_SETTINGS)

  return transporter
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html?: string
  text?: string
}) {
  const transporter = getEmailTransporter()

  try {
    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to,
      subject,
      text,
      html,
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

type ContactAdminTemplateArgs = {
  fullName: string
  email: string
  phone?: string
  inquiryType: string
  subject: string
  message: string
  ipAddress: string
  userAgent: string
  confirmed: boolean
}

type ContactConfirmationArgs = {
  fullName: string
  subject: string
  confirmationUrl: string
}

type ContactReceiptArgs = {
  fullName: string
  subject: string
}

type PropertyInquiryReceiptArgs = {
  fullName: string
  propertyTitle: string
}

type SellerPropertyPublishedArgs = {
  fullName: string
  propertyTitle: string
  propertyUrl: string
}


const emailShell = ({
  title,
  body,
  cta,
}: {
  title: string
  body: string
  cta?: { label: string; url: string }
}) => `
  <!DOCTYPE html>
  <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2933; background-color: #f5f7fb; padding: 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);">
        <tr>
          <td style="background: linear-gradient(120deg, #111928, #1f2a44); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: #f9fafb; letter-spacing: 0.5px;">${APP_NAME}</h1>
            <p style="margin: 8px 0 0; color: #c7d2fe; font-size: 14px;">Financial Investment Management Advisory & Consultants</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 32px;">
            <h2 style="margin-top: 0; color: #111928; font-size: 24px;">${title}</h2>
            ${body}
            ${
              cta
                ? `<div style="margin-top: 32px;">
                  <a href="${cta.url}" style="display: inline-block; padding: 14px 28px; background: #312e81; color: #ffffff; border-radius: 999px; text-decoration: none; font-weight: 600;">${cta.label}</a>
                </div>`
                : ''
            }
          </td>
        </tr>
        <tr>
          <td style="background: #f9fafb; padding: 24px 32px; text-align: center; color: #6b7280; font-size: 13px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            <p style="margin: 4px 0 0;">${FOOTER_LOCATION}</p>
          </td>
        </tr>
      </table>
    </body>
  </html>
`

const plainText = (lines: string[]) => lines.join('\n')

// Email Templates
export const emailTemplates = {
  verification: (code: string, userName: string) => ({
    subject: 'Verify Your FIMAC Account',
    html: `
      <!DOCTYPE html>
      <html dir="ltr" lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">FIMAC</h1>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px;">Financial Investment Management Advisory & Consultants</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Welcome, ${userName}!</h2>
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      Thank you for joining FIMAC Platform. To complete your registration and verify your email address, please use the verification code below:
                    </p>
                    
                    <!-- Verification Code -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
                            <p style="margin: 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
                            <h1 style="margin: 10px 0 0 0; color: #667eea; font-size: 36px; letter-spacing: 8px; font-weight: bold;">${code}</h1>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      This code will expire in <strong>15 minutes</strong>. If you didn't request this verification, please ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} FIMAC Platform. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      Tennessee, United States
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Welcome ${userName}!\n\nYour verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.\n\n© ${new Date().getFullYear()} FIMAC Platform`,
  }),
  contactReceipt: ({ fullName, subject }: ContactReceiptArgs) => ({
    subject: "We've received your request",
    html: emailShell({
      title: 'Thank you for confirming',
      body: `
        <p>Hi ${fullName},</p>
        <p>We've received your message about <strong>${subject}</strong>. Our team will review it and follow up shortly.</p>
        <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">If you didn't submit this request, please contact support immediately.</p>
      `,
    }),
    text: plainText([
      `Hi ${fullName},`,
      `We've received your message about ${subject}.`,
      "We'll be in touch soon.",
    ]),
  }),

  propertyInquiryReceipt: ({ fullName, propertyTitle }: PropertyInquiryReceiptArgs) => ({
    subject: `Inquiry Received: ${propertyTitle}`,
    html: emailShell({
      title: 'Inquiry Received',
      body: `
        <p>Dear ${fullName},</p>
        <p>Thank you for your interest in the property <strong>"${propertyTitle}"</strong>.</p>
        <p>We have successfully received your inquiry. A dedicated member of our <strong>Fimac Group</strong> advisory team is currently reviewing your details and will contact you shortly using your preferred contact method to discuss your timeline and provide further assistance.</p>
        <p>If you have any urgent questions in the meantime, please reply directly to this email or reach out to our support team.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>Fimac Group Team</strong></p>
      `,
    }),
    text: plainText([
      `Dear ${fullName},`,
      `Thank you for your interest in the property "${propertyTitle}".`,
      `We have successfully received your inquiry. A dedicated member of our Fimac Group advisory team is currently reviewing your details and will contact you shortly using your preferred contact method to discuss your timeline and provide further assistance.`,
      `If you have any urgent questions in the meantime, please reply directly to this email.`,
      `Best regards,`,
      `Fimac Group Team`,
    ]),
  }),

  sellerPropertyPublished: ({ fullName, propertyTitle, propertyUrl }: SellerPropertyPublishedArgs) => ({
    subject: `Your property is now live: ${propertyTitle}`,
    html: emailShell({
      title: 'Property Published!',
      body: `
        <p>Dear ${fullName},</p>
        <p>We are pleased to inform you that your property request <strong>"${propertyTitle}"</strong> has been approved and published by our administrative team.</p>
        <p>Your listing is now live on the <strong>Fimac Platform</strong> and is open for potential buyers to view and send inquiries.</p>
        <p>You can view your live property listing by clicking the link below:</p>
        <p style="margin: 24px 0; text-align: center;">
          <a href="${propertyUrl}" target="_blank" style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">View Live Listing</a>
        </p>
        <p>If you need to make any updates to your property details or manage inquiries, please log in to your seller dashboard.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>Fimac Group Team</strong></p>
      `,
    }),
    text: plainText([
      `Dear ${fullName},`,
      `We are pleased to inform you that your property request "${propertyTitle}" has been approved and published by our administrative team.`,
      `Your listing is now live on the Fimac Platform.`,
      `You can view your live listing here: ${propertyUrl}`,
      `Best regards,`,
      `Fimac Group Team`,
    ]),
  }),

  welcome: (userName: string, role: string) => ({
    subject: 'Welcome to FIMAC Platform',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea;">Welcome to FIMAC, ${userName}!</h1>
          <p>Your account has been successfully verified.</p>
          <p>As a <strong>${role}</strong>, you now have access to:</p>
          <ul>
            ${
              role === 'Buyer'
                ? `
              <li>Exclusive property listings</li>
              <li>Detailed financial analytics</li>
              <li>Direct communication with sellers</li>
            `
                : `
              <li>Property listing management</li>
              <li>Buyer interest tracking</li>
              <li>Professional valuation services</li>
            `
            }
          </ul>
          <p>Get started by exploring our platform!</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px;">
            Go to Dashboard
          </a>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to FIMAC, ${userName}!\n\nYour account has been successfully verified.\n\nVisit: ${process.env.NEXT_PUBLIC_SITE_URL}`,
  }),

  // ndaSigned: (propertyTitle: string) => ({
  //   subject: `NDA Signed - ${propertyTitle}`,
  //   html: `
  //     <!DOCTYPE html>
  //     <html>
  //     <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  //       <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
  //         <h2>NDA Successfully Signed</h2>
  //         <p>You have successfully signed the Non-Disclosure Agreement for:</p>
  //         <p style="font-size: 18px; font-weight: bold; color: #667eea;">${propertyTitle}</p>
  //         <p>You now have access to the confidential financial information for this property.</p>
  //         <p style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
  //           <strong>⚠️ Reminder:</strong> All information is confidential and protected under the NDA you signed. Unauthorized disclosure may result in legal action.
  //         </p>
  //       </div>
  //     </body>
  //     </html>
  //   `,
  //   text: `NDA Successfully Signed\n\nProperty: ${propertyTitle}\n\nYou now have access to confidential financial information.\n\nReminder: All information is confidential and protected under NDA.`,
  // }),
  contactConfirmation: ({ fullName, subject, confirmationUrl }: ContactConfirmationArgs) => ({
    subject: `Confirm your request: ${subject}`,
    html: emailShell({
      title: 'Please confirm your request',
      body: `
        <p>Hi ${fullName},</p>
        <p>We received your message regarding <strong>${subject}</strong>. Please confirm your email address so our team can follow up.</p>
        <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">This link will expire in 24 hours.</p>
      `,
      cta: { label: 'Confirm my request', url: confirmationUrl },
    }),
    text: plainText([
      `Hi ${fullName},`,
      `Please confirm your request about ${subject}.`,
      `Confirmation link: ${confirmationUrl}`,
      'This link expires in 24 hours.',
    ]),
  }),
  contactAdminNotification: ({
    fullName,
    email,
    phone,
    inquiryType,
    subject,
    message,
    ipAddress,
    userAgent,
    confirmed,
  }: ContactAdminTemplateArgs) => ({
    subject: `${confirmed ? 'Confirmed' : 'Pending'} contact request from ${fullName}`,
    html: emailShell({
      title: `${fullName} submitted a contact message`,
      body: `
        <p><strong>Status:</strong> ${confirmed ? 'Confirmed' : 'Awaiting confirmation'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Inquiry type:</strong> ${inquiryType}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 4px solid #312e81; margin: 16px 0; padding-left: 16px; color: #4b5563;">${message}</blockquote>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 13px; color: #9ca3af;">
          IP: ${ipAddress}<br />
          User Agent: ${userAgent}
        </p>
      `,
    }),
    text: plainText([
      `Status: ${confirmed ? 'Confirmed' : 'Pending'}`,
      `Subject: ${subject}`,
      `Inquiry type: ${inquiryType}`,
      `From: ${fullName} (${email})${phone ? ` / ${phone}` : ''}`,
      '',
      message,
      '',
      `IP: ${ipAddress}`,
      `User Agent: ${userAgent}`,
    ]),
  }),
  sellerRequestReceipt: ({
    fullName,
    propertyTitle,
    propertyTypeLabel,
    askingPrice,
    currency,
    propertyLocation,
    city,
    state,
    country,
    googleMapsUrl,
    propertySize,
    bedrooms,
    bathrooms,
    constructionStatus,
  }: {
    fullName: string
    propertyTitle: string
    propertyTypeLabel: string
    askingPrice: number
    currency: string
    propertyLocation: string
    city: string
    state: string
    country: string
    googleMapsUrl?: string
    propertySize?: number
    bedrooms?: number
    bathrooms?: number
    constructionStatus?: string
  }) => ({
    subject: `FIMAC Group - Listing Request Received: ${propertyTitle}`,
    html: emailShell({
      title: 'Listing Request Received',
      body: `
        <p>Dear ${fullName},</p>
        <p>Thank you for submitting your property listing request to <strong>FIMAC Group</strong>. We review all submissions against our standards to ensure absolute quality and compliance.</p>
        
        <h3 style="color: #312e81; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 24px;">Property Details</h3>
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; margin-top: 12px;">
          <tr><td width="35%"><strong>Title:</strong></td><td>${propertyTitle}</td></tr>
          <tr><td><strong>Type:</strong></td><td>${propertyTypeLabel}</td></tr>
          <tr><td><strong>Asking Price:</strong></td><td>${askingPrice.toLocaleString()} ${currency}</td></tr>
          <tr><td><strong>Location:</strong></td><td>${propertyLocation}, ${city}, ${state}, ${country}</td></tr>
          ${propertySize ? `<tr><td><strong>Size:</strong></td><td>${propertySize} Sq M</td></tr>` : ''}
          ${bedrooms ? `<tr><td><strong>Bedrooms:</strong></td><td>${bedrooms}</td></tr>` : ''}
          ${bathrooms ? `<tr><td><strong>Bathrooms:</strong></td><td>${bathrooms}</td></tr>` : ''}
          ${constructionStatus ? `<tr><td><strong>Status:</strong></td><td>${constructionStatus === 'ready' ? 'Ready to Move In' : constructionStatus}</td></tr>` : ''}
          ${googleMapsUrl ? `<tr><td><strong>Coordinates Pin:</strong></td><td><a href="${googleMapsUrl}" target="_blank" style="color: #312e81; font-weight: bold;">View on Google Maps</a></td></tr>` : ''}
        </table>
        
        <p style="margin-top: 24px;">Our regional consultants will audit this request and contact you within 24 to 48 hours. Please prepare your international valuation files and HD photos prior to our call.</p>
      `,
      cta: googleMapsUrl ? { label: 'View Pin on Google Maps', url: googleMapsUrl } : undefined,
    }),
    text: plainText([
      `Dear ${fullName},`,
      `We have received your listing request for: ${propertyTitle}`,
      `Asking Price: ${askingPrice} ${currency}`,
      `Location: ${propertyLocation}, ${city}, ${state}, ${country}`,
      `FIMAC Group will contact you within 24-48 hours.`,
    ]),
  }),
  sellerRequestAdminNotification: ({
    sellerName,
    sellerEmail,
    sellerPhone,
    propertyTitle,
    propertyTypeLabel,
    askingPrice,
    currency,
    propertyLocation,
    city,
    state,
    country,
    latitude,
    longitude,
    googleMapsUrl,
    propertySize,
    bedrooms,
    bathrooms,
    constructionStatus,
    adminUrl,
  }: {
    sellerName: string
    sellerEmail: string
    sellerPhone: string
    propertyTitle: string
    propertyTypeLabel: string
    askingPrice: number
    currency: string
    propertyLocation: string
    city: string
    state: string
    country: string
    latitude?: number
    longitude?: number
    googleMapsUrl?: string
    propertySize?: number
    bedrooms?: number
    bathrooms?: number
    constructionStatus?: string
    adminUrl: string
  }) => ({
    subject: `[New Listing Request] ${propertyTitle} from ${sellerName}`,
    html: emailShell({
      title: 'New Seller Request Submitted',
      body: `
        <p>A new listing request has been submitted by a registered seller and is awaiting review in the CRM.</p>
        
        <h3 style="color: #312e81; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 24px;">Seller Profile</h3>
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; margin-top: 12px;">
          <tr><td width="35%"><strong>Name:</strong></td><td>${sellerName}</td></tr>
          <tr><td><strong>Email:</strong></td><td><a href="mailto:${sellerEmail}">${sellerEmail}</a></td></tr>
          <tr><td><strong>Phone:</strong></td><td>${sellerPhone}</td></tr>
        </table>
        
        <h3 style="color: #312e81; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 24px;">Asset Characteristics</h3>
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; margin-top: 12px;">
          <tr><td width="35%"><strong>Title:</strong></td><td>${propertyTitle}</td></tr>
          <tr><td><strong>Type:</strong></td><td>${propertyTypeLabel}</td></tr>
          <tr><td><strong>Asking Price:</strong></td><td>${askingPrice.toLocaleString()} ${currency}</td></tr>
          <tr><td><strong>Address:</strong></td><td>${propertyLocation}, ${city}, ${state}, ${country}</td></tr>
          ${propertySize ? `<tr><td><strong>Size:</strong></td><td>${propertySize} Sq M</td></tr>` : ''}
          ${bedrooms ? `<tr><td><strong>Bedrooms:</strong></td><td>${bedrooms}</td></tr>` : ''}
          ${bathrooms ? `<tr><td><strong>Bathrooms:</strong></td><td>${bathrooms}</td></tr>` : ''}
          ${constructionStatus ? `<tr><td><strong>Status:</strong></td><td>${constructionStatus === 'ready' ? 'Ready to Move In' : constructionStatus}</td></tr>` : ''}
          ${latitude && longitude ? `<tr><td><strong>Coordinates:</strong></td><td>${latitude}, ${longitude}</td></tr>` : ''}
          ${googleMapsUrl ? `<tr><td><strong>Google Maps Link:</strong></td><td><a href="${googleMapsUrl}" target="_blank" style="color: #312e81; font-weight: bold;">Locate Asset on Google Maps</a></td></tr>` : ''}
        </table>
      `,
      cta: { label: 'Open CRM Request', url: adminUrl },
    }),
    text: plainText([
      `New seller request submitted by ${sellerName} (${sellerEmail}).`,
      `Asset: ${propertyTitle}`,
      `Price: ${askingPrice} ${currency}`,
      `Open Request: ${adminUrl}`,
    ]),
  }),
}
