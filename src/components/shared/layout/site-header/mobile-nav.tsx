"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import type { CurrentUser } from "@/lib/auth/get-current-user"
import { LogoutButton } from "@/components/features/auth/logout-button"
import { LayoutDashboard } from "lucide-react"

const NAV_LINKS = [
  { label: 'HOME', href: '/' },
  { label: 'ABOUT', href: '/about' },
  { label: 'EXPLORE PROPERTY', href: '/search' },
  { label: 'BLOG', href: '/blog' },
  { label: 'CONTACT', href: '/contact' },
  { label: 'SELL', href: '/sell' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
} as const

const itemVariants = {
  hidden: { opacity: 0, x: 30, scale: 0.98 },
  show: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
      mass: 0.8
    }
  }
} as const

export function MobileNav({ user }: { user?: CurrentUser | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary hover:text-gold-royal transition-colors">
          <Menu className="size-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      
      {/* Optimized Performance: Solid background, removed heavy blur filters */}
      <SheetContent 
        side="magical" 
        className="bg-white p-0 flex flex-col overflow-hidden"
      >
        {/* Header Section */}
        <SheetHeader className="p-6 border-b border-gray-100 text-left bg-gray-50/50">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Main navigation links for FIMAC platform</SheetDescription>
          <Logo />
        </SheetHeader>

        {/* Framer Motion Staggered Links */}
        <motion.div 
          className="flex-1 overflow-y-auto py-6 px-4 space-y-2"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {NAV_LINKS.map((item) => {
            const isActive = pathname === item.href
            return (
              <motion.div key={item.label} variants={itemVariants}>
                <Link 
                  href={item.href} 
                  onClick={handleClose}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 group hover:scale-[1.02] active:scale-95 ${isActive ? 'bg-gray-50 shadow-sm' : 'hover:bg-gray-50 hover:shadow-sm'}`}
                >
                  <span className={`text-sm font-bold tracking-widest transition-colors ${isActive ? 'text-gold-royal' : 'text-primary group-hover:text-gold-royal'}`}>
                    {item.label}
                  </span>
                  <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-gold-royal translate-x-0' : 'text-gray-300 group-hover:text-gold-royal -translate-x-2 group-hover:translate-x-0'}`} />
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Call to Action with Spring Exit */}
        <motion.div 
          className="p-6 border-t border-gray-100 bg-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 25 }}
        >
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="mb-2 px-1">
                <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">Welcome Back</p>
                <p className="text-lg font-bold text-navy-deep truncate">{user.full_name}</p>
              </div>
              <Button asChild className="w-full bg-navy-deep hover:bg-gold-royal text-white font-bold tracking-widest h-14 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95">
                <Link href={user.role === "seller" ? "/dashboard/seller" : "/dashboard/investor"} onClick={handleClose}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  DASHBOARD
                </Link>
              </Button>
              <div className="w-full border-gray-200 bg-gray-50 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border font-bold tracking-widest h-14 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 flex items-center justify-center">
                <LogoutButton />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full bg-gold-royal hover:bg-navy-deep text-white font-bold tracking-widest h-14 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95">
                <Link href="/auth/register" onClick={handleClose}>GET STARTED</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-gray-200 bg-gray-50 text-primary hover:bg-white hover:text-gold-royal hover:border-gold-royal/30 font-bold tracking-widest h-14 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95">
                <Link href="/auth/login" onClick={handleClose}>SIGN IN</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}
