import React from "react"
import "@/styles/frontend.css"
import { Toaster } from "@/components/ui/sonner"
import { SiteHeader } from "@/components/shared/layout/site-header"
import { UserNav } from "@/components/features/auth/user-nav"
import { Footer } from "@/components/shared/layout/site-footer"
export const metadata = {
  title: "FIMAC PLATFORM",
  description: "A financial investment management advice consultants., and hotels seller",
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
          <Footer />
        </main>
        <Toaster />
      </body>
    </html>
  )
}
