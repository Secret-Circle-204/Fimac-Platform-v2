"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Common email domain typos mapped to their correct domains
const EMAIL_DOMAIN_CORRECTIONS: Record<string, string> = {
  // Gmail
  "gmial.com": "gmail.com",
  "gmila.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmali.com": "gmail.com",
  "gmil.com": "gmail.com",
  "gmaul.com": "gmail.com",
  "gemail.com": "gmail.com",
  "gimail.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.om": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cpm": "gmail.com",
  "gmaio.com": "gmail.com",
  "gmaiil.com": "gmail.com",
  // Yahoo
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yaoo.com": "yahoo.com",
  "yhoo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.cm": "yahoo.com",
  "yahoo.con": "yahoo.com",
  // Hotmail
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmali.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmale.com": "hotmail.com",
  // Outlook
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "outlool.com": "outlook.com",
  "outllook.com": "outlook.com",
  "outlook.co": "outlook.com",
  "outlook.con": "outlook.com",
  "outloook.com": "outlook.com",
}

function checkEmailDomainTypo(email: string): string | null {
  const parts = email.split("@")
  if (parts.length !== 2) return null
  const domain = parts[1].toLowerCase()
  const correctedDomain = EMAIL_DOMAIN_CORRECTIONS[domain]
  if (correctedDomain) {
    return `${parts[0]}@${correctedDomain}`
  }
  return null
}

export default function RegisterPageClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailWarning, setEmailWarning] = useState<string | null>(null)
  const [userType, setUserType] = useState<"investors" | "sellers">("investors")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    company_name: "",
  })

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value })
    const suggestion = checkEmailDomainTypo(value)
    setEmailWarning(suggestion)
  }

  const applySuggestedEmail = () => {
    if (emailWarning) {
      setFormData({ ...formData, email: emailWarning })
      setEmailWarning(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Check for email domain typo before submitting
    const emailSuggestion = checkEmailDomainTypo(formData.email)
    if (emailSuggestion) {
      setError(`It looks like you may have a typo in your email. Did you mean ${emailSuggestion}?`)
      return
    }

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          user_type: userType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      toast.success("Registration successful! Check your email for verification code.")

      // Redirect to verification page
      router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}&user_type=${userType}`)
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
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join FIMAC Platform</h1>
          <p className="text-gray-600">Financial Investment Management Advisory & Consultants</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {userType === "investors" ? "Create Your Investor Account" : "Create Your Seller Account"}
            </CardTitle>
            <CardDescription>Fill in your details to get started</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Unified Role Tab Selector */}
            <div className="grid grid-cols-2 p-1.5 bg-gray-100/80 rounded-2xl mb-6 border border-gray-200/50 max-w-md mx-auto">
              <button
                type="button"
                className={`py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                  userType === "investors"
                    ? "bg-navy-deep text-white shadow-lg-soft"
                    : "text-gray-500 hover:text-navy-deep"
                }`}
                onClick={() => setUserType("investors")}
              >
                I want to Invest
              </button>
              <button
                type="button"
                className={`py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                  userType === "sellers"
                    ? "bg-navy-deep text-white shadow-lg-soft"
                    : "text-gray-500 hover:text-navy-deep"
                }`}
                onClick={() => setUserType("sellers")}
              >
                I want to Sell
              </button>
            </div>

            {userType === "investors" && (
              <>
                {/* Google Sign-Up */}
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
                  Sign up with Google
                </Button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or register with email
                    </span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name (Optional)</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Your Company LLC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="john@example.com"
                  className={emailWarning ? "border-amber-400 focus-visible:ring-amber-400" : ""}
                />
                {emailWarning && (
                  <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-amber-600 shrink-0">⚠️</span>
                    <span className="text-amber-800">
                      Did you mean{" "}
                      <button
                        type="button"
                        onClick={applySuggestedEmail}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        {emailWarning}
                      </button>
                      ?
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-blue-600 hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
