'use client'

import React from 'react'
import Image from 'next/image'
import { FileText, CheckSquare, Square, Folder } from 'lucide-react'
import { useListDrawerContext } from '@payloadcms/ui'
import { formatFileSize } from '@/lib/media/config'
import type { MediaLibraryHook } from './hooks/useMediaLibrary'

interface MediaListTableProps {
  library: MediaLibraryHook
}

export function MediaListTable({ library }: MediaListTableProps) {
  const { isInDrawer, onSelect } = useListDrawerContext()
  const { media, mediaLoading, selection, toggleSelect, selectAll, clearSelection, setPreviewMedia, folders, filters, setFilters } =
    library

  const allSelected = media.length > 0 && selection.selectedIds.size === media.length

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection()
    } else {
      selectAll()
    }
  }

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
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-sm font-semibold tracking-wide">
            <th className="p-4 w-12">
              <button type="button" onClick={handleSelectAll} className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors">
                {allSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
              </button>
            </th>
            <th className="p-4">File</th>
            <th className="p-4 hidden sm:table-cell">Alt Text</th>
            <th className="p-4 hidden md:table-cell">Type</th>
            <th className="p-4 hidden lg:table-cell">Size</th>
            <th className="p-4 hidden xl:table-cell">Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {/* Render Subfolders First */}
          {subFolders.map((folder) => (
            <tr
              key={`folder-${folder.id}`}
              onClick={() => setFilters({ folderId: folder.id })}
              className="border-b border-zinc-100 dark:border-zinc-800/50 cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30 group"
            >
              <td className="p-4">
                {/* Folders cannot be selected for now */}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 transition-colors group-hover:border-zinc-300 dark:group-hover:border-zinc-600">
                    <Folder className="w-6 h-6 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-500 dark:group-hover:text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-[300px]">
                      {folder.name}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-4 hidden sm:table-cell text-sm text-zinc-500 dark:text-zinc-500">—</td>
              <td className="p-4 hidden md:table-cell text-sm text-zinc-500 dark:text-zinc-500">Folder</td>
              <td className="p-4 hidden lg:table-cell text-sm text-zinc-500 dark:text-zinc-500">—</td>
              <td className="p-4 hidden xl:table-cell text-sm text-zinc-500 dark:text-zinc-500">—</td>
            </tr>
          ))}

          {/* Render Media Items */}
          {media.map((item) => {
            const isSelected = selection.selectedIds.has(item.id)
            const isImage = item.mimeType?.startsWith('image/')
            
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
              <tr
                key={item.id}
                onClick={handleClick}
                className={`border-b border-zinc-100 dark:border-zinc-800/50 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-zinc-100/80 dark:bg-zinc-800' 
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                }`}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => toggleSelect(item.id)}
                    className={`transition-colors ${isSelected ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400'}`}
                  >
                    {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                      {isImage && item.sizes?.thumbnail?.url ? (
                        <Image
                          src={item.sizes.thumbnail.url}
                          alt={item.alt || ''}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <FileText className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-[300px]" title={item.displayName || item.filename || undefined}>
                        {item.displayName || item.filename}
                      </p>
                      {item.width && item.height && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {item.width} × {item.height}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden sm:table-cell text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">
                  {item.alt}
                </td>
                <td className="p-4 hidden md:table-cell text-sm text-zinc-600 dark:text-zinc-400">
                  {item.mimeType}
                </td>
                <td className="p-4 hidden lg:table-cell text-sm text-zinc-600 dark:text-zinc-400">
                  {item.filesize ? formatFileSize(item.filesize) : '—'}
                </td>
                <td className="p-4 hidden xl:table-cell text-sm text-zinc-600 dark:text-zinc-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
