"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryEmail = searchParams.get("email") || ""
  const queryUserType = searchParams.get("user_type")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userType, setUserType] = useState<"investors" | "sellers">("investors")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Sync params from query string if present
  useEffect(() => {
    if (queryEmail) {
      setFormData((prev) => ({ ...prev, email: queryEmail }))
    }
    if (queryUserType === "sellers" || queryUserType === "investors") {
      setUserType(queryUserType)
    }
  }, [queryEmail, queryUserType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          user_type: userType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle email not verified
        if (data.code === "EMAIL_NOT_VERIFIED") {
          toast.error("Please verify your email first")
          router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}&user_type=${userType}`)
          return
        }
        throw new Error(data.error || "Login failed")
      }

      toast.success("Login successful!")

      // Redirect depending on user type
      if (userType === "sellers") {
        window.location.href = "/dashboard/seller"
      } else {
        window.location.href = "/"
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your FIMAC account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {userType === "investors" ? "Investor Sign In" : "Seller Sign In"}
            </CardTitle>
            <CardDescription>
              {userType === "investors" ? "Access your investment dashboard" : "Access your property portfolio dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Unified Role Tab Selector */}
            <div className="grid grid-cols-2 p-1.5 bg-gray-100/80 rounded-2xl mb-6 border border-gray-200/50 max-w-sm mx-auto">
              <button
                type="button"
                className={`py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                  userType === "investors"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-500 hover:text-blue-600"
                }`}
                onClick={() => setUserType("investors")}
              >
                Investor
              </button>
              <button
                type="button"
                className={`py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                  userType === "sellers"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-500 hover:text-blue-600"
                }`}
                onClick={() => setUserType("sellers")}
              >
                Seller
              </button>
            </div>

            {userType === "investors" && (
              <>
                {/* Google Sign-In */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-4 h-11"
                  onClick={() => (window.location.href = "/api/auth/google")}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </Button>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="investor@example.com"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                Register now
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Loading login...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
