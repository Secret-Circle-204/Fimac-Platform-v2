'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CircleDollarSign, Coins, Maximize, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricingStepProps {
  askingPrice: string
  currency: string
  propertySize: string
  onAskingPriceChange: (val: string) => void
  onCurrencyChange: (val: string) => void
  onPropertySizeChange: (val: string) => void
  fieldErrors?: Record<string, string>
  onClearFieldError?: (fieldId: string) => void
}

export function PricingStep({
  askingPrice,
  currency,
  propertySize,
  onAskingPriceChange,
  onCurrencyChange,
  onPropertySizeChange,
  fieldErrors,
  onClearFieldError,
}: PricingStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b pb-3 border-slate-100">
        <h3 className="text-xl font-bold text-navy-deep">Pricing & Area Dimensions</h3>
        <p className="text-sm text-slate-500 mt-1">
          Provide information about the price and area dimensions of the property.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Asking Price */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="asking_price" className="text-sm font-bold text-slate-700 flex items-center">
              Asking Price <span className="text-red-500 ml-1 font-bold">*</span>
            </Label>
            {fieldErrors?.asking_price && (
              <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Required
              </span>
            )}
          </div>
          <div className="relative">
            <CircleDollarSign className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10 transition-colors", fieldErrors?.asking_price ? "text-red-500" : "text-slate-500")} />
            <Input
              id="asking_price"
              name="asking_price"
              type="number"
              value={askingPrice}
              onChange={(e) => {
                const val = e.target.value
                if (val !== '' && Number(val) < 0) return
                onAskingPriceChange(val)
                if (onClearFieldError) onClearFieldError('asking_price')
              }}
              onWheel={(e) => e.currentTarget.blur()}
              required
              className={cn(
                "h-14 rounded-2xl transition-all text-base font-semibold text-navy-deep pl-12 pr-4 shadow-xs",
                fieldErrors?.asking_price
                  ? "border-2 border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-400/30"
                  : "border border-blue-200/80 hover:border-blue-400 focus:border-blue-900 bg-slate-50/40 hover:bg-slate-50/80"
              )}
              placeholder="e.g. 5000000"
            />
          </div>
          {fieldErrors?.asking_price && (
            <p className="text-red-500 text-xs font-semibold">{fieldErrors.asking_price}</p>
          )}
        </div>

        {/* Currency select */}
        <div className="space-y-2">
          <Label htmlFor="currency" className="text-sm font-bold text-slate-700 flex items-center">
            Currency <span className="text-red-500 ml-1 font-bold">*</span>
          </Label>
          <div className="relative">
            <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none z-10" />
            <Select value={currency} onValueChange={onCurrencyChange} required>
              <SelectTrigger id="currency" className="w-full !h-14 border border-blue-200/80 hover:border-blue-400 focus:border-blue-900 rounded-2xl bg-slate-50/40 hover:bg-slate-50/80 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4 shadow-xs">
                <SelectValue placeholder="EGP" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                <SelectItem value="EGP" className="text-sm font-medium py-3 rounded-xl">EGP (E£)</SelectItem>
                <SelectItem value="USD" className="text-sm font-medium py-3 rounded-xl">USD ($)</SelectItem>
                <SelectItem value="EUR" className="text-sm font-medium py-3 rounded-xl">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Property Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="property_size" className="text-sm font-bold text-slate-700 flex items-center">
              Size (Sq M) <span className="text-red-500 ml-1 font-bold">*</span>
            </Label>
            {fieldErrors?.property_size && (
              <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Required
              </span>
            )}
          </div>
          <div className="relative">
            <Maximize className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10 transition-colors", fieldErrors?.property_size ? "text-red-500" : "text-slate-500")} />
            <Input
              id="property_size"
              name="property_size"
              type="number"
              value={propertySize}
              onChange={(e) => {
                const val = e.target.value
                if (val !== '' && Number(val) < 0) return
                onPropertySizeChange(val)
                if (onClearFieldError) onClearFieldError('property_size')
              }}
              onWheel={(e) => e.currentTarget.blur()}
              required
              className={cn(
                "h-14 rounded-2xl transition-all text-base font-semibold text-navy-deep pl-12 pr-4 shadow-xs",
                fieldErrors?.property_size
                  ? "border-2 border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-400/30"
                  : "border border-blue-200/80 hover:border-blue-400 focus:border-blue-900 bg-slate-50/40 hover:bg-slate-50/80"
              )}
              placeholder="e.g. 450"
            />
          </div>
          {fieldErrors?.property_size && (
            <p className="text-red-500 text-xs font-semibold">{fieldErrors.property_size}</p>
          )}
        </div>
      </div>
    </div>
  )
}
