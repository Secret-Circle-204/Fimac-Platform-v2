"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { MobileNav } from "./mobile-nav"
import { GlobeIcon } from "lucide-react"
import type { CurrentUser } from "@/lib/auth/get-current-user"
const _company_name = "FIMAC"

export function SiteHeader({ userNav, user }: { userNav: React.ReactNode, user: CurrentUser | null }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 10)
        ticking.current = false
      })
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 desktop:px-0 transition-[box-shadow] duration-300 border-b border-gray-100 bg-background ${
        isScrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 py-4 mx-auto">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2">
          <Image src="/blue-logo.svg" alt="Logo" width={100} height={100} className="h-10 w-auto" />
        </Link>

        <nav className="hidden tablet:flex items-center gap-8 bg-background/50 px-6 py-2 rounded-full border border-gold-royal/10">
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:text-gold-royal transition-colors"
          >
            HOME
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-primary hover:text-gold-royal transition-colors"
          >
            ABOUT
          </Link>
          <Link
            href="/search"
            className="text-sm font-medium text-primary hover:text-gold-royal transition-colors flex items-center gap-2"
          >
            <GlobeIcon className="size-4" /> EXPLORE PROPERTY
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-primary hover:text-gold-royal transition-colors"
          >
            BLOG
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-primary hover:text-gold-royal transition-colors"
          >
            CONTACT
          </Link>
          <Link
            href="/sell"
            className="text-sm font-medium text-primary hover:text-gold-royal transition-colors"
          >
            SELL
          </Link>
        </nav>

        <div className="hidden tablet:flex items-center gap-4">{userNav}</div>

        <div className="tablet:hidden">
          <MobileNav user={user} />
        </div>
      </div>
    </header>
  )
}
