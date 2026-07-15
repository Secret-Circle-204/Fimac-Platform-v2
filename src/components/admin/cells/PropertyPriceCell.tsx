'use client'

import React from 'react'
import type { DefaultCellComponentProps } from 'payload'
import type { Property } from '@/payload-types'

export const PropertyPriceCell: React.FC<DefaultCellComponentProps> = (props) => {
  const rowData = props.rowData as Property
  if (!rowData) return null

  const price = rowData.price
  const currency = rowData.currency || 'EGP'

  if (price === undefined || price === null) {
    return <span className="text-slate-400 font-medium">-</span>
  }

  // Format price beautifully
  const formattedPrice = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(price)

  return (
    <div className="font-semibold text-slate-900 flex items-center gap-1">
      <span>{formattedPrice}</span>
      <span className="text-xs text-slate-400 font-medium">{currency}</span>
    </div>
  )
}
