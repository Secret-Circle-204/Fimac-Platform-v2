'use client'

import { useProperty } from '@/components/providers/property'
import Image from 'next/image'
import { RichText } from '@/components/shared/rich-text'

export const PropertyProjectSection = () => {
  const property = useProperty()

  const hasProject = property.hasProject
  const projectImage = property.projectImage
  const projectDescription = property.projectDescription

  if (!hasProject || !projectImage || !projectDescription) {
    return null
  }

  const imageUrl = projectImage.url

  return (
    <div className="w-full flex flex-col gap-6 mb-8">
      {/* Premium Hero Image with identical dimensions as PropertyGallery */}
      <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] md:h-[60vh] overflow-hidden rounded-[32px] shadow-2xl-soft border border-navy-deep/5 bg-slate-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Project Showcase Image"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 animate-pulse" />
        )}
        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Badge Label inside Project Image */}
        <div className="absolute top-6 left-6 z-10">
          <span className="bg-navy-deep/80 backdrop-blur-xl text-white px-4 py-2 rounded-2xl font-bold border border-white/10 shadow-lg text-xs uppercase tracking-widest">
            Project Showcase
          </span>
        </div>
      </div>

      {/* Description Below Project Image */}
      <div className="w-full bg-white rounded-[32px] p-6 md:p-8 shadow-sm-soft border border-gray-100">
        <div className="text-gray-700 leading-relaxed">
          <RichText content={projectDescription} />
        </div>
      </div>
    </div>
  )
}
