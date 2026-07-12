'use client'

import { useTransition, useCallback, useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Clock, ChevronLeft, ChevronRight, Building2, MapPin, DollarSign, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { buildPropertyUrl } from '@/repository/property/generate-url'
import type { DashboardSellerRequest } from '@/repository/dashboard/seller-dashboard-repository'

interface SellerRequestsClientProps {
  initialRequests: DashboardSellerRequest[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export function SellerRequestsClient({
  initialRequests = [],
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
}: SellerRequestsClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const element = document.getElementById('requests-section')
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - 120 // 120px header clearance offset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }, [currentPage])
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const updatePage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (newPage > 1) {
        params.set('reqPage', newPage.toString())
      } else {
        params.delete('reqPage')
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [searchParams, pathname, router]
  )

  // Status configuration for badges
  const getStatusBadge = (statusVal: string) => {
    switch (statusVal) {
      case 'reviewing':
        return { label: 'Under Review', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
      case 'approved':
        return { label: 'Approved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      case 'rejected':
        return { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200' }
      case 'listed':
        return { label: 'Listed Live', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
      case 'new':
      default:
        return { label: 'New Request', bg: 'bg-blue-50 text-blue-700 border-blue-200' }
    }
  }

  // Smart page windowing generator
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      if (startPage > 2) pages.push('...')
      for (let i = startPage; i <= endPage; i++) pages.push(i)
      if (endPage < totalPages - 1) pages.push('...')

      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div id="requests-section" className="bg-white rounded-[32px] border border-gray-100 shadow-sm-soft p-6 mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-navy-deep">Submitted Listing Requests</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track the approval and auditing status of your recently submitted property listings.
          </p>
        </div>
        <span className="bg-[#0A1A3F]/5 text-navy-deep text-xs font-black px-3.5 py-1.5 rounded-xl border border-navy-deep/10">
          {totalCount} Total
        </span>
      </div>

      {initialRequests.length > 0 ? (
        <>
          {/* Desktop Table View (md and up) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold text-xs uppercase tracking-wider">
                  <th className="pb-3 pl-4">Request ref</th>
                  <th className="pb-3">Property Title</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Asking Price</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Submission Date</th>
                  <th className="pb-3 pr-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {initialRequests.map((req) => {
                  const activeStatus = getStatusBadge(req.status || 'new')
                  const formattedDate = req.createdAt
                    ? new Date(req.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'

                  const typeName =
                    req.property_type && typeof req.property_type === 'object'
                      ? req.property_type.name
                      : 'Property'

                  const publishedPropertyObj =
                    req.publishedProperty && typeof req.publishedProperty === 'object'
                      ? req.publishedProperty
                      : null

                  let propertyUrl = '#'
                  if (publishedPropertyObj) {
                    const street = publishedPropertyObj.location?.address?.street || ''
                    const city = publishedPropertyObj.location?.address?.city || ''
                    const state = publishedPropertyObj.location?.address?.state || ''
                    propertyUrl = buildPropertyUrl(publishedPropertyObj.id, { street, city, state })
                  }

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/50 transition-colors duration-150 text-sm font-medium"
                    >
                      <td className="py-4 pl-4 text-xs font-bold text-gray-400">
                        Request ref: #{req.id}
                      </td>
                      <td className="py-4 font-bold text-navy-deep max-w-[200px] truncate">
                        {req.property_title}
                      </td>
                      <td className="py-4 text-gray-600">{typeName}</td>
                      <td className="py-4 text-gray-900 font-semibold">
                        {req.asking_price?.toLocaleString()} {req.currency}
                      </td>
                      <td className="py-4 text-gray-500 max-w-[150px] truncate">
                        {req.city}, {req.country}
                      </td>
                      <td className="py-4 text-gray-500">{formattedDate}</td>
                      <td className="py-4 pr-4 text-center">
                        <div className="flex flex-col xl:flex-row items-center justify-center gap-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${activeStatus.bg}`}
                          >
                            {activeStatus.label}
                          </span>
                          {req.status === 'listed' && publishedPropertyObj && (
                            <Link
                              href={propertyUrl}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline inline-flex items-center gap-0.5"
                            >
                              View Live Listing ↗
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout (under md) */}
          <div className="block md:hidden space-y-4">
            {initialRequests.map((req) => {
              const activeStatus = getStatusBadge(req.status || 'new')
              const formattedDate = req.createdAt
                ? new Date(req.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'N/A'

              const typeName =
                req.property_type && typeof req.property_type === 'object'
                  ? req.property_type.name
                  : 'Property'

              const publishedPropertyObj =
                req.publishedProperty && typeof req.publishedProperty === 'object'
                  ? req.publishedProperty
                  : null

              let propertyUrl = '#'
              if (publishedPropertyObj) {
                const street = publishedPropertyObj.location?.address?.street || ''
                const city = publishedPropertyObj.location?.address?.city || ''
                const state = publishedPropertyObj.location?.address?.state || ''
                propertyUrl = buildPropertyUrl(publishedPropertyObj.id, { street, city, state })
              }

              return (
                <div
                  key={req.id}
                  className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-gold-royal/30 transition-all duration-300 space-y-4"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Request ref: #{req.id}
                      </span>
                      <h4 className="font-bold text-navy-deep text-base leading-snug">
                        {req.property_title}
                      </h4>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${activeStatus.bg}`}
                    >
                      {activeStatus.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-gray-100/60 pt-3">
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <Building2 className="h-3.5 w-3.5 text-navy-deep/40" />
                      <span>{typeName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-900 font-semibold justify-end">
                      <DollarSign className="h-3.5 w-3.5 text-gold-royal" />
                      <span>
                        {req.asking_price?.toLocaleString()} {req.currency}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-navy-deep/40" />
                      <span className="truncate">{req.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 justify-end">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {req.status === 'listed' && publishedPropertyObj && (
                    <div className="pt-2 border-t border-gray-100/60">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl"
                      >
                        <Link href={propertyUrl}>View Live Listing ↗</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Smart Pagination - Requests */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-6 border-t border-gray-100 mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updatePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-10 w-10 rounded-xl border border-navy-deep/5 text-navy-deep hover:bg-gold-royal hover:text-white transition-all disabled:opacity-30 active:scale-95 shadow-sm bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1 bg-navy-deep/5 p-1 rounded-xl border border-navy-deep/5">
                {getPageNumbers().map((pageNumber, idx) => {
                  if (pageNumber === '...') {
                    return (
                      <span
                        key={`ellipsis-req-${idx}`}
                        className="h-8 min-w-8 flex items-center justify-center text-xs font-bold text-navy-deep/40 px-1"
                      >
                        ...
                      </span>
                    )
                  }

                  const isActive = pageNumber === currentPage

                  return (
                    <button
                      key={`page-req-${pageNumber}`}
                      onClick={() => updatePage(pageNumber as number)}
                      className={`h-8 min-w-8 px-2 rounded-lg text-xs font-black transition-all duration-300 ${
                        isActive
                          ? 'bg-gold-royal text-white shadow-gold-sm'
                          : 'text-navy-deep/60 hover:bg-navy-deep/10 hover:text-navy-deep'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => updatePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-10 w-10 rounded-xl border border-navy-deep/5 text-navy-deep hover:bg-gold-royal hover:text-white transition-all disabled:opacity-30 active:scale-95 shadow-sm bg-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3 animate-pulse" />
          <h3 className="text-base font-bold text-navy-deep mb-1">No requests submitted yet</h3>
          <p className="text-xs text-gray-500 mb-4">
            When you submit a new property to list, it will appear here for tracking.
          </p>
          <Button asChild size="sm" className="bg-navy-deep hover:bg-navy-deep/90 text-white rounded-xl">
            <Link href="/sell">Submit First Request</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
