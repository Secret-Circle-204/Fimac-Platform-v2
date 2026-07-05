"use client"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"
import Link from "next/link"
import type { CurrentUser } from "@/lib/auth/get-current-user"

interface NewsLetterProps {
  user?: CurrentUser | null
}

export function NewsLetter({ user }: NewsLetterProps) {
  const isSeller = user?.role === "seller"
  const dashboardUrl = isSeller ? "/dashboard/seller" : "/dashboard/investor"

  return (
    <section className="py-16 bg-blue-fimac text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        {/* <div className="absolute inset-x-1/3 top-0 h-40 bg-white blur-3xl" /> */}
      </div>
      <div className="container relative mx-auto px-4 text-center">
        <FadeIn className="space-y-4">
          <h2 className="text-3xl font-bold">Stay Updated With the world Real Estate</h2>
          <p className="max-w-2xl mx-auto">
            {user ? (
              <>
                Welcome back, <span className="font-semibold">{user.full_name}</span>! Explore your dashboard to manage your settings, view listings, or discover premium property insights.
              </>
            ) : (
              "Sign up for our newsletter and be the first to know about new properties, market trends, and expert advice about living in the world . No spam, just valuable content about our beautiful region."
            )}
          </p>
        </FadeIn>
        <FadeIn delay={120}>
          <div className="flex items-center justify-center max-w-md mx-auto mt-8">
            <Button variant="outline" size="lg" className="h-12 text-blue-900 tablet:text-base bg-white hover:bg-gray-100 hover:text-blue-900 border-none transition-all duration-300 transform hover:scale-[1.05] active:scale-95 shadow-md" asChild>
              {user ? (
                <Link href={dashboardUrl}>
                  GO TO DASHBOARD
                </Link>
              ) : (
                <Link href="/auth/register">
                  SIGN UP
                </Link>
              )}
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

