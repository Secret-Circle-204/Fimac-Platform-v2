'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, Send } from 'lucide-react'
import Link from 'next/link'

interface SellFormProps {
  propertyTypeOptions?: Array<{ label: string; value: number }>
  currentUser?: {
    full_name: string
    email: string
    phone: string
  } | null
}

export function SellForm({ propertyTypeOptions = [], currentUser = null }: SellFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      property_type: formData.get('property_type'),
      property_title: formData.get('property_title'),
      property_description: formData.get('property_description'),
      property_location: formData.get('property_location'),
      asking_price: formData.get('asking_price'),
      property_size: formData.get('property_size'),
    }

    try {
      const res = await fetch('/api/seller-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Something went wrong')
        return
      }

      setIsSuccess(true)
    } catch (_err) {
      setError('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="container w-full mx-auto max-w-7xl">
        <CardContent className="p-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Request Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in listing your property with Fimac Group. Our team will
            review your request and contact you within 24-48 hours.
          </p>
          <Button asChild className="bg-blue-900 hover:bg-blue-800">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-2xl-soft rounded-[40px] overflow-hidden">
      <div className="bg-navy-deep p-8 text-white">
        <h2 className="text-3xl font-bold mb-3">Property Listing Request</h2>
        <p className="text-white/70 leading-relaxed">
          Please provide comprehensive details about your asset. Note that all listings must adhere
          to our
          <span className="text-gold-royal font-bold"> Elite Standards</span>, including mandatory
          international valuation files and HD photography. By submitting, you acknowledge that a{' '}
          <strong>$10,000 fee</strong>
          applies if Fimac Group provides these professional services.
        </p>
      </div>
      <CardContent className="p-8 md:p-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seller Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-900 border-b pb-2">
              Your Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  required
                  placeholder="John Doe"
                  defaultValue={currentUser?.full_name || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  defaultValue={currentUser?.email || ''}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  defaultValue={currentUser?.phone || ''}
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-900 border-b pb-2">
              Property Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type *</Label>
                <Select name="property_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_title">Property Title *</Label>
                <Input
                  id="property_title"
                  name="property_title"
                  required
                  placeholder="e.g. Grand Hotel Downtown"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="property_location">Location *</Label>
                <Input
                  id="property_location"
                  name="property_location"
                  required
                  placeholder="City, State or full address"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="property_description">Description *</Label>
                <Textarea
                  id="property_description"
                  name="property_description"
                  required
                  rows={5}
                  placeholder="Describe your property including key features, current condition, and any relevant details..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asking_price">Asking Price (USD)</Label>
                <Input
                  id="asking_price"
                  name="asking_price"
                  type="number"
                  placeholder="e.g. 5000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_size">Property Size (sq ft / acres)</Label>
                <Input
                  id="property_size"
                  name="property_size"
                  type="number"
                  placeholder="e.g. 50000"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 text-lg"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Listing Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
