import { ContactForm } from "@/components/contact/contact-form"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { getCachedCompanySettings } from "@/lib/cache/company-settings"

export const metadata = {
  title: "Contact Us | Fimac Group",
  description: "Get in touch with our team for investment opportunities and inquiries",
  keywords: ["contact FIMAC", "Fimac phone number", "real estate support", "hospitality investment contact"],
  alternates: {
    canonical: '/contact',
  },
}

export default async function ContactPage() {
  const user = await getCurrentUser()
  const settings = await getCachedCompanySettings()

  const contactEmail = settings.contactEmail || 'info@fimacgroup.com'
  const contactPhone = settings.contactPhone || '+1 (234) 567-8900'
  const contactOffice = settings.contactOffice || '123 Investment Plaza\nKnoxville, TN 37902'

  return (
    <div className="flex min-h-screen flex-col pt-24">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-blue-fimac text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-blue-100 max-w-2xl">
              Have questions about hospitality investments? We&apos;re here to help.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Form - 2/3 width */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
                    <p className="text-gray-600 mb-6">
                      Fill out the form below and our team will get back to you within 24 hours.
                    </p>
                    <ContactForm />
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info - 1/3 width */}
              <div className="space-y-6">
                {/* Contact Information Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      {/* Email */}
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Mail className="h-5 w-5 text-blue-900" />
                        </div>
                        <div>
                          <p className="font-medium">Email</p>
                          <a
                            href={`mailto:${contactEmail}`}
                            className="text-blue-900 hover:underline"
                          >
                            {contactEmail}
                          </a>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Phone className="h-5 w-5 text-blue-900" />
                        </div>
                        <div>
                          <p className="font-medium">Phone</p>
                          <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="text-blue-900 hover:underline">
                            {contactPhone}
                          </a>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <MapPin className="h-5 w-5 text-blue-900" />
                        </div>
                        <div>
                          <p className="font-medium">Office</p>
                          <p className="text-gray-600 whitespace-pre-line">
                            {contactOffice}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                    <div className="space-y-2">
                      <a href="/dashboard/buyer" className="block text-blue-900 hover:underline">
                        → Buyer Dashboard
                      </a>
                      {user?.role === "seller" && (
                        <a href="/sell" className="block text-blue-900 hover:underline">
                          → List Your Property
                        </a>
                      )}
                      <a href="/search" className="block text-blue-900 hover:underline">
                        → Browse Properties
                      </a>
                      <a href="/faq" className="block text-blue-900 hover:underline">
                        → Frequently Asked Questions
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section - Placeholder */}
        <section className="h-96 bg-gray-200">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Map Coming Soon</p>
            </div>
          </div>
        </section>

        {/* FAQ Teaser */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Check out our frequently asked questions or reach out to our team directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/faq"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800"
              >
                View FAQ
              </a>
              <a
                href="tel:+1234567890"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Us Now
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
