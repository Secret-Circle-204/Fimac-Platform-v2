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
import { Layers, Building2, Type, Hammer, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertyTypeOption {
  label: string
  value: number
  slug: string
  specificationProfile: string
  categorySlug: string
}

interface ClassificationStepProps {
  categoryOptions: Array<{ label: string; value: string }>
  propertyTypeOptions: PropertyTypeOption[]
  selectedCategory: string
  selectedPropertyTypeId: string
  propertyTitle: string
  constructionStatus: string
  onCategoryChange: (val: string) => void
  onPropertyTypeChange: (val: string) => void
  onTitleChange: (val: string) => void
  onConstructionStatusChange: (val: string) => void
  fieldErrors?: Record<string, string>
  onClearFieldError?: (fieldId: string) => void
}

export function ClassificationStep({
  categoryOptions,
  propertyTypeOptions,
  selectedCategory,
  selectedPropertyTypeId,
  propertyTitle,
  constructionStatus,
  onCategoryChange,
  onPropertyTypeChange,
  onTitleChange,
  onConstructionStatusChange,
  fieldErrors,
  onClearFieldError,
}: ClassificationStepProps) {
  const filteredPropertyTypeOptions = propertyTypeOptions.filter(
    (opt) => opt.categorySlug === selectedCategory
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b pb-3 border-slate-100">
        <h3 className="text-xl font-bold text-navy-deep">Asset Classification & Title</h3>
        <p className="text-sm text-slate-500 mt-1">
          Specify the category and type of property, and give it an attractive title.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category select */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="category" className="text-sm font-bold text-slate-700 flex items-center">
              Category <span className="text-red-500 ml-1 font-bold">*</span>
            </Label>
            {fieldErrors?.category && (
              <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Required
              </span>
            )}
          </div>
          <div className="relative">
            <Layers className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10 transition-colors", fieldErrors?.category ? "text-red-500" : "text-slate-500")} />
            <Select
              value={selectedCategory}
              onValueChange={(val) => {
                onCategoryChange(val)
                if (onClearFieldError) onClearFieldError('category')
              }}
              required
            >
              <SelectTrigger
                id="category"
                className={cn(
                  "w-full !h-14 rounded-2xl transition-all text-base font-semibold text-navy-deep pl-12 pr-4 shadow-xs",
                  fieldErrors?.category
                    ? "border-2 border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-400/30"
                    : "border border-blue-200/80 hover:border-blue-400 focus:border-blue-900 bg-slate-50/40 hover:bg-slate-50/80"
                )}
              >
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-sm font-medium py-3 rounded-xl">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {fieldErrors?.category && (
            <p className="text-red-500 text-xs font-semibold">{fieldErrors.category}</p>
          )}
        </div>

        {/* Property Type select */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="property_type" className="text-sm font-bold text-slate-700 flex items-center">
              Property Type <span className="text-red-500 ml-1 font-bold">*</span>
            </Label>
            {fieldErrors?.property_type && (
              <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Required
              </span>
            )}
          </div>
          <div className="relative">
            <Building2 className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10 transition-colors", fieldErrors?.property_type ? "text-red-500" : "text-slate-500")} />
            <Select
              name="property_type"
              value={selectedPropertyTypeId}
              onValueChange={(val) => {
                onPropertyTypeChange(val)
                if (onClearFieldError) onClearFieldError('property_type')
              }}
              disabled={!selectedCategory}
              required
            >
              <SelectTrigger
                id="property_type"
                className={cn(
                  "w-full !h-14 rounded-2xl transition-all text-base font-semibold text-navy-deep pl-12 pr-4 shadow-xs",
                  fieldErrors?.property_type
                    ? "border-2 border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-400/30"
                    : "border border-blue-200/80 hover:border-blue-400 focus:border-blue-900 bg-slate-50/40 hover:bg-slate-50/80"
                )}
              >
                <SelectValue placeholder={selectedCategory ? 'Select Type' : 'Select Category First'} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                {filteredPropertyTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()} className="text-sm font-medium py-3 rounded-xl">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {fieldErrors?.property_type && (
            <p className="text-red-500 text-xs font-semibold">{fieldErrors.property_type}</p>
          )}
        </div>

        {/* Property Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="property_title" className="text-sm font-bold text-slate-700 flex items-center">
              Property Title <span className="text-red-500 ml-1 font-bold">*</span>
            </Label>
            {fieldErrors?.property_title && (
              <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Required
              </span>
            )}
          </div>
          <div className="relative">
            <Type className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10 transition-colors", fieldErrors?.property_title ? "text-red-500" : "text-slate-500")} />
            <Input
              id="property_title"
              name="property_title"
              value={propertyTitle}
              onChange={(e) => {
                onTitleChange(e.target.value)
                if (onClearFieldError) onClearFieldError('property_title')
              }}
              required
              className={cn(
                "h-14 rounded-2xl transition-all text-base font-semibold text-navy-deep pl-12 pr-4 shadow-xs",
                fieldErrors?.property_title
                  ? "border-2 border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-400/30"
                  : "border border-blue-200/80 hover:border-blue-400 focus:border-blue-900 bg-slate-50/40 hover:bg-slate-50/80"
              )}
              placeholder="e.g. Luxurious Penthouse Sharm El Sheikh"
            />
          </div>
          {fieldErrors?.property_title && (
            <p className="text-red-500 text-xs font-semibold">{fieldErrors.property_title}</p>
          )}
        </div>

        {/* Construction Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="constructionStatus" className="text-sm font-bold text-slate-700 flex items-center">
              Construction Status <span className="text-red-500 ml-1 font-bold">*</span>
            </Label>
            {fieldErrors?.constructionStatus && (
              <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Required
              </span>
            )}
          </div>
          <div className="relative">
            <Hammer className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10 transition-colors", fieldErrors?.constructionStatus ? "text-red-500" : "text-slate-500")} />
            <Select
              value={constructionStatus}
              onValueChange={(val) => {
                onConstructionStatusChange(val)
                if (onClearFieldError) onClearFieldError('constructionStatus')
              }}
              required
            >
              <SelectTrigger
                id="constructionStatus"
                className={cn(
                  "w-full !h-14 rounded-2xl transition-all text-base font-semibold text-navy-deep pl-12 pr-4 shadow-xs",
                  fieldErrors?.constructionStatus
                    ? "border-2 border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-400/30"
                    : "border border-blue-200/80 hover:border-blue-400 focus:border-blue-900 bg-slate-50/40 hover:bg-slate-50/80"
                )}
              >
                <SelectValue placeholder="Ready to Move In" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                <SelectItem value="ready" className="text-sm font-medium py-3 rounded-xl">Ready to Move In</SelectItem>
                <SelectItem value="under_construction" className="text-sm font-medium py-3 rounded-xl">Under Construction</SelectItem>
                <SelectItem value="brand_new" className="text-sm font-medium py-3 rounded-xl">Brand New (First Occupancy)</SelectItem>
                <SelectItem value="off_plan" className="text-sm font-medium py-3 rounded-xl">Off-Plan</SelectItem>
                <SelectItem value="renovated" className="text-sm font-medium py-3 rounded-xl">Fully Renovated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {fieldErrors?.constructionStatus && (
            <p className="text-red-500 text-xs font-semibold">{fieldErrors.constructionStatus}</p>
          )}
        </div>
      </div>
    </div>
  )
}
