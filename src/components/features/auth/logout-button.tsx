"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Clear cookies by calling logout API
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Logged out successfully")
        router.push("/")
        router.refresh()
      }
    } catch (_error) {
      toast.error("Failed to logout")
    }
  }

  return (
    <button onClick={handleLogout} className="w-full flex items-center cursor-pointer">
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </button>
  )
}
