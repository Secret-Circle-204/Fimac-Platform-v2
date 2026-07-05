import { requireInvestor } from '@/lib/auth/get-current-user'
import { redirect } from 'next/navigation'
import { Building2, Eye, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getPayloadClient } from '@/db/client'
import { RecentlyViewedProperties } from '@/components/investor/recently-viewed'
import { RecommendedProperties } from '@/components/investor/recommended-properties'
export const dynamic = 'force-dynamic'

export default async function InvestorDashboard() {
  let user
  try {
    user = await requireInvestor()
    console.log('✅ User authenticated:', user.email, user.role)
  } catch (error) {
    console.error('❌ Auth error in investor dashboard:', error)
    redirect('/auth/login')
  }

  // Fetch stats directly from Payload instead of API call
  // (server-side fetch to localhost doesn't work reliably)
  let stats = {
    totalViews: 0,
    uniquePropertiesViewed: 0,
  }

  try {
    const payload = await getPayloadClient()

    // Get views count
    const views = await payload.find({
      collection: 'property-views',
      where: {
        and: [
          {
            'user.value': {
              equals: Number(user.id),
            },
          },
          {
            'user.relationTo': {
              equals: 'investors',
            },
          },
        ],
      },
      limit: 1,
    })

    // Get unique properties
    const allViews = await payload.find({
      collection: 'property-views',
      where: {
        and: [
          {
            'user.value': {
              equals: Number(user.id),
            },
          },
          {
            'user.relationTo': {
              equals: 'investors',
            },
          },
        ],
      },
      limit: 1000,
    })

    const uniqueProperties = new Set()
    allViews.docs.forEach((view) => {
      const propId =
        typeof view.property === 'object' && view.property !== null
          ? view.property.id
          : view.property
      uniqueProperties.add(propId)
    })

    stats = {
      totalViews: views.totalDocs,
      uniquePropertiesViewed: uniqueProperties.size,
    }

    console.log('✅ Stats fetched:', stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Continue with default stats
  }

  const isVerified = user.verification_status === 'verified'

  return (
    <div className="min-h-screen pt-22 bg-[#FDFCFB]">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-linear-to-br from-navy-deep via-[#1a1145] to-[#0f0a2e]">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-royal/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-gold-royal text-sm font-semibold tracking-widest uppercase mb-2">
                Investor Dashboard
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Welcome back,{' '}
                <span className="text-gold-royal">
                  {user.full_name?.split(' ')[0] || 'Investor'}
                </span>
              </h1>
              <p className="mt-2 text-white/50 text-sm">
                Discover, track, and manage your investment portfolio
              </p>
            </div>
            <Link
              href="/search"
              className="group inline-flex items-center gap-2.5 bg-gold-royal hover:bg-gold-light text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-300 shadow-[0_4px_20px_-5px_rgba(161,128,82,0.5)] hover:shadow-[0_8px_30px_-5px_rgba(161,128,82,0.6)] hover:-translate-y-0.5"
            >
              <Building2 className="h-4 w-4" />
              Browse Properties
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {/* Total Views */}
            <div className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.1] transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">
                  Total Views
                </span>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">{stats.totalViews}</p>
              <p className="text-white/30 text-xs mt-1">
                {stats.uniquePropertiesViewed} unique properties
              </p>
            </div>

            {/* Unique Properties */}
            <div className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.1] transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gold-royal/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-gold-royal" />
                </div>
                <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">
                  Properties Explored
                </span>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                {stats.uniquePropertiesViewed}
              </p>
              <p className="text-white/30 text-xs mt-1">Unique portfolios viewed</p>
            </div>

            {/* Account Status */}
            <div className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.1] transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${isVerified ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}
                >
                  <ShieldCheck
                    className={`h-5 w-5 ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}
                  />
                </div>
                <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">
                  Account Status
                </span>
              </div>
              <p className="text-3xl font-black text-white tracking-tight capitalize">
                {user.verification_status}
              </p>
              <p
                className={`text-xs mt-1 ${isVerified ? 'text-emerald-400/60' : 'text-amber-400/60'}`}
              >
                {isVerified ? '✓ Fully verified' : '⏳ Pending verification'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Curve */}
        {/* <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path d="M0 40V20C360 0 1080 0 1440 20V40H0Z" fill="#FDFCFB" />
          </svg>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Recommended Properties */}
        <RecommendedProperties />

        {/* Recently Viewed Properties */}
        <RecentlyViewedProperties />

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-navy-deep mb-1">Quick Actions</h2>
          <p className="text-sm text-gray-400 mb-6">Manage your investment journey</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/search"
              className="group flex items-center gap-4 p-5 rounded-xl border border-gray-100 hover:border-gold-royal/30 hover:bg-gold-royal/[0.03] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-navy-deep/5 group-hover:bg-navy-deep/10 flex items-center justify-center transition-colors">
                <Building2 className="h-5 w-5 text-navy-deep" />
              </div>
              <div>
                <p className="font-bold text-navy-deep text-sm">Browse All Properties</p>
                <p className="text-xs text-gray-400 mt-0.5">Explore investment opportunities</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-gold-royal transition-colors group-hover:translate-x-1 duration-300" />
            </Link>

            <Link
              href="/contact"
              className="group flex items-center gap-4 p-5 rounded-xl border border-gray-100 hover:border-gold-royal/30 hover:bg-gold-royal/[0.03] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-navy-deep/5 group-hover:bg-navy-deep/10 flex items-center justify-center transition-colors">
                <svg
                  className="h-5 w-5 text-navy-deep"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold text-navy-deep text-sm">Contact Us</p>
                <p className="text-xs text-gray-400 mt-0.5">Get investment advisory</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-gold-royal transition-colors group-hover:translate-x-1 duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
