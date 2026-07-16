'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Send, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { StepProgressBar } from '@/components/sell/StepProgressBar'
import { ClassificationStep } from '@/components/sell/ClassificationStep'
import { PricingStep } from '@/components/sell/PricingStep'
import { LocationStep } from '@/components/sell/LocationStep'
import { SpecsStep } from '@/components/sell/SpecsStep'
import { ReviewStep } from '@/components/sell/ReviewStep'
import { ALL_SPEC_FIELDS, PROFILES, PROFILE_MAP } from '@/collections/Properties/specs-registry'

interface PropertyTypeOption {
  label: string
  value: number
  slug: string
  specificationProfile: string
  categorySlug: string
}

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

interface SellFormProps {
  categoryOptions?: Array<{ label: string; value: string }>
  propertyTypeOptions?: PropertyTypeOption[]
  featureOptions?: FeatureOption[]
  currentUser?: {
    full_name: string
    email: string
    phone: string
  } | null
}

function inflateNestedObject(flatObj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(flatObj)) {
    const parts = key.split('.')
    let current = result
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (i === parts.length - 1) {
        current[part] = value
      } else {
        if (!current[part] || typeof current[part] !== 'object' || current[part] === null) {
          current[part] = {}
        }
        current = current[part] as Record<string, unknown>
      }
    }
  }
  return result
}

export function SellForm({
  categoryOptions = [],
  currentUser: _currentUser = null,
}: SellFormProps) {
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<PropertyTypeOption[]>([])
  const [featureOptions, setFeatureOptions] = useState<FeatureOption[]>([])

  const formRef = useRef<HTMLDivElement>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const submitLock = useRef(false)

  // Step 1: Classification State
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState<string>('')
  const [propertyTitle, setPropertyTitle] = useState<string>('')
  const [constructionStatus, setConstructionStatus] = useState<string>('ready')

  // Step 2: Pricing & Size State
  const [askingPrice, setAskingPrice] = useState<string>('')
  const [currency, setCurrency] = useState<string>('USD')
  const [propertySize, setPropertySize] = useState<string>('')

  // Step 3: Location State
  const [coords, setCoords] = useState({ lat: 27.9158, lng: 34.3300 })
  const [addressDetails, setAddressDetails] = useState({
    address: '',
    city: '',
    state: '',
    country: 'Egypt',
    zip: '',
  })

  // Step 4: Description & Dynamic Specs State
  const [description, setDescription] = useState<string>('')
  const [specValues, setSpecValues] = useState<Record<string, unknown>>({})
  const [selectedFeatures, setSelectedFeatures] = useState<Array<number | string>>([])
  const [customFeatures, setCustomFeatures] = useState<string[]>([])
  const [customSpecs, setCustomSpecs] = useState<CustomSpec[]>([])

  // Lifted custom features/specs input states for auto-commit on step navigation
  const [customInput, setCustomInput] = useState('')
  const [customSpecLabel, setCustomSpecLabel] = useState('')
  const [customSpecValue, setCustomSpecValue] = useState('')

  // Fetch property types when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setPropertyTypeOptions([])
      return
    }

    const fetchPropertyTypes = async () => {
      try {
        console.log(`🌐 [SellForm Client] Fetching property types for category: "${selectedCategory}"...`)
        const res = await fetch(`/api/sell/property-types?category=${selectedCategory}`)
        if (res.ok) {
          const data = await res.json()
          console.log(`✅ [SellForm Client] Loaded ${data.length} property types successfully.`)
          setPropertyTypeOptions(data)
        }
      } catch (err) {
        console.error('Failed to fetch property types:', err)
      }
    }

    fetchPropertyTypes()
  }, [selectedCategory])

  // Fetch features when category or property type changes
  useEffect(() => {
    if (!selectedCategory || !selectedPropertyTypeId) {
      setFeatureOptions([])
      return
    }

    const fetchFeatures = async () => {
      try {
        console.log(`🌐 [SellForm Client] Fetching features for category: "${selectedCategory}", propertyTypeId: "${selectedPropertyTypeId}"...`)
        const res = await fetch(
          `/api/sell/features?category=${selectedCategory}&propertyTypeId=${selectedPropertyTypeId}`
        )
        if (res.ok) {
          const data = await res.json()
          console.log(`✅ [SellForm Client] Loaded ${data.length} features successfully.`)
          setFeatureOptions(data)
        }
      } catch (err) {
        console.error('Failed to fetch features:', err)
      }
    }

    fetchFeatures()
  }, [selectedCategory, selectedPropertyTypeId])

  const selectedCategoryName = categoryOptions.find((o) => o.value === selectedCategory)?.label || ''
  const selectedPropertyTypeName = propertyTypeOptions.find(
    (opt) => opt.value.toString() === selectedPropertyTypeId
  )?.label || ''

  const selectedType = propertyTypeOptions.find(
    (opt) => opt.value.toString() === selectedPropertyTypeId
  )

  const activeSpecs = (() => {
    if (!selectedType) return []
    const category = selectedType.categorySlug as 'residential' | 'commercial' | 'hospitality' | 'land'
    
    // Resolve profile using static mapping to ensure absolute consistency with Payload schema
    const profile = PROFILE_MAP[selectedType.slug] || 'none'

    // 1. Common specs for the category
    const commonSpecs = Object.values(ALL_SPEC_FIELDS).filter(
      (spec) => spec.category === category && spec.subGroup === 'common'
    )

    // 2. Profile-specific specs
    const profilePaths = PROFILES[profile] || []
    const profileSpecs = Object.values(ALL_SPEC_FIELDS).filter(
      (spec) => profilePaths.includes(spec.path)
    )

    // Deduplicate by path
    const uniqueSpecsMap = new Map<string, typeof ALL_SPEC_FIELDS[keyof typeof ALL_SPEC_FIELDS]>()
    commonSpecs.forEach((spec) => uniqueSpecsMap.set(spec.path, spec))
    profileSpecs.forEach((spec) => uniqueSpecsMap.set(spec.path, spec))

    const specs = Array.from(uniqueSpecsMap.values())
    return specs
  })()

  useEffect(() => {
    console.log("🔍 [SellForm Client State]:", {
      selectedPropertyTypeId,
      selectedType,
      activeSpecs: activeSpecs.map((s) => s.path),
    })
  }, [selectedPropertyTypeId, selectedType, activeSpecs])

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val)
    setSelectedPropertyTypeId('')
    setSpecValues({})
    setSelectedFeatures([])
    setCustomFeatures([])
    setCustomSpecs([])
  }

  const handlePropertyTypeChange = (val: string) => {
    setSelectedPropertyTypeId(val)
    setSpecValues({})
    setSelectedFeatures([])
    setCustomFeatures([])
    setCustomSpecs([])
  }

  const handleLocationChange = (data: {
    lat: number
    lng: number
    address: string
    city: string
    state: string
    country: string
    zip: string
  }) => {
    setCoords({ lat: data.lat, lng: data.lng })
    setAddressDetails({
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      zip: data.zip,
    })
  }

  const handleSpecValueChange = (path: string, val: unknown) => {
    setSpecValues((prev) => ({
      ...prev,
      [path]: val,
    }))
  }

  const stepsList = [
    { label: 'Classification', desc: 'Asset Type & Title' },
    { label: 'Pricing', desc: 'Price & Size' },
    { label: 'Location', desc: 'Coordinates & Address' },
    { label: 'Specifications', desc: 'Details & Description' },
    { label: 'Review', desc: 'Review & Submit' },
  ]

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!selectedCategory && !!selectedPropertyTypeId && !!propertyTitle.trim() && !!constructionStatus
      case 2:
        return (
          !!askingPrice &&
          !isNaN(Number(askingPrice)) &&
          Number(askingPrice) > 0 &&
          !!propertySize &&
          !isNaN(Number(propertySize)) &&
          Number(propertySize) > 0
        )
      case 3:
        return (
          !!(addressDetails.address || '').trim() &&
          !!(addressDetails.city || '').trim() &&
          !!(addressDetails.state || '').trim() &&
          !!(addressDetails.country || '').trim()
        )
      case 4:
        return !!description.trim()
      default:
        return true
    }
  }

  const scrollToFormTop = () => {
    if (formRef.current) {
      const elementPosition = formRef.current.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - 120 // Offset for sticky navbar
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      if (currentStep === 4) {
        // Auto-commit any typed custom feature that wasn't added explicitly
        const trimmedFeature = customInput.trim()
        const updatedFeatures = [...customFeatures]
        if (trimmedFeature && !updatedFeatures.includes(trimmedFeature)) {
          updatedFeatures.push(trimmedFeature)
          setCustomFeatures(updatedFeatures)
          setCustomInput('')
        }

        // Auto-commit any typed custom spec that wasn't added explicitly
        const trimmedLabel = customSpecLabel.trim()
        const trimmedVal = customSpecValue.trim()
        const updatedSpecs = [...customSpecs]
        if (trimmedLabel && trimmedVal) {
          updatedSpecs.push({
            label: trimmedLabel,
            valueType: 'text',
            value: trimmedVal,
          })
          setCustomSpecs(updatedSpecs)
          setCustomSpecLabel('')
          setCustomSpecValue('')
        }
      }
      setCurrentStep((prev) => Math.min(prev + 1, 5))
      setError('')
      setTimeout(scrollToFormTop, 50)
    } else {
      setError('Please fill in all required fields marked with * correctly before proceeding.')
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setError('')
    setTimeout(scrollToFormTop, 50)
  }

  async function handleSubmit() {
    if (submitLock.current) return
    submitLock.current = true
    setIsSubmitting(true)
    setError('')

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`

    // Construct final specifications object by filtering active keys
    const finalSpecsFlat: Record<string, unknown> = {}
    activeSpecs.forEach((spec) => {
      const val = specValues[spec.path]
      
      // If not specified, or if negative selection ("No", false), do NOT send it!
      if (
        val === undefined ||
        val === null ||
        val === '' ||
        val === false ||
        val === 'false' ||
        val === 'No' ||
        val === 'no'
      ) {
        return
      }

      if (spec.type === 'checkbox') {
        finalSpecsFlat[spec.path] = true
      } else if (spec.type === 'number') {
        finalSpecsFlat[spec.path] = Number(val)
      } else {
        finalSpecsFlat[spec.path] = val
      }
    })

    const inflatedSpecs = inflateNestedObject(finalSpecsFlat)

    const data = {
      property_type: selectedPropertyTypeId,
      category: selectedCategory,
      property_title: propertyTitle,
      property_description: description,
      property_location: addressDetails.address,
      city: addressDetails.city,
      state: addressDetails.state,
      country: addressDetails.country,
      asking_price: askingPrice,
      currency: currency,
      property_size: propertySize,
      constructionStatus: constructionStatus,
      latitude: coords.lat,
      longitude: coords.lng,
      google_maps_url: googleMapsUrl,
      zip: addressDetails.zip,
      full_address: `${addressDetails.state} ${addressDetails.zip}`.trim(),
      features: selectedFeatures,
      customFeatures: customFeatures,
      customSpecifications: customSpecs,
      ...inflatedSpecs,
    }

    try {
      const res = await fetch('/api/seller-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Something went wrong')
        submitLock.current = false
        return
      }

      setIsSuccess(true)
    } catch (_err) {
      setError('Failed to submit request. Please try again.')
      submitLock.current = false
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="container w-full mx-auto max-w-7xl border-none shadow-2xl-soft rounded-[40px] overflow-hidden">
        <CardContent className="p-12 text-center bg-white">
          <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6 animate-bounce" />
          <h2 className="text-3xl font-bold mb-3 text-navy-deep">Request Submitted Successfully!</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
            Thank you for your interest in listing your property with FIMAC Group. Our team will
            review your request and contact you within 24-48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => {
                setIsSuccess(false)
                setError('')
                setCurrentStep(1)
                submitLock.current = false
                setSelectedCategory('')
                setSelectedPropertyTypeId('')
                setPropertyTitle('')
                setAskingPrice('')
                setPropertySize('')
                setDescription('')
                setSpecValues({})
                setCoords({ lat: 27.9158, lng: 34.3300 })
                setAddressDetails({
                  address: '',
                  city: '',
                  state: '',
                  country: 'Egypt',
                  zip: '',
                })
              }}
              className="w-full sm:w-auto px-8 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition-all duration-300"
            >
              Sell Another Property
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto px-8 py-3 border-2 border-blue-900 text-blue-900 hover:bg-blue-50 font-bold rounded-xl transition-all duration-300"
            >
              <Link href="/dashboard/seller">Go to Your Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ProgressBar Card */}
      <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
        <StepProgressBar currentStep={currentStep} steps={stepsList} />
      </Card>

      {/* Main Wizard Form Card */}
      <Card ref={formRef} className="border-none shadow-2xl-soft rounded-[40px] overflow-hidden bg-white">
        <div className="bg-navy-deep p-8 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Property Listing Request</h2>
          <p className="text-white/70 text-xs md:text-sm leading-relaxed max-w-2xl">
            Submit your asset to our team for appraisal. Please complete all fields step-by-step
            to meet our premium international standards.
          </p>
        </div>
        <CardContent className="p-8 md:p-12 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm transition-all duration-300">
              {error}
            </div>
          )}

          {/* Wizard step views */}
          {currentStep === 1 && (
            <ClassificationStep
              categoryOptions={categoryOptions}
              propertyTypeOptions={propertyTypeOptions}
              selectedCategory={selectedCategory}
              selectedPropertyTypeId={selectedPropertyTypeId}
              propertyTitle={propertyTitle}
              constructionStatus={constructionStatus}
              onCategoryChange={handleCategoryChange}
              onPropertyTypeChange={handlePropertyTypeChange}
              onTitleChange={setPropertyTitle}
              onConstructionStatusChange={setConstructionStatus}
            />
          )}

          {currentStep === 2 && (
            <PricingStep
              askingPrice={askingPrice}
              currency={currency}
              propertySize={propertySize}
              onAskingPriceChange={setAskingPrice}
              onCurrencyChange={setCurrency}
              onPropertySizeChange={setPropertySize}
            />
          )}

          {currentStep === 3 && (
            <LocationStep
              coords={coords}
              addressDetails={addressDetails}
              onLocationChange={handleLocationChange}
              onAddressDetailsChange={setAddressDetails}
            />
          )}

          {currentStep === 4 && (
            <SpecsStep
              activeSpecs={activeSpecs}
              description={description}
              specValues={specValues}
              featureOptions={featureOptions}
              selectedFeatures={selectedFeatures}
              onSelectedFeaturesChange={setSelectedFeatures}
              customFeatures={customFeatures}
              onCustomFeaturesChange={setCustomFeatures}
              onDescriptionChange={setDescription}
              onSpecValueChange={handleSpecValueChange}
              selectedCategory={selectedCategory}
              selectedPropertyTypeId={selectedPropertyTypeId}
              customSpecs={customSpecs}
              onCustomSpecsChange={setCustomSpecs}
              customInput={customInput}
              onCustomInputChange={setCustomInput}
              customSpecLabel={customSpecLabel}
              onCustomSpecLabelChange={setCustomSpecLabel}
              customSpecValue={customSpecValue}
              onCustomSpecValueChange={setCustomSpecValue}
            />
          )}

          {currentStep === 5 && (
            <ReviewStep
              selectedCategoryName={selectedCategoryName}
              selectedPropertyTypeName={selectedPropertyTypeName}
              propertyTitle={propertyTitle}
              constructionStatus={constructionStatus}
              askingPrice={askingPrice}
              currency={currency}
              propertySize={propertySize}
              addressDetails={addressDetails}
              coords={coords}
              description={description}
              activeSpecs={activeSpecs}
              specValues={specValues}
              featureOptions={featureOptions}
              selectedFeatures={selectedFeatures}
              customFeatures={customFeatures}
              customSpecs={customSpecs}
            />
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 h-12 rounded-xl transition-all font-bold px-6 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold h-12 rounded-xl px-8 transition-all duration-300 shadow-md shadow-blue-900/10 flex items-center gap-2"
              >
                Next Step
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold h-12 rounded-xl px-10 transition-all duration-300 shadow-lg shadow-blue-900/20 flex items-center gap-2"
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
