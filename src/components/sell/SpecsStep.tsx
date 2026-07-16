'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SpecFieldDefinition } from '@/collections/Properties/specs-registry'
import * as Icons from 'lucide-react'

interface FeatureOption {
  label: string
  value: number | string
  slug: string
  visibleInCategories?: string[]
  visibleInPropertyTypes?: Array<number | string>
  featureGroup?: string
}

interface CustomSpec {
  label: string
  icon?: string
  valueType: 'text' | 'number' | 'date' | 'boolean' | 'url'
  value: string
}

interface SpecsStepProps {
  activeSpecs: SpecFieldDefinition[]
  description: string
  specValues: Record<string, unknown>
  featureOptions: FeatureOption[]
  selectedFeatures: Array<number | string>
  onSelectedFeaturesChange: (val: Array<number | string>) => void
  customFeatures: string[]
  onCustomFeaturesChange: (val: string[]) => void
  onDescriptionChange: (val: string) => void
  onSpecValueChange: (path: string, val: unknown) => void
  selectedCategory: string
  selectedPropertyTypeId: string
  customSpecs: CustomSpec[]
  onCustomSpecsChange: (val: CustomSpec[]) => void
}

function getSpecIcon(iconKey: string) {
  switch (iconKey) {
    case 'bed':
      return Icons.Bed
    case 'bath':
      return Icons.Bath
    case 'layers':
      return Icons.Layers
    case 'calendar':
      return Icons.Calendar
    case 'flame':
      return Icons.Flame
    case 'pool':
      return Icons.Waves
    case 'trees':
      return Icons.Trees
    case 'car':
      return Icons.Car
    case 'warehouse':
      return Icons.Warehouse
    case 'wifi':
      return Icons.Wifi
    case 'shield':
      return Icons.Shield
    case 'coffee':
      return Icons.Coffee
    case 'zap':
      return Icons.Zap
    case 'store':
      return Icons.Store
    case 'activity':
      return Icons.Activity
    case 'utensils':
      return Icons.Utensils
    case 'building':
      return Icons.Building
    case 'compass':
      return Icons.Compass
    case 'tent':
      return Icons.Tent
    case 'map':
      return Icons.Map
    case 'grid':
      return Icons.Grid
    case 'droplet':
      return Icons.Droplet
    case 'arrow-up-down':
      return Icons.ArrowUpDown
    case 'percent':
      return Icons.Percent
    case 'file-text':
      return Icons.FileText
    case 'gauge':
      return Icons.Gauge
    case 'door-closed':
      return Icons.DoorClosed
    case 'thermometer':
      return Icons.Thermometer
    case 'star':
      return Icons.Star
    case 'flag':
      return Icons.Flag
    default:
      return Icons.HelpCircle
  }
}

export function SpecsStep({
  activeSpecs,
  description,
  specValues,
  featureOptions,
  selectedFeatures,
  onSelectedFeaturesChange,
  customFeatures,
  onCustomFeaturesChange,
  onDescriptionChange,
  onSpecValueChange,
  selectedCategory,
  selectedPropertyTypeId,
  customSpecs,
  onCustomSpecsChange,
}: SpecsStepProps) {
  const [customInput, setCustomInput] = useState('')

  // Custom Specifications form states
  const [customSpecLabel, setCustomSpecLabel] = useState('')
  const [customSpecValue, setCustomSpecValue] = useState('')
  const [customSpecErr, setCustomSpecErr] = useState('')

  const handleAddCustomSpec = () => {
    const label = customSpecLabel.trim()
    const val = customSpecValue.trim()

    if (!label || !val) {
      setCustomSpecErr('Please enter both a label and a value.')
      return
    }

    const newSpec: CustomSpec = {
      label,
      valueType: 'text',
      value: val,
    }

    onCustomSpecsChange([...customSpecs, newSpec])
    setCustomSpecLabel('')
    setCustomSpecValue('')
    setCustomSpecErr('')
  }

  const handleRemoveCustomSpec = (index: number) => {
    onCustomSpecsChange(customSpecs.filter((_, i) => i !== index))
  }

  // 1. Predefined list of common features to display to the seller (avoids cluttering the form)
  const COMMON_FEATURE_SLUGS = [
    'air-conditioning',
    'swimming-pool',
    'infinity-pool',
    'private-garden',
    'landscaped-garden',
    'balcony',
    'terrace',
    '247-security',
    'gated-community',
    'security-cameras',
    'smart-access',
    'underground-parking',
    'private-garage',
    'high-speed-internet',
    'fiber-optic-connectivity',
    'backup-generator',
    'solar-panels',
    'fitness-center',
    'spa',
    'city-view',
    'sea-view',
  ]

  // 2. Dynamic filtering of features based on selected category, property type, and common slugs
  const filteredFeatures = featureOptions.filter((f) => {
    // Keep only common features
    if (!COMMON_FEATURE_SLUGS.includes(f.slug)) {
      return false
    }
    // Check category restriction
    if (f.visibleInCategories && f.visibleInCategories.length > 0) {
      if (!f.visibleInCategories.includes(selectedCategory)) {
        return false
      }
    }
    // Check property type restriction
    if (f.visibleInPropertyTypes && f.visibleInPropertyTypes.length > 0) {
      const typeIdNum = Number(selectedPropertyTypeId)
      if (!f.visibleInPropertyTypes.includes(typeIdNum)) {
        return false
      }
    }
    return true
  })

  const handleAddCustomFeature = () => {
    const trimmed = customInput.trim()
    if (trimmed && !customFeatures.includes(trimmed)) {
      onCustomFeaturesChange([...customFeatures, trimmed])
      setCustomInput('')
    }
  }

  const handleRemoveCustomFeature = (index: number) => {
    onCustomFeaturesChange(customFeatures.filter((_, i) => i !== index))
  }

  const handleToggleFeature = (featureId: number | string) => {
    const numericId =
      typeof featureId === 'string' && !isNaN(Number(featureId)) ? Number(featureId) : featureId
    if (selectedFeatures.includes(numericId)) {
      onSelectedFeaturesChange(selectedFeatures.filter((id) => id !== numericId))
    } else {
      onSelectedFeaturesChange([...selectedFeatures, numericId])
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b pb-3 border-slate-100">
        <h3 className="text-xl font-bold text-navy-deep">Specifications & Description</h3>
        <p className="text-xs text-slate-400 mt-1">
          Provide a detailed description of the asset and enter specific property metrics.
        </p>
      </div>

      {/* Property Description */}
      <div className="space-y-2">
        <Label
          htmlFor="property_description"
          className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center"
        >
          Description <span className="text-red-500 ml-1 font-bold">*</span>
        </Label>
        <div className="relative">
          <Icons.FileText className="absolute left-4 top-4 text-slate-400 w-5 h-5 pointer-events-none" />
          <Textarea
            id="property_description"
            name="property_description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            required
            rows={6}
            className="border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all text-base font-medium text-navy-deep pl-12 pr-4 pt-4 placeholder:text-slate-400"
            placeholder="Describe your property including key features, current condition, and any relevant details..."
          />
        </div>
      </div>

      {/* Dynamic Specifications */}
      {activeSpecs.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <h4 className="text-sm font-bold uppercase tracking-wider text-navy-deep mb-4">
            Property Specifications
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeSpecs.map((spec) => {
              const inputId = `spec_${spec.path.replace(/\./g, '_')}`
              const rawValue = specValues[spec.path]
              const IconComponent = getSpecIcon(spec.iconKey)

              if (spec.type === 'checkbox') {
                const checked = typeof rawValue === 'boolean' ? rawValue : !!rawValue
                return (
                  <div
                    key={spec.path}
                    className="flex items-center space-x-3 py-4 px-5 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all"
                  >
                    {IconComponent && <IconComponent className="text-slate-400 w-5 h-5 mr-2" />}
                    <input
                      type="checkbox"
                      id={inputId}
                      checked={checked}
                      onChange={(e) => onSpecValueChange(spec.path, e.target.checked)}
                      className="h-5 w-5 rounded border-slate-200 text-blue-900 focus:ring-blue-900 cursor-pointer"
                    />
                    <Label
                      htmlFor={inputId}
                      className="cursor-pointer text-sm font-semibold text-navy-deep ml-2 select-none"
                    >
                      {spec.label.en}
                    </Label>
                  </div>
                )
              }

              return (
                <div key={spec.path} className="space-y-2">
                  <Label
                    htmlFor={inputId}
                    className="text-xs font-bold uppercase tracking-wider text-slate-400"
                  >
                    {spec.label.en}
                    {spec.unit ? ` (${spec.unit})` : ''}
                  </Label>
                  <div className="relative">
                    {IconComponent && (
                      <IconComponent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
                    )}
                    {spec.type === 'select' ? (
                      <Select
                        value={
                          typeof rawValue === 'string' || typeof rawValue === 'number'
                            ? String(rawValue)
                            : ''
                        }
                        onValueChange={(val) => onSpecValueChange(spec.path, val)}
                      >
                        <SelectTrigger
                          id={inputId}
                          className="w-full !h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4"
                        >
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                          {spec.selectOptions?.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="text-sm font-medium py-3 rounded-xl"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={inputId}
                        value={
                          typeof rawValue === 'string' || typeof rawValue === 'number'
                            ? rawValue
                            : ''
                        }
                        onChange={(e) => {
                          const val = e.target.value
                          if (spec.type === 'number' && val !== '' && Number(val) < 0) return
                          onSpecValueChange(
                            spec.path,
                            spec.type === 'number' ? (val ? Number(val) : '') : val,
                          )
                        }}
                        onWheel={(e) => e.currentTarget.blur()}
                        type={spec.type === 'number' ? 'number' : 'text'}
                        className="h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep pl-12 pr-4"
                        placeholder={`Enter ${spec.label.en.toLowerCase()}...`}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Custom Specifications Section */}
      <div className="space-y-6 pt-6 border-t border-slate-100 animate-fadeIn">
        <div className="space-y-1">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Custom Specifications
          </Label>
          <p className="text-xs text-slate-400">
            Add any other unique specifications for your property (e.g. Ceiling Height, Security
            Rating).
          </p>
        </div>

        {/* Custom Specifications Form */}
        <div className="p-6 bg-slate-50/30 rounded-3xl border border-slate-100/80 space-y-4 transition-all duration-300 hover:bg-slate-50/50">
          {customSpecErr && <div className="text-red-500 text-xs font-bold">{customSpecErr}</div>}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Label Input */}
            <div className="space-y-2 md:col-span-5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Label *
              </Label>
              <Input
                value={customSpecLabel}
                onChange={(e) => setCustomSpecLabel(e.target.value)}
                placeholder="e.g. Ceiling Height"
                className="h-12 border-slate-200 focus:border-blue-900 rounded-xl bg-white text-sm font-semibold text-navy-deep px-4 w-full"
              />
            </div>

            {/* Value Input + Add Button Flexed together */}
            <div className="space-y-2 md:col-span-7">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Value *
              </Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    value={customSpecValue}
                    onChange={(e) => setCustomSpecValue(e.target.value)}
                    type="text"
                    placeholder="e.g. 4.2m, 3-Phase, Yes, Panoramic..."
                    className="h-12 border-slate-200 focus:border-blue-900 rounded-xl bg-white text-sm font-semibold text-navy-deep px-4 w-full"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddCustomSpec}
                  className="h-12 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl px-5 transition-all text-xs flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Icons.Plus className="w-4 h-4" />
                  Add Spec
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Specifications List */}
        {customSpecs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {customSpecs.map((spec, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm relative group animate-fadeIn"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    {spec.label}
                  </span>
                  <span className="text-sm font-bold text-navy-deep mt-1">{spec.value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomSpec(index)}
                  className="text-slate-400 hover:text-red-500 transition-colors font-bold text-sm p-1.5 rounded-lg hover:bg-red-50"
                >
                  <Icons.Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Features */}
      <div className="space-y-6 pt-6 border-t border-slate-100">
        <div className="space-y-1">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Property Features
          </Label>
          <p className="text-xs text-slate-400">
            Select from the popular features below or type new ones to add them to your request.
          </p>
        </div>

        {/* Filtered Features */}
        {filteredFeatures.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {filteredFeatures.map((feat) => {
              const numericId =
                typeof feat.value === 'string' && !isNaN(Number(feat.value))
                  ? Number(feat.value)
                  : feat.value
              const isSelected = selectedFeatures.includes(numericId)
              return (
                <button
                  key={feat.value}
                  type="button"
                  onClick={() => handleToggleFeature(feat.value)}
                  className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 border ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-md shadow-blue-900/10 scale-95'
                      : 'bg-white text-navy-deep border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {feat.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Custom Features Input */}
        <div className="space-y-3">
          <Label
            htmlFor="custom_feature_input"
            className="text-xs font-bold uppercase tracking-wider text-slate-400"
          >
            Add Custom Features
          </Label>
          <div className="flex gap-3">
            <Input
              id="custom_feature_input"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCustomFeature()
                }
              }}
              placeholder="e.g. Private Elevator, Wine Cellar, Sea View..."
              className="h-14 border-slate-200 focus:border-blue-900 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-base font-semibold text-navy-deep px-6"
            />
            <Button
              type="button"
              onClick={handleAddCustomFeature}
              className="bg-navy-deep hover:bg-navy-deep/90 text-white font-bold h-14 rounded-2xl px-6"
            >
              Add
            </Button>
          </div>

          {/* Custom Features List */}
          {customFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {customFeatures.map((feat, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 bg-slate-100 text-navy-deep text-sm font-semibold px-4 py-2 rounded-full border border-slate-200"
                >
                  {feat}
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomFeature(index)}
                    className="text-slate-400 hover:text-red-500 transition-colors font-bold text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
