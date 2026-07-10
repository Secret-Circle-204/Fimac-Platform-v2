import { SellForm } from "./sell-form"
import { Building2 } from "lucide-react"
import { getCachedPropertyTypes } from "@/lib/cache/property-types"
import { getCurrentUser } from "@/lib/auth/get-current-user"

export default async function SellPage() {
  const user = await getCurrentUser()
  const propertyTypesData = await getCachedPropertyTypes()
  const propertyTypeOptions = propertyTypesData.map((t) => ({
    label: t.name,
    value: t.id, // We need the ID to populate the relationship correctly!
  }))

  return (
    <div className="flex min-h-screen bg-blue-fimac flex-col pt-24">
      <main className="flex-1">
        {/* Hero */}
        <section className="text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gold-royal/20 rounded-2xl border border-gold-royal/30">
                <Building2 className="h-8 w-8 text-gold-royal" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                List Your Signature Property
              </h1>
            </div>
            <p className="text-xl text-white/70 max-w-2xl leading-relaxed">
              Partner with Fimac Group to bring your luxury assets to a global audience of elite
              buyers. Our platform ensures maximum exposure and professional management for every
              transaction.
            </p>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-navy-deep mb-4 uppercase tracking-wider">
                  Listing Requirements
                </h2>
                <div className="h-1 w-20 bg-gold-royal mx-auto" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 flex flex-col gap-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl-soft">
                  <div className="w-16 h-16 rounded-2xl bg-gold-royal/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gold-royal"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-deep mb-3">Valuation Files</h3>
                    <p className="text-navy-deep/60 leading-relaxed">
                      All listings must include an official, up-to-date valuation report from a
                      certified international appraiser.
                    </p>
                  </div>
                </div>

                <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 flex flex-col gap-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl-soft">
                  <div className="w-16 h-16 rounded-2xl bg-gold-royal/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gold-royal"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-deep mb-3">HD Photography</h3>
                    <p className="text-navy-deep/60 leading-relaxed">
                      Professional 8K visual representation is mandatory to maintain our platform&apos;s
                      ultra-luxury standards.
                    </p>
                  </div>
                </div>

                <div className="p-10 rounded-[40px] bg-navy-deep text-white flex flex-col gap-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-gold">
                  <div className="w-16 h-16 rounded-2xl bg-gold-royal/20 flex items-center justify-center border border-gold-royal/30">
                    <span className="text-2xl font-bold text-gold-royal">$10k</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-gold-royal">Full Service Option</h3>
                    <p className="text-white/70 leading-relaxed">
                      Clients unable to provide these assets will be charged a fixed{" "}
                      <strong>$10,000 USD</strong> fee, and our elite team will handle all
                      professional valuation and photography.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-7xl">
            <SellForm propertyTypeOptions={propertyTypeOptions} currentUser={user} />
          </div>
        </section>
      </main>
    </div>
  )
}
