'use client'

import React from 'react'
import { FolderSidebar } from './FolderSidebar'
import { BreadcrumbNav } from './BreadcrumbNav'
import { MediaGrid } from './MediaGrid'
import { MediaListTable } from './MediaListTable'
import { MediaPreviewPanel } from './MediaPreviewPanel'
import { UploadZone } from './UploadZone'
import { useMediaLibrary } from './hooks/useMediaLibrary'
import { Search, ChevronLeft, ChevronRight, Trash2, FolderOutput, CheckSquare } from 'lucide-react'
import { useListDrawerContext } from '@payloadcms/ui'
import './media-library.css'

export default function MediaLibraryView(_props: unknown) {
  const { isInDrawer, onSelect, onBulkSelect } = useListDrawerContext()
  const library = useMediaLibrary()
  const {
    viewMode,
    filters,
    setFilters,
    selection,
    clearSelection,
    deleteMediaBulk,
    pagination,
    setPage,
    setLimit,
  } = library

  const [isMoveDialogOpen, setIsMoveDialogOpen] = React.useState(false)
  const [targetFolderId, setTargetFolderId] = React.useState<number | null>(null)
  const [folderSearch, setFolderSearch] = React.useState('')

  const hasSelection = selection.selectedIds.size > 0

  const handleMoveSelected = async () => {
    if (targetFolderId === undefined) return
    const ids = Array.from(selection.selectedIds)
    await library.moveMedia(ids, targetFolderId)
    setIsMoveDialogOpen(false)
    setFolderSearch('') // Reset search on close
  }

  // Flatten folder tree for the custom searchable list
  const flattenedFolders = React.useMemo(() => {
    const result: { id: number | null; name: string; fullPath: string; depth: number }[] = []
    
    const flatten = (nodes: import('./types').FolderTreeNode[], currentPath = '', depth = 0) => {
      nodes.forEach((node) => {
        const path = currentPath ? `${currentPath} / ${node.name}` : node.name
        result.push({
          id: node.id,
          name: node.name,
          fullPath: path,
          depth,
        })
        if (node.children?.length > 0) {
          flatten(node.children, path, depth + 1)
        }
      })
    }
    
    result.push({ id: null, name: 'Root (No Folder)', fullPath: 'Root (No Folder)', depth: 0 })
    flatten(library.folderTree)
    return result
  }, [library.folderTree])

  const filteredFolders = React.useMemo(() => {
    if (!folderSearch.trim()) return flattenedFolders
    const term = folderSearch.toLowerCase()
    return flattenedFolders.filter(f => f.fullPath.toLowerCase().includes(term))
  }, [flattenedFolders, folderSearch])

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selection.selectedIds.size} selected items? This cannot be undone.`)) {
      return
    }
    
    // Bulk delete to avoid overwhelming the server with sequential list refreshes
    const ids = Array.from(selection.selectedIds)
    await deleteMediaBulk(ids)
    clearSelection()
  }

  return (
    <div className={`media-library-root flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-200 ${
      isInDrawer ? 'h-[calc(100vh-180px)] p-0 sm:p-2' : 'h-[calc(100vh-64px)] p-4 sm:p-6'
    }`}>
      {/* 
        This is a Payload Custom View that replaces the default list view.
        We use a gap-based layout with rounded premium cards.
      */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <div 
          className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
            library.isSidebarOpen ? 'w-[280px] opacity-100 mr-4 sm:mr-6' : 'w-0 opacity-0 mr-0'
          }`}
        >
          <FolderSidebar library={library} />
        </div>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden transition-colors duration-200">
          
          <BreadcrumbNav library={library} />

          {/* Toolbar (Search & Selection Actions) */}
          <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 gap-4">
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search media..."
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all shadow-sm"
                />
              </div>

              {/* Selection Actions */}
              {hasSelection && (
                <div className="flex items-center gap-2.5 sm:pl-5 sm:border-l border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-left-4">
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    {selection.selectedIds.size} selected
                  </span>
                  
                  <button
                    onClick={clearSelection}
                    className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 px-3 py-1.5 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 border-none outline-none"
                  >
                    Clear
                  </button>
                  
                  {isInDrawer ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (onBulkSelect) {
                          const map = new Map<number | string, boolean>()
                          Array.from(selection.selectedIds).forEach(id => map.set(id, true))
                          onBulkSelect(map)
                        } else if (onSelect) {
                          // Fallback if bulk select not provided (very rare)
                          Array.from(selection.selectedIds).forEach(id => {
                            const doc = library.media.find(m => m.id === id)
                            if (doc) onSelect({ collectionSlug: 'media', doc, docID: String(id) })
                          })
                        }
                      }}
                      className="flex items-center gap-2 text-sm font-bold text-white px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md active:scale-95 border-none outline-none ml-1"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Insert {selection.selectedIds.size} Items
                    </button>
                  ) : (
                    <>
                      <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />
                      
                      <button
                    type="button"
                    onClick={() => {
                      setTargetFolderId(filters.folderId === 'unfiled' ? null : filters.folderId)
                      setIsMoveDialogOpen(true)
                    }}
                    className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 px-4 py-2 bg-white dark:bg-zinc-900 border-none outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    <FolderOutput className="w-4 h-4" />
                    Move
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-4 py-2 bg-red-50 dark:bg-red-950/20 border-none outline-none hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {pagination.totalDocs > 0 && (
              <div className="flex items-center gap-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">Per page:</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm cursor-pointer"
                  >
                    {[12, 24, 48, 96].map((limit) => (
                      <option key={limit} value={limit}>
                        {limit}
                      </option>
                    ))}
                  </select>
                </div>
                <span>
                  Page {pagination.page} of {Math.max(1, pagination.totalPages)}
                </span>
                <div className="flex gap-1.5 bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all text-zinc-500 dark:text-zinc-400"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all text-zinc-500 dark:text-zinc-400"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Media Content */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'grid' ? (
              <MediaGrid library={library} />
            ) : (
              <MediaListTable library={library} />
            )}
          </div>
        </div>

        {/* Slide-out Preview Panel */}
        <MediaPreviewPanel library={library} />
      </div>

      {/* Upload Modal overlay */}
      <UploadZone library={library} />

      {/* Move Dialog overlay */}
      {isMoveDialogOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMoveDialogOpen(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.2)] dark:shadow-[0_0_40px_rgba(0,0,0,0.4)] border border-zinc-200 dark:border-white/10 p-8 sm:p-10 w-full max-w-3xl mx-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
          >
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8 tracking-tight">
              Move {selection.selectedIds.size} {selection.selectedIds.size === 1 ? 'item' : 'items'}
            </h3>
            <div className="mb-10">
              
              {/* Search Input */}
              <div className="flex items-center bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-5 py-4 mb-6 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all shadow-inner">
                <Search className="w-6 h-6 text-zinc-400 dark:text-zinc-500 mr-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search target folder..."
                  value={folderSearch}
                  onChange={(e) => setFolderSearch(e.target.value)}
                  className="w-full bg-transparent border-none outline-none ring-0 text-lg font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
                />
              </div>

              {/* Custom Options List */}
              <div className="max-h-[500px] overflow-y-auto rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-2 shadow-sm custom-scrollbar">
                {filteredFolders.length === 0 ? (
                  <div className="text-center text-zinc-500 dark:text-zinc-400 text-lg font-medium py-12">
                    No folders found matching &quot;{folderSearch}&quot;
                  </div>
                ) : (
                  filteredFolders.map(folder => {
                    const isSelected = targetFolderId === folder.id
                    
                    // If searching, show full path. Otherwise show visual hierarchy
                    const displayLabel = folderSearch.trim() 
                      ? folder.fullPath 
                      : folder.id === null 
                        ? folder.name
                        : `${'\u00A0\u00A0\u00A0\u00A0'.repeat(folder.depth)}${folder.depth > 0 ? '↳ ' : ''}${folder.name}`

                    return (
                      <button
                        key={folder.id ?? 'root'}
                        type="button"
                        onClick={() => setTargetFolderId(folder.id)}
                        className={`w-full text-left px-5 py-4 text-lg font-medium rounded-lg transition-all flex items-center border-none outline-none ring-0 mb-1 last:mb-0 ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                            : 'bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate">{displayLabel}</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsMoveDialogOpen(false)}
                className="px-8 py-3.5 text-lg font-bold border-none outline-none ring-0 bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMoveSelected}
                className="px-10 py-3.5 text-lg font-bold border-none outline-none ring-0 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
