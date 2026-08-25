'use client'

import React, { useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
  MAX_PHOTOS_PER_SELLER_REQUEST,
  formatFileSize,
} from '@/lib/media/config'

export interface SelectedPhoto {
  id: string
  file: File
  previewUrl: string
}

interface PhotosStepProps {
  photos: SelectedPhoto[]
  onPhotosChange: (photos: SelectedPhoto[]) => void
  error?: string
  onErrorClear?: () => void
}

export function PhotosStep({
  photos,
  onPhotosChange,
  error,
  onErrorClear,
}: PhotosStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    if (onErrorClear) onErrorClear()

    console.log(`📸 [PhotosStep] File selection event triggered. Received ${files.length} raw file(s).`)

    const newPhotos: SelectedPhoto[] = [...photos]
    const remainingSlots = MAX_PHOTOS_PER_SELLER_REQUEST - newPhotos.length

    if (remainingSlots <= 0) {
      console.warn(`⚠️ [PhotosStep] Upload limit reached (${MAX_PHOTOS_PER_SELLER_REQUEST} max). Rejecting new selections.`)
      alert(`You can only upload a maximum of ${MAX_PHOTOS_PER_SELLER_REQUEST} photos.`)
      return
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    for (const file of filesToProcess) {
      // Validate File Size
      if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
        console.warn(`⚠️ [PhotosStep] File "${file.name}" rejected: size (${formatFileSize(file.size)}) exceeds limit (${formatFileSize(MAX_IMAGE_FILE_SIZE_BYTES)}).`)
        alert(
          `"${file.name}" exceeds the ${formatFileSize(MAX_IMAGE_FILE_SIZE_BYTES)} limit.`,
        )
        continue
      }

      // Validate MIME type
      const allowedTypes: readonly string[] = ALLOWED_IMAGE_MIME_TYPES
      if (
        file.type &&
        !allowedTypes.includes(
          file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
        )
      ) {
        console.warn(`⚠️ [PhotosStep] File "${file.name}" rejected: format "${file.type}" not allowed.`)
        alert(`File format "${file.type}" is not supported.`)
        continue
      }

      const previewUrl = URL.createObjectURL(file)
      console.log(`✅ [PhotosStep] Photo accepted & preview generated: "${file.name}" (${formatFileSize(file.size)}, type: ${file.type || 'unknown'})`)
      newPhotos.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl,
      })
    }

    console.log(`📊 [PhotosStep] Total photos now selected: ${newPhotos.length}/${MAX_PHOTOS_PER_SELLER_REQUEST}`)
    onPhotosChange(newPhotos)

    // Reset file input value so selecting the same file again triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = (id: string) => {
    const photoToRemove = photos.find((p) => p.id === id)
    if (photoToRemove) {
      console.log(`🗑️ [PhotosStep] Removing photo: "${photoToRemove.file.name}"`)
      URL.revokeObjectURL(photoToRemove.previewUrl)
    }
    const updated = photos.filter((p) => p.id !== id)
    console.log(`📊 [PhotosStep] Total photos remaining: ${updated.length}/${MAX_PHOTOS_PER_SELLER_REQUEST}`)
    onPhotosChange(updated)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold text-navy-deep">Property Photos</h3>
        <p className="text-sm text-gray-500 mt-1">
          Upload up to {MAX_PHOTOS_PER_SELLER_REQUEST} photos of your property.
          High-quality photos increase buyer interest and accelerate review.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-blue-700 bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-blue-900 group-hover:scale-110 group-hover:bg-blue-900 group-hover:text-white transition-all duration-200 mb-3">
          <Upload className="w-6 h-6" />
        </div>

        <p className="font-bold text-slate-800 text-base">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-slate-500 mt-1">
          JPEG, PNG, WebP, AVIF up to {formatFileSize(MAX_IMAGE_FILE_SIZE_BYTES)}{' '}
          each (Max {MAX_PHOTOS_PER_SELLER_REQUEST} photos)
        </p>
        <p className="text-xs font-semibold text-blue-800 mt-2">
          {photos.length} of {MAX_PHOTOS_PER_SELLER_REQUEST} photos selected
        </p>
      </div>

      {/* Photos Grid Preview */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-2">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="relative group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm aspect-[4/3] flex flex-col"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt={`Selected preview ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Badge for first photo / Cover */}
              {idx === 0 && (
                <span className="absolute top-2 left-2 bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                  Cover Photo
                </span>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemovePhoto(photo.id)
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-red-600 hover:text-white text-slate-700 rounded-full flex items-center justify-center shadow-md opacity-90 group-hover:opacity-100 transition-all"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-[11px] font-medium truncate">
                  {photo.file.name}
                </p>
                <p className="text-slate-300 text-[9px]">
                  {formatFileSize(photo.file.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="text-center py-4 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-400 text-xs flex items-center justify-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span>No photos selected yet. (Photos are optional but highly recommended)</span>
        </div>
      )}
    </div>
  )
}
