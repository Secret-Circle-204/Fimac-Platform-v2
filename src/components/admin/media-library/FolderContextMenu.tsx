'use client'

/**
 * FolderContextMenu — Right-click context menu for folder actions
 *
 * Uses @radix-ui/react-context-menu for accessible, keyboard-navigable menus.
 * Actions: Rename, Create Subfolder, Move, Change Color, Delete
 */

import React from 'react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import {
  Pencil,
  FolderPlus,
  FolderOutput,
  Palette,
  Trash2,
  Circle,
} from 'lucide-react'
import type { FolderTreeNode } from './types'
import { FOLDER_COLORS, type FolderColor } from './types'

// ---------------------------------------------------------------------------
// Color map for rendering colored circles
// ---------------------------------------------------------------------------

const COLOR_CSS_MAP: Record<FolderColor, string> = {
  default: 'bg-zinc-400 dark:bg-zinc-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FolderContextMenuProps {
  children: React.ReactNode
  node: FolderTreeNode
  onRename: (node: FolderTreeNode) => void
  onCreateSubfolder: (parentNode: FolderTreeNode) => void
  onMove: (node: FolderTreeNode) => void
  onDelete: (node: FolderTreeNode) => void
  onChangeColor: (node: FolderTreeNode, color: FolderColor) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FolderContextMenu({
  children,
  node,
  onRename,
  onCreateSubfolder,
  onMove,
  onDelete,
  onChangeColor,
}: FolderContextMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[200px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl dark:shadow-2xl p-1.5 z-[200] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Rename */}
          <ContextMenu.Item
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 transition-colors"
            onSelect={() => onRename(node)}
          >
            <Pencil className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            Rename
          </ContextMenu.Item>

          {/* Create Subfolder */}
          <ContextMenu.Item
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 transition-colors"
            onSelect={() => onCreateSubfolder(node)}
          >
            <FolderPlus className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            New Subfolder
          </ContextMenu.Item>

          {/* Move */}
          <ContextMenu.Item
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 transition-colors"
            onSelect={() => onMove(node)}
          >
            <FolderOutput className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            Move to...
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-700 my-1.5 mx-2" />

          {/* Change Color — Sub-menu */}
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 transition-colors data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-800">
              <Palette className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              Change Color
              <span className="ml-auto text-zinc-400 dark:text-zinc-500 text-xs">▶</span>
            </ContextMenu.SubTrigger>

            <ContextMenu.Portal>
              <ContextMenu.SubContent
                className="min-w-[160px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl dark:shadow-2xl p-1.5 z-[201] animate-in fade-in slide-in-from-left-2 duration-150"
                sideOffset={4}
                alignOffset={-5}
              >
                {FOLDER_COLORS.map((colorOption) => (
                  <ContextMenu.Item
                    key={colorOption.value}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 transition-colors"
                    onSelect={() => onChangeColor(node, colorOption.value)}
                  >
                    {colorOption.value === 'default' ? (
                      <Circle className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    ) : (
                      <span
                        className={`w-3.5 h-3.5 rounded-full ${COLOR_CSS_MAP[colorOption.value]} ${
                          node.color === colorOption.value
                            ? 'ring-2 ring-offset-1 ring-zinc-900 dark:ring-zinc-100 dark:ring-offset-zinc-900'
                            : ''
                        }`}
                      />
                    )}
                    {colorOption.label}
                    {node.color === colorOption.value && (
                      <span className="ml-auto text-blue-500 text-xs font-bold">✓</span>
                    )}
                  </ContextMenu.Item>
                ))}
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.Separator className="h-px bg-zinc-200 dark:bg-zinc-700 my-1.5 mx-2" />

          {/* Delete */}
          <ContextMenu.Item
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg cursor-pointer outline-none hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30 transition-colors"
            onSelect={() => onDelete(node)}
          >
            <Trash2 className="w-4 h-4" />
            Delete Folder
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}

/**
 * Returns the CSS class for a folder's color dot indicator.
 * Used by FolderSidebar to render a small colored circle next to the folder icon.
 */
export function getFolderColorClass(color: FolderColor): string {
  return COLOR_CSS_MAP[color] ?? COLOR_CSS_MAP.default
}
