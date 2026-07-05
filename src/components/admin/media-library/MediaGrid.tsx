'use client'

import React from 'react'
import Image from 'next/image'
import { FileText, Film, Music, CheckCircle2, Folder } from 'lucide-react'
import { useListDrawerContext } from '@payloadcms/ui'
import type { MediaLibraryHook } from './hooks/useMediaLibrary'

interface MediaGridProps {
  library: MediaLibraryHook
}

export function MediaGrid({ library }: MediaGridProps) {
  const { isInDrawer, onSelect } = useListDrawerContext()
  const { media, mediaLoading, selection, toggleSelect, setPreviewMedia, folders, filters, setFilters } = library

  const currentFolderId = filters.folderId

  const subFolders = React.useMemo(() => {
    if (currentFolderId === 'unfiled') return []
    return folders.filter(f => {
      const parentId = typeof f.parent === 'object' ? f.parent?.id : f.parent
      if (currentFolderId === null) return parentId === null || parentId === undefined
      return parentId === currentFolderId
    })
  }, [folders, currentFolderId])

  if (mediaLoading && media.length === 0 && subFolders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    )
  }

  if (media.length === 0 && subFolders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
        <FileText className="w-12 h-12 text-slate-300" />
        <p>This folder is empty.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Render Subfolders first */}
      {subFolders.map(folder => (
        <div 
          key={`folder-${folder.id}`}
          onClick={() => setFilters({ folderId: folder.id })}
          className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md dark:shadow-none transition-all h-40"
        >
          <Folder className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-3 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors" />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-center truncate w-full px-2" title={folder.name}>
            {folder.name}
          </span>
        </div>
      ))}

      {/* Render Media Items */}
      {media.map((item) => {
        const isSelected = selection.selectedIds.has(item.id)
        const isImage = item.mimeType?.startsWith('image/')
        const isVideo = item.mimeType?.startsWith('video/')
        const isAudio = item.mimeType?.startsWith('audio/')

        const handleClick = (e: React.MouseEvent) => {
          if (isInDrawer && onSelect) {
            onSelect({ collectionSlug: 'media', doc: item, docID: String(item.id) })
            return
          }
          if (selection.selectedIds.size > 0 || e.ctrlKey || e.metaKey) {
            toggleSelect(item.id)
          } else {
            setPreviewMedia(item)
          }
        }

        return (
          <div
            key={item.id}
            onClick={handleClick}
            className="group flex flex-col gap-2 cursor-pointer"
          >
            <div
              className={`relative aspect-square rounded-xl border overflow-hidden transition-all duration-200 ${
                isSelected
                  ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/20 dark:ring-zinc-100/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md'
              }`}
            >
            {/* Selection Indicator */}
            <div
              className={`absolute top-2 left-2 z-10 transition-opacity ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSelect(item.id)
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                  isSelected
                    ? 'bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-white/80 dark:bg-zinc-900/80 border-zinc-300 dark:border-zinc-600 text-transparent hover:border-zinc-900 dark:hover:border-zinc-100 backdrop-blur-sm'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-white dark:text-zinc-900' : ''}`} />
              </button>
            </div>

            {/* Thumbnail */}
            <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center">
              {item.healthStatus === 'missing' || item.healthStatus === 'broken' ? (
                <div className="flex flex-col items-center justify-center text-red-500 gap-1 opacity-60">
                  <FileText className="w-8 h-8" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Asset Offline</span>
                </div>
              ) : isImage && item.sizes?.thumbnail?.url ? (
                <Image
                  src={item.sizes.thumbnail.url}
                  alt={item.alt || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  onError={() => library.reportBrokenImage(item.id)}
                />
              ) : isImage && item.url ? (
                <Image
                  src={item.url}
                  alt={item.alt || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  onError={() => library.reportBrokenImage(item.id)}
                />
              ) : isVideo ? (
                <Film className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
              ) : isAudio ? (
                <Music className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
              ) : (
                <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
              )}
            </div>

            </div>
            
            {/* Title / Name */}
            <div className="px-1 max-w-full">
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate w-full" title={item.displayName || item.filename || undefined}>
                {item.displayName || item.filename}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
