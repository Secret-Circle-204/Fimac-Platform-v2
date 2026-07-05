"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, RefreshCw } from "lucide-react"
import { toast } from "sonner"

// Maximum verification attempts before lockout
const MAX_ATTEMPTS = 5
// Cooldown between resend requests (seconds)
const RESEND_COOLDOWN = 60

function VerifyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const userType = searchParams.get("user_type") || "investors"

  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const cooldownRef = useRef<NodeJS.Timeout | null>(null)
  const verifyingRef = useRef(false)

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push("/auth/register")
    }
  }, [email, router])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownRef.current = setTimeout(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current)
    }
  }, [resendCooldown])

  // Auto-submit when 6 digits entered
  const handleVerify = useCallback(async () => {
    if (code.length !== 6 || loading || locked || verifyingRef.current) return

    if (attempts >= MAX_ATTEMPTS) {
      setLocked(true)
      setError("Too many failed attempts. Please request a new code.")
      return
    }

    setError("")
    setLoading(true)
    verifyingRef.current = true

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAttempts((prev) => prev + 1)
        const remaining = MAX_ATTEMPTS - (attempts + 1)
        const errMsg =
          remaining > 0
            ? `${data.error || "Invalid code"}. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`
            : "Too many failed attempts. Please request a new code."
        if (remaining <= 0) setLocked(true)
        throw new Error(errMsg)
      }

      setSuccess(true)
      toast.success("Email verified successfully!")

      // Redirect to login after brief success animation, passing email and user_type
      setTimeout(() => {
        router.push(`/auth/login?email=${encodeURIComponent(email || "")}&user_type=${userType}`)
      }, 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed"
      setError(message)
      setCode("")
      verifyingRef.current = false
    } finally {
      setLoading(false)
    }
  }, [code, loading, locked, attempts, email, router, userType])

  // Auto-verify when code reaches 6 digits
  useEffect(() => {
    if (code.length === 6 && !loading && !locked) {
      handleVerify()
    }
  }, [code, handleVerify, loading, locked])

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setResending(true)
    setError("")

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, user_type: userType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code")
      }

      // Reset attempts on new code
      setAttempts(0)
      setLocked(false)
      setCode("")
      setResendCooldown(RESEND_COOLDOWN)
      toast.success("New verification code sent! Check your email.")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend code"
      setError(message)
      toast.error(message)
    } finally {
      setResending(false)
    }
  }

  // Mask email for display (john@example.com → j***@example.com)
  const maskedEmail = email
    ? email.replace(/^(.{1,2})(.*)(@.*)$/, (_m, start, _mid, domain) => {
        return `${start}${"•".repeat(Math.min(5, _mid.length))}${domain}`
      })
    : ""

  // --- Success State ---
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="pt-10 pb-10">
            <div className="text-center space-y-5">
              <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-[bounce_0.6s_ease-in-out]">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-gray-600">
                Your account has been successfully verified. You can now log in.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Redirecting to login...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // --- Main Verification Form ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription className="text-base mt-2">
            We sent a 6-digit code to
            <br />
            <span className="font-semibold text-gray-800">{maskedEmail}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1 duration-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* OTP Input */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                disabled={locked || loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
              disabled={loading || code.length !== 6 || locked}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verify Email
                </>
              )}
            </Button>
          </div>

          {/* Attempt counter */}
          {attempts > 0 && !locked && (
            <p className="text-center text-xs text-amber-600 font-medium">
              {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? "s" : ""} remaining
            </p>
          )}

          {/* Resend Section */}
          <div className="text-center space-y-2 pt-2">
            <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
            <Button
              variant="ghost"
              onClick={handleResendCode}
              disabled={resending || resendCooldown > 0}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
              {resending
                ? "Sending..."
                : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend Code"}
            </Button>
          </div>

          {/* Security note */}
          <div className="pt-3 border-t space-y-1 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 The code expires in 15 minutes for your security.
            </p>
            <p className="text-xs text-muted-foreground">
              Check your spam folder if you don&apos;t see the email.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardContent className="pt-10 pb-10">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-muted-foreground">Loading verification...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  )
}
