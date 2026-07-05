'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { X, ExternalLink, Calendar, HardDrive, Tag, Type, Maximize, FileText } from 'lucide-react'
import { formatFileSize } from '@/lib/media/config'
import type { MediaLibraryHook } from './hooks/useMediaLibrary'

interface MediaPreviewPanelProps {
  library: MediaLibraryHook
}

export function MediaPreviewPanel({ library }: MediaPreviewPanelProps) {
  const { previewMedia, setPreviewMedia, fetchMedia } = library
  const [saving, setSaving] = useState(false)
  
  // Local state for edits
  const [displayName, setDisplayName] = useState(previewMedia?.displayName || '')
  const [alt, setAlt] = useState(previewMedia?.alt || '')
  const [caption, setCaption] = useState(previewMedia?.caption || '')
  
  // Update local state when preview media changes
  React.useEffect(() => {
    setDisplayName(previewMedia?.displayName || '')
    setAlt(previewMedia?.alt || '')
    setCaption(previewMedia?.caption || '')
  }, [previewMedia])

  if (!previewMedia) return null

  const isImage = previewMedia.mimeType?.startsWith('image/')

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/media/${previewMedia.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, alt, caption }),
      })
      if (!res.ok) throw new Error('Failed to update media')
      await fetchMedia()
      
      // Close the panel on successful save
      setPreviewMedia(null)
    } catch (_err) {
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Click-outside backdrop */}
      <div 
        className="absolute inset-0 z-40 bg-black/5 dark:bg-black/20 backdrop-blur-[1px] transition-opacity"
        onClick={() => setPreviewMedia(null)}
      />

      {/* Slide-out Panel */}
      <div className="absolute inset-y-0 right-0 w-[90vw] sm:w-[400px] md:w-[450px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl flex flex-col z-50 transform transition-transform duration-300 animate-in slide-in-from-right-8">
        <div className="flex items-center justify-between p-5 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-transparent">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight truncate max-w-[220px] sm:max-w-[280px]" title={previewMedia.displayName || previewMedia.filename || undefined}>
              {previewMedia.displayName || previewMedia.filename}
            </h3>
            <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">Attachment Details</p>
          </div>
          <button
            type="button"
            onClick={() => setPreviewMedia(null)}
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-2 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Preview Image */}
          <div className="bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl aspect-square flex items-center justify-center relative overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 shadow-inner group">
            {isImage && previewMedia.url ? (
              <Image
                src={previewMedia.url}
                alt={previewMedia.alt || ''}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 90vw, 450px"
              />
            ) : (
              <div className="text-zinc-400 dark:text-zinc-600 text-sm font-medium flex flex-col items-center gap-2">
                <FileText className="w-10 h-10 opacity-50" />
                No Preview Available
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-5 border border-zinc-200/50 dark:border-zinc-800/50 space-y-4 text-sm text-zinc-600 dark:text-zinc-400 shadow-sm">
            <p className="font-semibold text-base text-zinc-900 dark:text-zinc-100 break-all mb-2">{previewMedia.filename}</p>
            
            <div className="grid grid-cols-[20px_1fr] gap-3 items-center group">
              <Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-blue-500 transition-colors" />
              <span className="font-medium">{new Date(previewMedia.createdAt).toLocaleString()}</span>
            </div>
            
            <div className="grid grid-cols-[20px_1fr] gap-3 items-center group">
              <HardDrive className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-blue-500 transition-colors" />
              <span className="font-medium">{previewMedia.filesize ? formatFileSize(previewMedia.filesize) : 'Unknown'}</span>
            </div>
            
            {previewMedia.width && previewMedia.height && (
              <div className="grid grid-cols-[20px_1fr] gap-3 items-center group">
                <Maximize className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-blue-500 transition-colors" />
                <span className="font-medium">{previewMedia.width} × {previewMedia.height} pixels</span>
              </div>
            )}
            
            <div className="grid grid-cols-[20px_1fr] gap-3 items-center group">
              <Type className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-blue-500 transition-colors" />
              <span className="font-medium">{previewMedia.mimeType}</span>
            </div>

            {previewMedia.originalFilename && (
              <div className="grid grid-cols-[20px_1fr] gap-3 items-center group pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
                <Tag className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-blue-500 transition-colors" />
                <span className="truncate font-medium" title={previewMedia.originalFilename}>
                  Orig: {previewMedia.originalFilename}
                </span>
              </div>
            )}
          </div>

          {/* Edit Form */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Attributes</h4>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="A friendly name for this file..."
                className="w-full text-sm px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/50 focus:border-blue-500 text-zinc-900 dark:text-zinc-50 transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Alt Text</label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Describe the image..."
                className="w-full text-sm px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/50 focus:border-blue-500 text-zinc-900 dark:text-zinc-50 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                placeholder="Add a caption..."
                className="w-full text-sm px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/50 focus:border-blue-500 text-zinc-900 dark:text-zinc-50 resize-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || (displayName === (previewMedia.displayName || '') && alt === previewMedia.alt && caption === (previewMedia.caption || ''))}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none active:scale-[0.98]"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Links */}
          <div className="pt-2">
            <a
              href={previewMedia.url || ''}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors group p-3 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 hover:border-blue-200 dark:hover:border-blue-900/50"
            >
              <ExternalLink className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              Open Original File
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
