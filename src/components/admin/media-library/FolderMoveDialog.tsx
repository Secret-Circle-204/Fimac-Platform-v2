'use client'

/**
 * FolderMoveDialog — Modal dialog for moving a folder to a new parent
 *
 * Provides a tree picker where the admin can select a new parent for a folder.
 * Prevents selecting the folder itself or any of its descendants as the target.
 * Supports search for quick folder finding.
 */

import React, { useState, useMemo, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Search, Folder, FolderOpen, X, Loader2, ArrowRight, Home } from 'lucide-react'
import type { FolderTreeNode } from './types'
import type { MediaLibraryHook } from './hooks/useMediaLibrary'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FolderMoveDialogProps {
  /** The folder being moved (null = dialog closed) */
  folder: FolderTreeNode | null
  /** Library hook for performing the move */
  library: MediaLibraryHook
  /** Called when dialog closes */
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Collects all descendant IDs of a folder node (recursive) */
function collectDescendantIds(node: FolderTreeNode): Set<number> {
  const ids = new Set<number>()
  const walk = (n: FolderTreeNode) => {
    ids.add(n.id)
    for (const child of n.children) {
      walk(child)
    }
  }
  walk(node)
  return ids
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FolderMoveDialog({
  folder,
  library,
  onClose,
}: FolderMoveDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // IDs that cannot be selected (the folder itself + all descendants)
  const disabledIds = useMemo(() => {
    if (!folder) return new Set<number>()
    return collectDescendantIds(folder)
  }, [folder])

  // Flatten the tree for a searchable list, excluding disabled folders
  const flattenedFolders = useMemo(() => {
    const result: Array<{
      id: number | null
      name: string
      fullPath: string
      depth: number
      disabled: boolean
    }> = []

    // Root option (move to top level)
    result.push({
      id: null,
      name: 'Root (Top Level)',
      fullPath: 'Root (Top Level)',
      depth: 0,
      disabled: false,
    })

    const flatten = (
      nodes: FolderTreeNode[],
      currentPath = '',
      depth = 0,
    ) => {
      for (const node of nodes) {
        const path = currentPath ? `${currentPath} / ${node.name}` : node.name
        const isDisabled = disabledIds.has(node.id)
        result.push({
          id: node.id,
          name: node.name,
          fullPath: path,
          depth,
          disabled: isDisabled,
        })
        if (node.children.length > 0) {
          flatten(node.children, path, depth + 1)
        }
      }
    }

    flatten(library.folderTree)
    return result
  }, [library.folderTree, disabledIds])

  // Filter by search query
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return flattenedFolders
    const term = searchQuery.toLowerCase()
    return flattenedFolders.filter((f) =>
      f.fullPath.toLowerCase().includes(term),
    )
  }, [flattenedFolders, searchQuery])

  const handleMove = useCallback(async () => {
    if (!folder) return

    // selectedTargetId being null means "Root" which is a valid target
    // But we need to distinguish "not selected" from "selected root"
    // selectedTargetId defaults to null (root), so moving to root is always valid

    setIsMoving(true)
    setError(null)

    try {
      await library.moveFolder(folder.id, selectedTargetId)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move folder')
    } finally {
      setIsMoving(false)
    }
  }, [folder, selectedTargetId, library, onClose])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setSearchQuery('')
        setSelectedTargetId(null)
        setError(null)
        onClose()
      }
    },
    [onClose],
  )

  if (!folder) return null

  // Determine current parent for display
  const currentParentName = folder.parentId
    ? library.folders.find((f) => f.id === folder.parentId)?.name ?? 'Unknown'
    : 'Root (Top Level)'

  return (
    <Dialog.Root open={folder !== null} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200 focus:outline-none flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-xl font-bold text-zinc-900 dark:text-white">
                Move &quot;{folder.name}&quot;
              </Dialog.Title>
              <Dialog.Description className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
                Currently in: <strong className="text-zinc-700 dark:text-zinc-300">{currentParentName}</strong>
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Search */}
          <div className="flex items-center bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 mb-4 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all">
            <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none ring-0 text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
              autoFocus
            />
          </div>

          {/* Folder List */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-2 mb-4 custom-scrollbar">
            {filteredFolders.length === 0 ? (
              <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm font-medium py-8">
                No folders found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredFolders.map((target) => {
                const isSelected = selectedTargetId === target.id
                const isCurrentParent =
                  (target.id === folder.parentId) ||
                  (target.id === null && folder.parentId === null)

                return (
                  <button
                    key={target.id ?? 'root'}
                    type="button"
                    onClick={() => {
                      if (!target.disabled) {
                        setSelectedTargetId(target.id)
                      }
                    }}
                    disabled={target.disabled}
                    className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all flex items-center gap-3 border-none outline-none ring-0 mb-1 last:mb-0 ${
                      target.disabled
                        ? 'opacity-30 cursor-not-allowed bg-transparent text-zinc-400 dark:text-zinc-600'
                        : isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {target.id === null ? (
                      <Home className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
                    ) : isSelected ? (
                      <FolderOpen className="w-4 h-4 shrink-0" />
                    ) : (
                      <Folder className={`w-4 h-4 shrink-0 ${target.disabled ? '' : 'text-zinc-400 dark:text-zinc-500'}`} />
                    )}

                    <span className="truncate">
                      {searchQuery.trim()
                        ? target.fullPath
                        : target.id === null
                          ? target.name
                          : `${'  '.repeat(target.depth)}${target.depth > 0 ? '↳ ' : ''}${target.name}`}
                    </span>

                    {isCurrentParent && !target.disabled && (
                      <span className={`ml-auto text-xs font-bold ${isSelected ? 'text-blue-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        Current
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl p-3 mb-4">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {/* Move preview */}
            {selectedTargetId !== undefined && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Folder className="w-3.5 h-3.5" />
                <span>{currentParentName}</span>
                <ArrowRight className="w-3 h-3" />
                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                  {selectedTargetId === null
                    ? 'Root (Top Level)'
                    : flattenedFolders.find((f) => f.id === selectedTargetId)?.name ?? 'Unknown'}
                </span>
              </div>
            )}

            <div className="flex gap-3 ml-auto">
              <Dialog.Close className="px-6 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                Cancel
              </Dialog.Close>
              <button
                type="button"
                onClick={handleMove}
                disabled={isMoving}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isMoving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Moving...
                  </>
                ) : (
                  'Confirm Move'
                )}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
