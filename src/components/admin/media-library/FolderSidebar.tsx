'use client'

/**
 * FolderSidebar — Smart folder navigation with full admin capabilities
 *
 * Features:
 * - Search bar for real-time folder filtering
 * - Drag-and-drop reordering (within siblings) via @dnd-kit
 * - Drag folder onto another to move it (parent change)
 * - Right-click context menu (rename, create subfolder, move, color, delete)
 * - Inline rename on double-click or F2
 * - Media count badges per folder
 * - Controlled expand/collapse with Expand All / Collapse All
 * - Color indicators
 * - Keyboard navigation (Arrow keys, Enter, F2)
 *
 * Performance: Only renders expanded nodes, so 1000+ folders remain fast.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Folder,
  FolderOpen,
  Plus,
  ChevronRight,
  ChevronDown,
  Inbox,
  Search,
  ChevronsUpDown,
  ChevronsDownUp,
  GripVertical,
  X,
  Trash2,
} from 'lucide-react'
import type { FolderTreeNode, FolderDropIndicator } from './types'
import type { MediaLibraryHook } from './hooks/useMediaLibrary'
import type { FolderColor } from './types'
import { FolderContextMenu, getFolderColorClass } from './FolderContextMenu'
import { FolderDragOverlay } from './FolderDragOverlay'
import { FolderDeleteDialog } from './FolderDeleteDialog'
import { FolderMoveDialog } from './FolderMoveDialog'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FolderSidebarProps {
  library: MediaLibraryHook
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function FolderSidebar({ library }: FolderSidebarProps) {
  const {
    filteredFolderTree,
    currentFolderId,
    navigateToFolder,
    createFolder,
    foldersLoading,
    folderSearchQuery,
    setFolderSearchQuery,
    expandAllFolders,
    collapseAllFolders,
    expandedFolderIds,
    toggleFolderExpanded,
    folderMediaCounts,
    renameFolder,
    moveFolder,
    reorderFolders,
    changeFolderColor,
    folderTree,
  } = library

  // ── Local state ──────────────────────────────────────────────────────
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [createParentId, setCreateParentId] = useState<number | null>(null)
  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [folderToDelete, setFolderToDelete] = useState<FolderTreeNode | null>(null)
  const [folderToMove, setFolderToMove] = useState<FolderTreeNode | null>(null)

  // DnD state
  const [activeDragNode, setActiveDragNode] = useState<FolderTreeNode | null>(null)
  const [dropIndicator, setDropIndicator] = useState<FolderDropIndicator | null>(null)

  // ── DnD Sensors ──────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  )

  // ── Folder create ────────────────────────────────────────────────────
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return
    try {
      await createFolder(newFolderName.trim(), createParentId)
      setNewFolderName('')
      setIsCreating(false)
      setCreateParentId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create folder')
    }
  }

  const startCreate = (parentId: number | null) => {
    setCreateParentId(parentId)
    setIsCreating(true)
  }

  // ── Inline rename ────────────────────────────────────────────────────
  const startRename = useCallback((node: FolderTreeNode) => {
    setRenamingId(node.id)
    setRenameValue(node.name)
  }, [])

  const submitRename = useCallback(
    async (folderId: number) => {
      if (!renameValue.trim() || renameValue.trim() === '') {
        setRenamingId(null)
        return
      }
      try {
        await renameFolder(folderId, renameValue.trim())
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to rename folder')
      } finally {
        setRenamingId(null)
      }
    },
    [renameValue, renameFolder],
  )

  // ── Context menu actions ─────────────────────────────────────────────
  const handleContextRename = useCallback(
    (node: FolderTreeNode) => startRename(node),
    [startRename],
  )

  const handleContextCreateSub = useCallback(
    (node: FolderTreeNode) => {
      // Expand the parent first
      if (!expandedFolderIds.has(node.id)) {
        toggleFolderExpanded(node.id)
      }
      startCreate(node.id)
    },
    [expandedFolderIds, toggleFolderExpanded],
  )

  const handleContextMove = useCallback((node: FolderTreeNode) => {
    setFolderToMove(node)
  }, [])

  const handleContextDelete = useCallback((node: FolderTreeNode) => {
    setFolderToDelete(node)
  }, [])

  const handleContextChangeColor = useCallback(
    async (node: FolderTreeNode, color: FolderColor) => {
      try {
        await changeFolderColor(node.id, color)
      } catch (err) {
        console.error('Failed to change folder color:', err)
      }
    },
    [changeFolderColor],
  )

  // ── DnD Handlers ─────────────────────────────────────────────────────
  const findNodeById = useCallback(
    (id: number, nodes: FolderTreeNode[]): FolderTreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node
        const found = findNodeById(id, node.children)
        if (found) return found
      }
      return null
    },
    [],
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const nodeId = Number(event.active.id)
      const node = findNodeById(nodeId, folderTree)
      setActiveDragNode(node)
    },
    [folderTree, findNodeById],
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event
      if (!over) {
        setDropIndicator(null)
        return
      }

      const overId = Number(over.id)
      if (activeDragNode && overId === activeDragNode.id) {
        setDropIndicator(null)
        return
      }

      // Default to "inside" (move into this folder)
      setDropIndicator({ targetId: overId, position: 'inside' })
    },
    [activeDragNode],
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event

      setActiveDragNode(null)
      setDropIndicator(null)

      if (!over || active.id === over.id) return

      const activeId = Number(active.id)
      const overId = Number(over.id)

      const activeNode = findNodeById(activeId, folderTree)
      const overNode = findNodeById(overId, folderTree)

      if (!activeNode || !overNode) return

      // If same parent → reorder
      if (activeNode.parentId === overNode.parentId) {
        // Find siblings
        const parentId = activeNode.parentId
        const siblings = parentId === null
          ? folderTree
          : findNodeById(parentId, folderTree)?.children ?? []

        const oldIndex = siblings.findIndex((n) => n.id === activeId)
        const newIndex = siblings.findIndex((n) => n.id === overId)

        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(siblings, oldIndex, newIndex)
          const orderedIds = reordered.map((n) => n.id)

          try {
            await reorderFolders(parentId, orderedIds)
          } catch (err) {
            console.error('Failed to reorder folders:', err)
          }
        }
      } else {
        // Different parent → move into the over folder
        try {
          await moveFolder(activeId, overId)
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Failed to move folder')
        }
      }
    },
    [folderTree, findNodeById, reorderFolders, moveFolder],
  )

  // ── Get sortable IDs for root level ──────────────────────────────────
  const rootIds = filteredFolderTree.map((n) => n.id)

  return (
    <div className="ml-sidebar flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm w-[280px] shrink-0 transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
        <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
          Folders
        </h2>
        <div className="flex items-center gap-1">
          {typeof currentFolderId === 'number' && (
            <button
              type="button"
              onClick={() => {
                const node = findNodeById(currentFolderId, folderTree)
                if (node) setFolderToDelete(node)
              }}
              className="bg-transparent border-none p-1.5 text-red-400 hover:text-red-600 dark:text-red-500/80 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all active:scale-95"
              title="Delete Selected Folder"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => expandAllFolders()}
            className="bg-transparent border-none p-1.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
            title="Expand All"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => collapseAllFolders()}
            className="bg-transparent border-none p-1.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
            title="Collapse All"
          >
            <ChevronsDownUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => startCreate(typeof currentFolderId === 'number' ? currentFolderId : null)}
            className="bg-transparent border-none p-1.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all active:scale-95"
            title="New Folder"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search folders..."
            value={folderSearchQuery}
            onChange={(e) => setFolderSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
          />
          {folderSearchQuery && (
            <button
              type="button"
              onClick={() => setFolderSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-transparent border-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {/* All Media (Root) */}
        <button
          type="button"
          onClick={() => navigateToFolder(null)}
          className={`bg-transparent border-none outline-none w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 group mb-0.5 ${
            currentFolderId === null
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold shadow-xs'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-50'
          }`}
        >
          {currentFolderId === null ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-500 dark:group-hover:text-zinc-400" />
          )}
          <span className="text-xs font-semibold flex-1 text-left">All Media</span>
          {folderMediaCounts['all'] > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
              currentFolderId === null
                ? 'bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-300'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
            }`}>
              {folderMediaCounts['all']}
            </span>
          )}
        </button>

        {/* Unfiled Media */}
        <button
          type="button"
          onClick={() => navigateToFolder('unfiled')}
          className={`bg-transparent border-none outline-none w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 group mb-2 ${
            currentFolderId === 'unfiled'
              ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-bold shadow-xs'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-50'
          }`}
        >
          <Inbox className={`w-4 h-4 ${currentFolderId === 'unfiled' ? '' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-500 dark:group-hover:text-zinc-400'}`} />
          <span className="text-xs font-semibold flex-1 text-left">Unfiled</span>
          {folderMediaCounts['unfiled'] > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
              currentFolderId === 'unfiled'
                ? 'bg-orange-100 dark:bg-orange-800/40 text-orange-600 dark:text-orange-300'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
            }`}>
              {folderMediaCounts['unfiled']}
            </span>
          )}
        </button>

        {/* Separator */}
        <div className="h-px bg-zinc-200 dark:bg-zinc-800 mx-1 mb-2" />

        {/* Folder Tree with DnD */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-0.5">
            {foldersLoading && filteredFolderTree.length === 0 ? (
              <div className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500 animate-pulse">
                Loading folders...
              </div>
            ) : filteredFolderTree.length === 0 && folderSearchQuery ? (
              <div className="px-3 py-4 text-xs text-zinc-400 dark:text-zinc-500 text-center">
                No folders match &quot;{folderSearchQuery}&quot;
              </div>
            ) : (
              <SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
                {filteredFolderTree.map((node) => (
                  <SortableFolderNode
                    key={node.id}
                    node={node}
                    currentFolderId={currentFolderId}
                    onSelect={navigateToFolder}
                    expandedIds={expandedFolderIds}
                    onToggleExpand={toggleFolderExpanded}
                    mediaCounts={folderMediaCounts}
                    renamingId={renamingId}
                    renameValue={renameValue}
                    onRenameValueChange={setRenameValue}
                    onRenameSubmit={submitRename}
                    onRenameCancel={() => setRenamingId(null)}
                    onContextRename={handleContextRename}
                    onContextCreateSub={handleContextCreateSub}
                    onContextMove={handleContextMove}
                    onContextDelete={handleContextDelete}
                    onContextChangeColor={handleContextChangeColor}
                    dropIndicator={dropIndicator}
                    searchQuery={folderSearchQuery}
                  />
                ))}
              </SortableContext>
            )}
          </div>

          <FolderDragOverlay activeNode={activeDragNode} />
        </DndContext>

        {/* Inline Create Form */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="mt-2 px-1">
            <input
              type="text"
              autoFocus
              placeholder="New folder name..."
              className="w-full text-xs px-3 py-2 bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/50 focus:border-blue-500 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => {
                if (!newFolderName.trim()) {
                  setIsCreating(false)
                  setCreateParentId(null)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsCreating(false)
                  setCreateParentId(null)
                }
              }}
            />
          </form>
        )}
      </div>

      {/* Delete Dialog */}
      <FolderDeleteDialog
        folder={folderToDelete}
        library={library}
        onClose={() => setFolderToDelete(null)}
      />

      {/* Move Dialog */}
      <FolderMoveDialog
        folder={folderToMove}
        library={library}
        onClose={() => setFolderToMove(null)}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sortable Folder Node
// ---------------------------------------------------------------------------

interface SortableFolderNodeProps {
  node: FolderTreeNode
  currentFolderId: number | null | 'unfiled'
  onSelect: (id: number | null | 'unfiled') => void
  expandedIds: Set<number>
  onToggleExpand: (id: number) => void
  mediaCounts: Record<string, number>
  renamingId: number | null
  renameValue: string
  onRenameValueChange: (val: string) => void
  onRenameSubmit: (folderId: number) => Promise<void>
  onRenameCancel: () => void
  onContextRename: (node: FolderTreeNode) => void
  onContextCreateSub: (node: FolderTreeNode) => void
  onContextMove: (node: FolderTreeNode) => void
  onContextDelete: (node: FolderTreeNode) => void
  onContextChangeColor: (node: FolderTreeNode, color: FolderColor) => void
  dropIndicator: FolderDropIndicator | null
  searchQuery: string
}

function SortableFolderNode(props: SortableFolderNodeProps) {
  const {
    node,
    currentFolderId,
    onSelect,
    expandedIds,
    onToggleExpand,
    mediaCounts,
    renamingId,
    renameValue,
    onRenameValueChange,
    onRenameSubmit,
    onRenameCancel,
    onContextRename,
    onContextCreateSub,
    onContextMove,
    onContextDelete,
    onContextChangeColor,
    dropIndicator,
    searchQuery,
  } = props

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id })

  const renameInputRef = useRef<HTMLInputElement>(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const isSelected = currentFolderId === node.id
  const isExpanded = expandedIds.has(node.id)
  const hasChildren = node.children.length > 0
  const isRenaming = renamingId === node.id
  const mediaCount = mediaCounts[String(node.id)] ?? 0
  const isDropTarget = dropIndicator?.targetId === node.id && dropIndicator.position === 'inside'

  // Auto-focus rename input
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [isRenaming])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'F2') {
      e.preventDefault()
      onContextRename(node)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      onSelect(node.id)
    } else if (e.key === 'Delete') {
      e.preventDefault()
      onContextDelete(node)
    } else if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
      e.preventDefault()
      onToggleExpand(node.id)
    } else if (e.key === 'ArrowLeft' && isExpanded) {
      e.preventDefault()
      onToggleExpand(node.id)
    }
  }

  // Child IDs for nested sortable context
  const childIds = node.children.map((c) => c.id)

  return (
    <div ref={setNodeRef} style={style}>
      <FolderContextMenu
        node={node}
        onRename={onContextRename}
        onCreateSubfolder={onContextCreateSub}
        onMove={onContextMove}
        onDelete={onContextDelete}
        onChangeColor={onContextChangeColor}
      >
        <div
          className={`group flex items-center rounded-lg transition-all duration-150 ${
            isSelected
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold'
              : isDropTarget
                ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400 dark:ring-blue-500'
                : 'bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-50'
          }`}
          onKeyDown={handleKeyDown}
          onDoubleClick={() => onContextRename(node)}
          tabIndex={0}
          role="treeitem"
          aria-selected={isSelected}
          aria-expanded={hasChildren ? isExpanded : undefined}
        >
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="p-1 cursor-grab active:cursor-grabbing text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            <GripVertical className="w-3 h-3" />
          </div>

          {/* Expand Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(node.id)
            }}
            className={`bg-transparent border-none p-1 shrink-0 transition-transform outline-none ${
              !hasChildren ? 'invisible' : ''
            } ${isSelected ? 'text-blue-500' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>

          {/* Folder Icon + Color */}
          <button
            type="button"
            onClick={() => onSelect(node.id)}
            className="bg-transparent border-none outline-none flex-1 flex items-center gap-2 py-1.5 pr-2 text-left truncate min-w-0"
          >
            <div className="relative shrink-0">
              {isSelected || isExpanded ? (
                <FolderOpen className="w-4 h-4 shrink-0" />
              ) : (
                <Folder className={`w-4 h-4 shrink-0 ${isSelected ? '' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-500'}`} />
              )}
              {node.color !== 'default' && (
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${getFolderColorClass(node.color)} ring-1 ring-white dark:ring-zinc-900`}
                />
              )}
            </div>

            {/* Name or Rename Input */}
            {isRenaming ? (
              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => onRenameValueChange(e.target.value)}
                onBlur={() => onRenameSubmit(node.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void onRenameSubmit(node.id)
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    onRenameCancel()
                  }
                  e.stopPropagation()
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 min-w-0 text-xs font-medium px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-blue-400 dark:border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              />
            ) : (
              <span className={`truncate text-xs ${isSelected ? 'font-bold' : 'font-medium'}`}>
                {searchQuery ? highlightMatch(node.name, searchQuery) : node.name}
              </span>
            )}
          </button>

          {/* Media Count Badge */}
          {mediaCount > 0 && !isRenaming && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md mr-1 shrink-0 ${
              isSelected
                ? 'bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-300'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
            }`}>
              {mediaCount}
            </span>
          )}
        </div>
      </FolderContextMenu>

      {/* Children (only rendered when expanded) */}
      {isExpanded && hasChildren && (
        <div className="ml-3 pl-2 border-l border-zinc-200 dark:border-zinc-800 mt-0.5 space-y-0.5">
          <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
            {node.children.map((child) => (
              <SortableFolderNode
                key={child.id}
                {...props}
                node={child}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Highlights search match in folder name */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return text

  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-yellow-200 dark:bg-yellow-800/60 text-inherit rounded-sm px-0.5">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  )
}
