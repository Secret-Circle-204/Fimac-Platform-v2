'use client'

import React from 'react'
import { ChevronRight, Home, Upload, Grid, List, PanelLeftClose, PanelLeft } from 'lucide-react'
import type { MediaLibraryHook } from './hooks/useMediaLibrary'

interface BreadcrumbNavProps {
  library: MediaLibraryHook
}

export function BreadcrumbNav({ library }: BreadcrumbNavProps) {
  const { breadcrumbs, navigateToFolder, viewMode, setViewMode, isSidebarOpen, setIsSidebarOpen } = library

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800/50 min-h-[72px]">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 overflow-x-auto no-scrollbar max-w-[60%] sm:max-w-none">
        
        {/* Sidebar Toggle */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-transparent border-none outline-none p-1.5 mr-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95 shrink-0"
          title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeft className="w-5 h-5" />
          )}
        </button>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1
          return (
            <React.Fragment key={crumb.id ?? 'root'}>
              <button
                type="button"
                onClick={() => navigateToFolder(crumb.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap border-none outline-none ${
                  isLast 
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-bold shadow-sm' 
                    : 'bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {crumb.id === null && <Home className="w-4 h-4" />}
                <span>{crumb.name}</span>
              </button>
              {!isLast && <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />}
            </React.Fragment>
          )
        })}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:flex bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl p-1 border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all duration-200 border-none outline-none ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
            title="Grid View"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all duration-200 border-none outline-none ${
              viewMode === 'list'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => {
            import('@/lib/upload/UploadSessionManager').then(({ UploadSessionManager }) => {
              UploadSessionManager.start({
                collection: 'media',
                destination: typeof library.currentFolderId === 'number' ? library.currentFolderId : null,
              })
            })
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
        </button>
      </div>
    </div>
  )
}
