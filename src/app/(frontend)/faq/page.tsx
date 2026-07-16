import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Phone, Mail } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Frequently Asked Questions | Fimac Group",
  description: "Find answers to common questions about hospitality investment and real estate acquisitions.",
  keywords: ["real estate FAQ", "hotel investment questions", "FIMAC help", "buyer verification"],
  alternates: {
    canonical: '/faq',
  },
}

export default function FAQPage() {
  const schemaFaqs = [
    {
      question: "What is Fimac Group?",
      answer: "Fimac Group is a specialized platform connecting buyers with exclusive off-market hospitality properties like hotels and resorts. We facilitate the buying and selling of hotels, resorts, vacation rentals, and other hospitality properties in the Southeast United States."
    },
    {
      question: "How does the platform work?",
      answer: "Our platform offers a curated selection of hospitality properties. Buyers can browse listings, access detailed due diligence materials, and contact the platform directly. We provide support throughout the entire acquisition process."
    },
    {
      question: "Is there a fee to use the platform?",
      answer: "Browsing properties and basic registration are free. We charge fees for certain premium services such as property listings and transaction facilitation. All fees are transparent and disclosed upfront."
    },
    {
      question: "How do I become a verified buyer?",
      answer: "To become verified, you need to: (1) Create an buyer account, (2) Complete your profile with investment preferences, (3) Upload proof of funds or financial capability, (4) Sign our platform NDA. Our team typically reviews applications within 2-3 business days."
    },
    {
      question: "What information can I access on listed properties?",
      answer: "You'll gain access to detailed property information including: land area, zoning, capacity limits, and other essential details. This information is crucial for proper due diligence."
    },
    {
      question: "What types of properties are available?",
      answer: "We specialize in various hospitality properties including: hotels (boutique to full-service), resorts, motels, inns & bed and breakfasts, vacation rental properties, and commercial hospitality real estate. Properties range from $1M to $50M+."
    },
    {
      question: "Do you provide financing assistance?",
      answer: "While we don't provide financing directly, we work with several lenders specializing in hospitality real estate and can connect you with appropriate financing partners. We also provide resources on SBA loans and commercial real estate financing options."
    },
    {
      question: "How is my information protected?",
      answer: "We use bank-level encryption (256-bit SSL) to protect all data transmission. Sensitive financial information is stored in secure, encrypted databases with restricted access. We comply with all relevant data protection regulations and never sell your personal information."
    }
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: schemaFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex min-h-screen flex-col pt-24">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-blue-fimac text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-blue-100 max-w-2xl">
              Find answers to common questions about investing in hospitality properties
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* General Questions */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">General Questions</h2>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="bg-white rounded-lg px-6">
                  <AccordionTrigger className="text-left">What is Fimac Group?</AccordionTrigger>
                  <AccordionContent>
                    Fimac Group is a specialized platform connecting buyers with exclusive
                    off-market hospitality properties like hotels and resorts. We facilitate the
                    buying and selling of hotels, resorts, vacation rentals, and other hospitality
                    properties in the Southeast United States.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="bg-white rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    How does the platform work?
                  </AccordionTrigger>
                  <AccordionContent>
                    Our platform offers a curated selection of hospitality properties. Buyers can
                    browse listings, access detailed due diligence materials, and contact the
                    platform directly. We provide support throughout the entire acquisition process.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="bg-white rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    Is there a fee to use the platform?
                  </AccordionTrigger>
                  <AccordionContent>
                    Browsing properties and basic registration are free. We charge fees for certain
                    premium services such as property listings and transaction facilitation. All
                    fees are transparent and disclosed upfront.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* For Buyers */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">For Buyers</h2>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="inv-1" className="bg-white rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    How do I become a verified buyer?
                  </AccordionTrigger>
                  <AccordionContent>
                    To become verified, you need to: (1) Create an buyer account, (2) Complete
                    your profile with investment preferences, (3) Upload proof of funds or financial
                    capability, (4) Sign our platform NDA. Our team typically reviews applications
                    within 2-3 business days.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="inv-2" className="bg-white rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    What information can I access on listed properties?
                  </AccordionTrigger>
                  <AccordionContent>
                    You&apos;ll gain access to detailed property information including: land area,
                    zoning, capacity limits, and other essential details. This information is
                    crucial for proper due diligence.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="inv-3" className="bg-white rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    What types of properties are available?
                  </AccordionTrigger>
                  <AccordionContent>
                    We specialize in various hospitality properties including: hotels (boutique to
                    full-service), resorts, motels, inns & bed and breakfasts, vacation rental
                    properties, and commercial hospitality real estate. Properties range from $1M to
                    $50M+.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="inv-4" className="bg-white rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    Do you provide financing assistance?
                  </AccordionTrigger>
                  <AccordionContent>
                    While we don&apos;t provide financing directly, we work with several lenders
                    specializing in hospitality real estate and can connect you with appropriate
                    financing partners. We also provide resources on SBA loans and commercial real
                    estate financing options.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Security & Privacy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Security & Privacy</h2>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="sec-1" className="bg-white rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    How is my information protected?
                  </AccordionTrigger>
                  <AccordionContent>
                    We use bank-level encryption (256-bit SSL) to protect all data transmission.
                    Sensitive financial information is stored in secure, encrypted databases with
                    restricted access. We comply with all relevant data protection regulations and
                    never sell your personal information.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-0">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Our team is here to help. Contact us for personalized assistance with your
                  investment or property listing needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-blue-900 hover:bg-blue-800">
                    <Link href="/contact">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Contact Support
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href="tel:+1234567890">
                      <Phone className="mr-2 h-5 w-5" />
                      Call Us
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href="mailto:info@fimacgroup.com">
                      <Mail className="mr-2 h-5 w-5" />
                      Email Us
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
    </>
  )
}
