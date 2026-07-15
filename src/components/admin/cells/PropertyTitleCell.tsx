'use client'

import React from 'react'
import type { DefaultCellComponentProps } from 'payload'
import type { Property, Media } from '@/payload-types'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import Image from 'next/image'

export const PropertyTitleCell: React.FC<DefaultCellComponentProps> = (props) => {
  const rowData = props.rowData as Property
  if (!rowData) return null

  const title = rowData.title || 'Untitled Property'
  const listingStatus = rowData.listingStatus
  const id = rowData.id
  const city = rowData.location?.address?.city

  // Handle first photo URL
  let photoUrl = ''
  const firstPhoto = rowData.photos?.[0]
  if (firstPhoto) {
    if (typeof firstPhoto === 'object' && firstPhoto !== null) {
      photoUrl = (firstPhoto as Media).thumbnailURL || (firstPhoto as Media).url || ''
    }
  }

  // Handle listing status label
  let statusName = ''
  if (listingStatus) {
    if (typeof listingStatus === 'object' && listingStatus !== null) {
      statusName = (listingStatus as { name?: string }).name || ''
    }
  }

  return (
    <div className="flex items-center gap-3 py-1">
      {/* Thumbnail Container */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0 shadow-sm transition-transform hover:scale-105 duration-200">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={title}
            width={40}
            height={40}
            unoptimized
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.9 2.9m-18 1.5V19.5a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0017.25 4.5H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 00.75 1.72z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Details Stack */}
      <div className="flex flex-col min-w-0">
        <Link
          href={`/admin/collections/properties/${id}`}
          className="font-semibold text-slate-800 hover:text-blue-600 truncate transition-colors text-sm leading-snug"
        >
          {title}
        </Link>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {city && (
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
              <MapPin size={10} className="text-[#d4af37] flex-shrink-0" />
              {city}
            </span>
          )}
          {statusName && (
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
              {statusName}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
