import React from "react"
import "@/styles/frontend.css"
import { Toaster } from "@/components/ui/sonner"
import { SiteHeader } from "@/components/shared/layout/site-header"
import { UserNav } from "@/components/features/auth/user-nav"
import { Footer } from "@/components/shared/layout/site-footer"
import { SERVER_URL } from "@/env"

export const metadata = {
  metadataBase: new URL(SERVER_URL || 'http://localhost:3000'),
  title: {
    default: "FIMAC | Global Real Estate Investment & Hospitality Advisors",
    template: "%s | FIMAC",
  },
  description: "FIMAC is a premier real estate platform offering global properties, luxury hotels, residential real estate, commercial assets, and expert consulting. Find your dream property with us.",
  keywords: ["real estate", "hospitality investment", "luxury hotels for sale", "commercial real estate", "property advisors", "FIMAC", "Fimac Group"],
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SERVER_URL,
    siteName: "FIMAC Group",
    title: "FIMAC | Global Real Estate & Hospitality Investment Platform",
    description: "Discover exclusive luxury hotels, resorts, commercial assets, and residential real estate globally with FIMAC.",
    images: [
      {
        url: "/scene-with-business-.jpg",
        width: 1200,
        height: 630,
        alt: "FIMAC | Global Real Estate Investment & Hospitality Advisors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FIMAC | Global Real Estate & Hospitality Investment Platform",
    description: "Discover exclusive luxury hotels, resorts, commercial assets, and residential real estate globally with FIMAC.",
    images: ["/scene-with-business-.jpg"],
  },
}
import { getCurrentUser } from "@/lib/auth/get-current-user"

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const user = await getCurrentUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <main>
          <SiteHeader userNav={<UserNav />} user={user} />
          {children}
          <Footer user={user} />
        </main>
        <Toaster />
      </body>
    </html>
  )
}
