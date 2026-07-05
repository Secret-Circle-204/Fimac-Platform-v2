'use client'

import React, { useState } from 'react'
import { Folder, FolderOpen, Plus, ChevronRight, ChevronDown, Inbox } from 'lucide-react'
import type { FolderTreeNode } from './types'
import type { MediaLibraryHook } from './hooks/useMediaLibrary'

interface FolderSidebarProps {
  library: MediaLibraryHook
}

export function FolderSidebar({ library }: FolderSidebarProps) {
  const { folderTree, currentFolderId, navigateToFolder, createFolder, foldersLoading } = library

  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return
    try {
      const parentId = typeof currentFolderId === 'number' ? currentFolderId : null
      await createFolder(newFolderName.trim(), parentId)
      setNewFolderName('')
      setIsCreating(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create folder')
    }
  }

  return (
    <div className="ml-sidebar flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm w-[280px] shrink-0 transition-colors duration-200">
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
          Folders
        </h2>
        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="bg-transparent border-none p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all active:scale-95"
          title="New Folder"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* All Media (Root) */}
        <button
          type="button"
          onClick={() => navigateToFolder(null)}
          className={`bg-transparent border-none outline-none w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group mb-1 ${
            currentFolderId === null
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold shadow-xs'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-50'
          }`}
        >
          {currentFolderId === null ? (
            <FolderOpen className="w-5 h-5" />
          ) : (
            <Folder className="w-5 h-5 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-500 dark:group-hover:text-zinc-400" />
          )}
          <span>All Media</span>
        </button>

        {/* Unfiled Media */}
        <button
          type="button"
          onClick={() => navigateToFolder('unfiled')}
          className={`bg-transparent border-none outline-none w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
            currentFolderId === 'unfiled'
              ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-bold shadow-xs'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-50'
          }`}
        >
          <Inbox className={`w-5 h-5 ${currentFolderId === 'unfiled' ? '' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-500 dark:group-hover:text-zinc-400'}`} />
          <span>Unfiled</span>
        </button>

        {/* Tree */}
        <div className="mt-4 space-y-1 relative">
          {foldersLoading && folderTree.length === 0 ? (
            <div className="px-3 py-2 text-sm text-zinc-400 dark:text-zinc-500 animate-pulse">
              Loading folders...
            </div>
          ) : (
            folderTree.map((node) => (
              <FolderNode
                key={node.id}
                node={node}
                currentFolderId={currentFolderId}
                onSelect={navigateToFolder}
                depth={0}
              />
            ))
          )}
        </div>

        {/* Inline Create Form */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="mt-3 px-1">
            <input
              type="text"
              autoFocus
              placeholder="New folder name..."
              className="w-full text-sm px-4 py-2.5 bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/50 focus:border-blue-500 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => {
                if (!newFolderName.trim()) setIsCreating(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsCreating(false)
              }}
            />
          </form>
        )}
      </div>
    </div>
  )
}

function FolderNode({
  node,
  currentFolderId,
  onSelect,
  depth,
}: {
  node: FolderTreeNode
  currentFolderId: number | null | 'unfiled'
  onSelect: (id: number | null | 'unfiled') => void
  depth: number
}) {
  const [expanded, setExpanded] = useState(false)
  const isSelected = currentFolderId === node.id
  const hasChildren = node.children.length > 0

  // Auto-expand if a child is selected
  React.useEffect(() => {
    const isChildSelected = (n: FolderTreeNode): boolean => {
      if (n.id === currentFolderId) return true
      return n.children.some(isChildSelected)
    }
    if (currentFolderId !== 'unfiled' && isChildSelected(node)) {
      setExpanded(true)
    }
  }, [node, currentFolderId])

  return (
    <div className="relative">
      {/* Structure Line Connector */}
      {depth > 0 && (
        <div className="absolute -left-3 top-[1.125rem] w-3 h-px bg-zinc-200 dark:bg-zinc-700" />
      )}

      <div
        className={`group flex items-center rounded-xl transition-all duration-200 border ${
          isSelected
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/30 font-bold shadow-xs'
            : 'bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-50 border-transparent'
        }`}
      >
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`bg-transparent border-none p-2 shrink-0 transition-transform outline-none ${!hasChildren ? 'invisible' : ''} ${isSelected ? 'text-blue-500 hover:text-blue-700' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className={`bg-transparent border-none outline-none flex-1 flex items-center gap-2.5 py-2 pr-3 text-sm text-left truncate ${
            isSelected ? 'font-bold' : 'font-medium'
          }`}
        >
          {isSelected || expanded ? (
            <FolderOpen
              className={`w-4 h-4 shrink-0 ${isSelected ? '' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-500'}`}
            />
          ) : (
            <Folder
              className={`w-4 h-4 shrink-0 ${isSelected ? '' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-500'}`}
            />
          )}
          <span className="truncate">{node.name}</span>
        </button>
      </div>

      {expanded && hasChildren && (
        <div className="ml-4 pl-3 border-l-2 border-zinc-200 dark:border-zinc-700 mt-1 space-y-1 relative">
          {node.children.map((child) => (
            <FolderNode
              key={child.id}
              node={child}
              currentFolderId={currentFolderId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
