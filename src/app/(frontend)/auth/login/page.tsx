import { getCurrentUser } from "@/lib/auth/get-current-user"
import { redirect } from "next/navigation"
import LoginPageClient from "./login-page-client"

export const metadata = {
  title: "Sign In | FIMAC PLATFORM",
  description: "Sign in to your FIMAC account",
}

export default async function LoginPage() {
  const user = await getCurrentUser()

  if (user) {
    // If user is logged in, redirect them to dashboard/home based on their role
    redirect(user.role === "seller" ? "/dashboard/seller" : "/")
  }

  return <LoginPageClient />
}
