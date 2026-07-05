'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { UploadCloud, X, AlertCircle, CheckCircle2, Loader2, Play } from 'lucide-react'
import { formatFileSize } from '@/lib/media/config'
import { useUploadStore } from '@/lib/upload/store'
import { UploadSessionManager } from '@/lib/upload/UploadSessionManager'
import type { MediaLibraryHook } from './hooks/useMediaLibrary'

interface UploadZoneProps {
  library: MediaLibraryHook
}

export function UploadZone({ library }: UploadZoneProps) {
  const { state, files } = useUploadStore()
  const { setUploadDialogOpen, fetchMedia, uploadDialogOpen } = library
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = React.useState(false)

  // Auto-close dialog when session is destroyed
  useEffect(() => {
    if (state === 'Destroyed' || state === 'Idle') {
      setUploadDialogOpen(false)
      // When closed, also trigger fetch to show new files in MediaLibrary
      fetchMedia()
    } else {
      setUploadDialogOpen(true)
    }
  }, [state, setUploadDialogOpen, fetchMedia])

  // Drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      UploadSessionManager.addFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      UploadSessionManager.addFiles(Array.from(e.target.files))
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleClose = () => {
    UploadSessionManager.destroy()
  }

  // If UI dialog shouldn't be open, return null
  if (!uploadDialogOpen && (state === 'Idle' || state === 'Destroyed')) return null

  // Extract counts for status display
  const totalFiles = files.length
  const pendingCount = files.filter((i) => i.status === 'pending').length
  const completedCount = files.filter(f => f.status === 'success').length
  const hasItems = files.length > 0
  const isUploading = state === 'Uploading' || state === 'Cancelling'

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 transition-opacity"
      onClick={() => {
        if (!isUploading && state !== 'Success') handleClose()
      }}
    >
      <div 
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Upload Media {state !== 'Idle' && state !== 'SelectingFiles' && `- ${state}`}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
              dragActive 
                ? 'border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800' 
                : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${dragActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}`} />
            <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
              Drag & drop files here
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              or click to browse from your computer
            </p>
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              Select Files
            </button>
          </div>

          {/* Queue */}
          {hasItems && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Upload Queue ({files.length})
                </h3>
              </div>

              <div className="space-y-3">
                {files.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
                  >
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {item.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
                      {item.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />}
                      {item.status === 'uploading' && (
                        <Loader2 className="w-5 h-5 text-zinc-900 dark:text-zinc-100 animate-spin" />
                      )}
                      {item.status === 'cancelled' && <AlertCircle className="w-5 h-5 text-orange-500 dark:text-orange-400" />}
                      {item.status === 'pending' && <UploadCloud className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {item.file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{formatFileSize(item.file.size)}</span>
                        <span>•</span>
                        {item.status === 'error' ? (
                          <span className="text-red-600 dark:text-red-400 truncate">{item.error}</span>
                        ) : item.status === 'success' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Complete</span>
                        ) : item.status === 'uploading' ? (
                          <span>{item.progress}%</span>
                        ) : (
                          <span className="capitalize">{item.status}</span>
                        )}
                      </div>
                      
                      {/* Progress bar */}
                      {(item.status === 'uploading' || item.status === 'pending' || item.status === 'cancelled') && (
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              item.status === 'cancelled' 
                                ? 'bg-orange-400 dark:bg-orange-500' 
                                : 'bg-zinc-900 dark:bg-zinc-100'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-2">
                      {item.status === 'error' && !isUploading && (
                        <button
                          type="button"
                          onClick={() => UploadSessionManager.retry(item.id)}
                          className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Retry"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {(item.status === 'pending' || item.status === 'error' || item.status === 'success') && !isUploading && (
                        <button
                          type="button"
                          onClick={() => UploadSessionManager.removeFile(item.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {hasItems && (
          <div className="p-5 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-2xl flex justify-end gap-3">
            {isUploading && (
               <button
                type="button"
                onClick={() => UploadSessionManager.cancel()}
                className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 px-6 py-2.5 rounded-lg font-semibold shadow-xs transition-colors"
               >
                 Cancel
               </button>
            )}
            
            {(state === 'Success' || state === 'PartialSuccess') && (
               <button
                type="button"
                onClick={() => UploadSessionManager.destroy()}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-xs transition-colors"
               >
                 Done ({completedCount} of {totalFiles})
               </button>
            )}

            {!isUploading && state !== 'Success' && (
              <button
                type="button"
                onClick={() => UploadSessionManager.upload()}
                disabled={pendingCount === 0}
                className="bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-50 dark:text-zinc-900 px-6 py-2.5 rounded-lg font-semibold shadow-xs transition-all flex items-center gap-2"
              >
                Upload {pendingCount} Files
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
