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
import { CircleDollarSign, Coins, Maximize } from 'lucide-react'

interface PricingStepProps {
  askingPrice: string
  currency: string
  propertySize: string
  onAskingPriceChange: (val: string) => void
  onCurrencyChange: (val: string) => void
  onPropertySizeChange: (val: string) => void
}

export function PricingStep({
  askingPrice,
  currency,
  propertySize,
  onAskingPriceChange,
  onCurrencyChange,
  onPropertySizeChange,
}: PricingStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b pb-3 border-slate-100">
        <h3 className="text-xl font-bold text-navy-deep">Pricing & Area Dimensions</h3>
        <p className="text-xs text-slate-400 mt-1">
          Provide information about the price and area dimensions of the property.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Asking Price */}
        <div className="space-y-2">
          <Label htmlFor="asking_price" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            Asking Price <span className="text-red-500 ml-1 font-bold">*</span>
          </Label>
          <div className="relative">
            <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
            <Input
              id="asking_price"
              name="asking_price"
              type="number"
              value={askingPrice}
              onChange={(e) => onAskingPriceChange(e.target.value)}
              required
              className="h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4"
              placeholder="e.g. 5000000"
            />
          </div>
        </div>

        {/* Currency select */}
        <div className="space-y-2">
          <Label htmlFor="currency" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            Currency <span className="text-red-500 ml-1 font-bold">*</span>
          </Label>
          <div className="relative">
            <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
            <Select value={currency} onValueChange={onCurrencyChange} required>
              <SelectTrigger id="currency" className="w-full !h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4">
                <SelectValue placeholder="USD" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                <SelectItem value="USD" className="text-sm font-medium py-3 rounded-xl">USD ($)</SelectItem>
                <SelectItem value="EGP" className="text-sm font-medium py-3 rounded-xl">EGP (E£)</SelectItem>
                <SelectItem value="EUR" className="text-sm font-medium py-3 rounded-xl">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Property Size */}
        <div className="space-y-2">
          <Label htmlFor="property_size" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            Size (Sq M) <span className="text-red-500 ml-1 font-bold">*</span>
          </Label>
          <div className="relative">
            <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
            <Input
              id="property_size"
              name="property_size"
              type="number"
              value={propertySize}
              onChange={(e) => onPropertySizeChange(e.target.value)}
              required
              className="h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4"
              placeholder="e.g. 450"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
