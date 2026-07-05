import { getCurrentUser } from "@/lib/auth/get-current-user"
import { redirect } from "next/navigation"
import RegisterPageClient from "./register-page-client"

export const metadata = {
  title: "Create Account | FIMAC PLATFORM",
  description: "Create your FIMAC Platform account to start investing or listing properties.",
}

export default async function RegisterPage() {
  const user = await getCurrentUser()

  if (user) {
    // If user is logged in, redirect them to dashboard/home based on their role
    redirect(user.role === "seller" ? "/dashboard/seller" : "/")
  }

  return <RegisterPageClient />
}
