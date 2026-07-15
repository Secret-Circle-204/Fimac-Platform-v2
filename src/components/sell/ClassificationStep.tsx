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
import { Layers, Building2, Type, Hammer } from 'lucide-react'

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
}: ClassificationStepProps) {
  const filteredPropertyTypeOptions = propertyTypeOptions.filter(
    (opt) => opt.categorySlug === selectedCategory
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b pb-3 border-slate-100">
        <h3 className="text-xl font-bold text-navy-deep">Asset Classification & Title</h3>
        <p className="text-xs text-slate-400 mt-1">
          Specify the category and type of property, and give it an attractive title.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category select */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            Category <span className="text-red-500 ml-1 font-bold">*</span>
          </Label>
          <div className="relative">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
            <Select value={selectedCategory} onValueChange={onCategoryChange} required>
              <SelectTrigger id="category" className="w-full !h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4">
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
        </div>

        {/* Property Type select */}
        <div className="space-y-2">
          <Label htmlFor="property_type" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            Property Type <span className="text-red-500 ml-1 font-bold">*</span>
          </Label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
            <Select
              name="property_type"
              value={selectedPropertyTypeId}
              onValueChange={onPropertyTypeChange}
              disabled={!selectedCategory}
              required
            >
              <SelectTrigger id="property_type" className="w-full !h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4">
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
        </div>

        {/* Property Title */}
        <div className="space-y-2">
          <Label htmlFor="property_title" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            Property Title <span className="text-red-500 ml-1 font-bold">*</span>
          </Label>
          <div className="relative">
            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
            <Input
              id="property_title"
              name="property_title"
              value={propertyTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              required
              className="h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4"
              placeholder="e.g. Luxurious Penthouse Sharm El Sheikh"
            />
          </div>
        </div>

        {/* Construction Status */}
        <div className="space-y-2">
          <Label htmlFor="constructionStatus" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            Construction Status <span className="text-red-500 ml-1 font-bold">*</span>
          </Label>
          <div className="relative">
            <Hammer className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
            <Select value={constructionStatus} onValueChange={onConstructionStatusChange} required>
              <SelectTrigger id="constructionStatus" className="w-full !h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4">
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
        </div>
      </div>
    </div>
  )
}
