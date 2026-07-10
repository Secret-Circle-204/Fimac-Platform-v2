'use client'

/**
 * FolderDragOverlay — Custom drag preview for folder DnD
 *
 * Shows a ghost preview of the folder being dragged.
 * Rendered as a DragOverlay from @dnd-kit/core.
 */

import React from 'react'
import { DragOverlay } from '@dnd-kit/core'
import { Folder } from 'lucide-react'
import type { FolderTreeNode } from './types'
import { getFolderColorClass } from './FolderContextMenu'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FolderDragOverlayProps {
  /** The folder node currently being dragged (null when not dragging) */
  activeNode: FolderTreeNode | null
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FolderDragOverlay({ activeNode }: FolderDragOverlayProps) {
  return (
    <DragOverlay dropAnimation={null}>
      {activeNode && (
        <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-800 border border-blue-300 dark:border-blue-600 rounded-xl shadow-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 opacity-90 pointer-events-none max-w-[250px]">
          <div className="relative shrink-0">
            <Folder className="w-4 h-4 text-blue-500" />
            {activeNode.color !== 'default' && (
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${getFolderColorClass(activeNode.color)} ring-1 ring-white dark:ring-zinc-800`}
              />
            )}
          </div>
          <span className="truncate">{activeNode.name}</span>
        </div>
      )}
    </DragOverlay>
  )
}
