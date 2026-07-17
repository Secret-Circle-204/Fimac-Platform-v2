"use client" // this is a Client Component

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { Button } from "@/components/ui/button"
import { propertyInquiryAction } from "./action"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { schema } from "./schema"
import { toast } from "sonner"
import { useProperty } from "@/components/providers/property"
import { useState, useEffect } from "react"
import { Mail, Phone, MessageSquare, Zap, Calendar, Eye } from "lucide-react"

interface CurrentUserSession {
  id: string
  email: string
  full_name: string
  phone?: string
  role: "buyer" | "seller"
  collection: "buyers" | "sellers"
}

export function PropertyInquiryForm() {
  const property = useProperty()
  const [currentUser, setCurrentUser] = useState<CurrentUserSession | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [alreadyInquired, setAlreadyInquired] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdmin(document.cookie.includes("payload-token="))
    }
  }, [])

  const getDefaultValues = () => {
    return {
      name: "",
      email: "",
      message: "",
      phone: "",
      propertyId: property.id,
      preferredContact: undefined as "email" | "phone" | "whatsapp" | undefined,
      buyingTimeline: undefined as "immediate" | "later" | "browsing" | undefined,
    }
  }

  // Dev-only: generates fake form data using dynamically-imported faker
  // This ensures the ~2.8MB faker bundle is never included in production builds
  const fillTestData = async () => {
    const { faker } = await import("@faker-js/faker")
    const defaultMessage = `Hello,\n\nI am interested in the property "${property.address.fullAddress}".\n\nPlease let me know how I can proceed with the inquiry.\n\nThank you!`
    form.reset({
      name: faker.person.fullName(),
      email: (faker.internet.username() + "@example.com").toLocaleLowerCase(),
      message: defaultMessage,
      phone: faker.phone.number(),
      propertyId: property.id,
    })
  }

  const { form, handleSubmitWithAction, action } = useHookFormAction(
    propertyInquiryAction,
    zodResolver(schema),
    {
      formProps: {
        mode: "onChange",
        defaultValues: getDefaultValues(),
      },
      actionProps: {
        onError: ({ error }) => {
          toast.error("Message failed to send", {
            description: error.serverError,
            duration: 3000,
          })
        },
        onSuccess: ({ data }) => {
          if (data?.error) {
            toast.error("Message failed to send", {
              description: data.error,
              duration: 4000,
            })
            if (data.error.includes("24 hours")) {
              setAlreadyInquired(true)
              setTimeRemaining("24 hours")
              try {
                const stored = localStorage.getItem("inquired_properties")
                const inquiries = stored ? JSON.parse(stored) : {}
                inquiries[property.id] = new Date().toISOString()
                localStorage.setItem("inquired_properties", JSON.stringify(inquiries))
              } catch (err) {
                console.error("Error writing to localStorage:", err)
              }
            }
            return
          }

          setIsSuccess(true)
          if (data?.id) {
            setSubmittedInquiryId(data.id)
          }
          toast.success("Message sent!", {
            description: "Your message has been sent to the property administrators.",
            duration: 3000,
          })

          // Save submission to localStorage to block for 24h
          try {
            const stored = localStorage.getItem("inquired_properties")
            const inquiries = stored ? JSON.parse(stored) : {}
            inquiries[property.id] = new Date().toISOString()
            localStorage.setItem("inquired_properties", JSON.stringify(inquiries))
            setAlreadyInquired(true)
            setTimeRemaining("24 hours")
          } catch (err) {
            console.error("Error writing to localStorage:", err)
          }

          form.reset({
            name: currentUser?.full_name || "",
            email: currentUser?.email || "",
            phone: currentUser?.phone || "",
            message: "",
            propertyId: property.id,
            preferredContact: undefined,
            buyingTimeline: undefined,
          })
        },
      },
    },
  )

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/current-user")
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated) {
            setCurrentUser(data)
            form.reset({
              name: data.full_name || "",
              email: data.email || "",
              phone: data.phone || "",
              message: "",
              propertyId: property.id,
              preferredContact: undefined,
              buyingTimeline: undefined,
            })
          }
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err)
      } finally {
        setLoadingUser(false)
      }
    }
    fetchUser()
  }, [form, property.id])

  useEffect(() => {
    const checkLocalStorage = () => {
      try {
        const stored = localStorage.getItem("inquired_properties")
        if (stored) {
          const inquiries = JSON.parse(stored)
          const lastInquiryTime = inquiries[property.id]
          if (lastInquiryTime) {
            const timeDiff = Date.now() - new Date(lastInquiryTime).getTime()
            const twentyFourHours = 24 * 60 * 60 * 1000
            if (timeDiff < twentyFourHours) {
              setAlreadyInquired(true)
              
              // Calculate remaining time
              const remaining = twentyFourHours - timeDiff
              const hours = Math.floor(remaining / (60 * 60 * 1000))
              const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
              if (hours > 0) {
                setTimeRemaining(`${hours}h ${minutes}m`)
              } else {
                setTimeRemaining(`${minutes}m`)
              }
            }
          }
        }
      } catch (err) {
        console.error("Error reading localStorage:", err)
      }
    }
    checkLocalStorage()
  }, [property.id])

  useEffect(() => {
    if (action.result.data?.error) {
      if (action.result.data.error.includes("24 hours")) {
        setAlreadyInquired(true)
        setTimeRemaining("24 hours")
        try {
          const stored = localStorage.getItem("inquired_properties")
          const inquiries = stored ? JSON.parse(stored) : {}
          inquiries[property.id] = new Date().toISOString()
          localStorage.setItem("inquired_properties", JSON.stringify(inquiries))
        } catch (err) {
          console.error("Error writing to localStorage:", err)
        }
      }
    }
  }, [action.result.data, property.id])

  const isExecuting = action.isExecuting || form.formState.isSubmitting

  if (loadingUser) {
    return (
      <div className="flex flex-col gap-3 py-2 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-lg w-full" />
        <div className="h-10 bg-slate-100 rounded-lg w-full" />
        <div className="h-10 bg-slate-100 rounded-lg w-full" />
        <div className="h-24 bg-slate-100 rounded-lg w-full" />
        <div className="h-10 bg-slate-200 rounded-lg w-full" />
      </div>
    )
  }

  if (alreadyInquired) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in duration-300">
        <div className="size-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-3 border border-amber-100">
          <svg
            className="size-6 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h4 className="text-sm font-bold text-slate-800 mb-1">Inquiry Already Submitted</h4>
        <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed">
          You have already sent an inquiry for this property. To prevent spam, you can submit another request in <span className="font-semibold text-amber-600">{timeRemaining}</span>.
        </p>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8 px-4 animate-in fade-in zoom-in duration-300">
        <div className="size-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-green-100">
          <svg
            className="size-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h4 className="text-lg font-bold text-slate-900 mb-1">Inquiry Sent!</h4>
        <p className="text-sm text-slate-500 max-w-[280px]">
          Your message has been sent to the property administrators. We will contact you soon.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-6 w-full font-medium text-xs rounded-lg hover:bg-slate-50"
          onClick={() => setIsSuccess(false)}
        >
          Send Another Message
        </Button>

        {isAdmin && (
          <div className="flex flex-col gap-2 w-full mt-4 border-t border-slate-100 pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Quick Links</p>
            <div className="flex flex-col gap-2 w-full">
              {submittedInquiryId && (
                <a
                  href={`/admin/collections/contact-messages/${submittedInquiryId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer"
                >
                  View Request in Admin
                </a>
              )}
              <a
                href="/admin/collections/contact-messages"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                Go to Messages Collection
              </a>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmitWithAction} className="flex flex-1 w-full flex-col gap-2">
      {action.result.data?.error && (
        <div className="text-red-500 bg-red-50 py-2 px-3 rounded-lg text-sm border border-red-100 font-medium">
          {action.result.data.error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {form.formState.errors.propertyId ? (
          <p className="text-red-500 bg-red-50 py-1 px-2 rounded text-sm">
            {form.formState.errors.propertyId.message}
          </p>
        ) : null}
        {form.formState.errors.name ? (
          <p className="text-red-500 bg-red-50 py-1 px-2 rounded text-sm">
            {form.formState.errors.name.message}
          </p>
        ) : null}
        {!currentUser && form.formState.errors.email ? (
          <p className="text-red-500 bg-red-50 py-1 px-2 rounded text-sm">
            {form.formState.errors.email.message}
          </p>
        ) : null}
        {form.formState.errors.phone ? (
          <p className="text-red-500 bg-red-50 py-1 px-2 rounded text-sm">
            {form.formState.errors.phone.message}
          </p>
        ) : null}
        {form.formState.errors.message ? (
          <p className="text-red-500 bg-red-50 py-1 px-2 rounded text-sm">
            {form.formState.errors.message.message}
          </p>
        ) : null}
        {form.formState.errors.preferredContact ? (
          <p className="text-red-500 bg-red-50 py-1 px-2 rounded text-sm">
            {form.formState.errors.preferredContact.message}
          </p>
        ) : null}
        {form.formState.errors.buyingTimeline ? (
          <p className="text-red-500 bg-red-50 py-1 px-2 rounded text-sm">
            {form.formState.errors.buyingTimeline.message}
          </p>
        ) : null}
      </div>
      <Input placeholder="Enter your name" {...form.register("name")} disabled={isExecuting} />
      {currentUser ? (
        <input type="hidden" {...form.register("email")} />
      ) : (
        <Input placeholder="Enter your email" {...form.register("email")} disabled={isExecuting} />
      )}
      <Input placeholder="Enter your phone" {...form.register("phone")} disabled={isExecuting} />

      <div className="flex flex-col gap-1.5 my-1">
        <span className="text-xs font-semibold text-slate-500">Preferred Contact Method</span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "email", label: "Email", icon: Mail },
            { value: "phone", label: "Phone", icon: Phone },
            { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
          ].map((method) => {
            const Icon = method.icon
            const isSelected = form.watch("preferredContact") === method.value
            return (
              <button
                key={method.value}
                type="button"
                onClick={() => form.setValue("preferredContact", method.value as "email" | "phone" | "whatsapp", { shouldValidate: true })}
                disabled={isExecuting}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                } ${isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon size={14} />
                {method.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 my-1">
        <span className="text-xs font-semibold text-slate-500">Buying Timeline</span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "immediate", label: "Immediate", icon: Zap },
            { value: "later", label: "Planning", icon: Calendar },
            { value: "browsing", label: "Browsing", icon: Eye },
          ].map((timeline) => {
            const Icon = timeline.icon
            const isSelected = form.watch("buyingTimeline") === timeline.value
            return (
              <button
                key={timeline.value}
                type="button"
                onClick={() => form.setValue("buyingTimeline", timeline.value as "immediate" | "later" | "browsing", { shouldValidate: true })}
                disabled={isExecuting}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                } ${isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon size={14} />
                {timeline.label}
              </button>
            )
          })}
        </div>
      </div>

      <Textarea placeholder="Enter your message" {...form.register("message")} disabled={isExecuting} />

      <Button type="submit" className="w-full" disabled={!form.formState.isValid || isExecuting}>
        {isExecuting ? (
          <div className="flex items-center justify-center gap-2">
            <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </div>
        ) : (
          "Send"
        )}
      </Button>

      {process.env.NODE_ENV !== "production" && !currentUser && (
        <Button
          type="button"
          variant={"link"}
          size={"sm"}
          onClick={fillTestData}
          disabled={isExecuting}
        >
          generate test data
        </Button>
      )}
    </form>
  )
}
