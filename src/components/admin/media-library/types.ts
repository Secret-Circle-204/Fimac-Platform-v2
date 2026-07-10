/**
 * Media Library — Shared TypeScript Types
 *
 * Types used across all media library admin components.
 * Derived from Payload-generated types but structured for UI consumption.
 */

import type { Media, MediaFolder } from '@/payload-types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Available folder colors for visual organization */
export const FOLDER_COLORS = [
  { label: 'Default', value: 'default' },
  { label: 'Red', value: 'red' },
  { label: 'Orange', value: 'orange' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' },
  { label: 'Purple', value: 'purple' },
  { label: 'Pink', value: 'pink' },
] as const

export type FolderColor = (typeof FOLDER_COLORS)[number]['value']

// ---------------------------------------------------------------------------
// View Modes
// ---------------------------------------------------------------------------

export type ViewMode = 'grid' | 'list'

// ---------------------------------------------------------------------------
// Folder Tree
// ---------------------------------------------------------------------------

/** A folder node enriched with children for tree rendering */
export interface FolderTreeNode {
  id: number
  name: string
  slug: string
  path: string
  depth: number
  parentId: number | null
  children: FolderTreeNode[]
  /** Custom sort order for drag-and-drop positioning */
  sortOrder: number
  /** Optional color for visual organization */
  color: FolderColor
  /** Number of direct media items in this folder (loaded on demand) */
  mediaCount?: number
}

// ---------------------------------------------------------------------------
// Folder Context Menu
// ---------------------------------------------------------------------------

/** Actions available in the folder context menu */
export type FolderContextAction =
  | 'rename'
  | 'move'
  | 'delete'
  | 'create-sub'
  | 'change-color'

// ---------------------------------------------------------------------------
// Folder Drag & Drop
// ---------------------------------------------------------------------------

/** Data attached to a draggable folder node */
export interface FolderDragData {
  type: 'folder'
  folderId: number
  folderName: string
  parentId: number | null
  depth: number
}

/** Drop position relative to a folder node */
export type FolderDropPosition = 'before' | 'after' | 'inside'

/** State during an active drag operation */
export interface FolderDropIndicator {
  /** ID of the folder being hovered over */
  targetId: number
  /** Where relative to the target the item would be dropped */
  position: FolderDropPosition
}

// ---------------------------------------------------------------------------
// Folder Deletion
// ---------------------------------------------------------------------------

/** Report returned after a safe folder deletion */
export interface FolderDeletionReport {
  /** ID of the root folder that was deleted */
  deletedFolderId: number
  /** Name of the root folder that was deleted */
  deletedFolderName: string
  /** Total number of folders deleted (including subfolders) */
  foldersDeleted: number
  /** Total number of media items reassigned (NEVER deleted) */
  mediaReassigned: number
  /** Details of each reassignment */
  reassignments: Array<{
    count: number
    fromFolder: string
    toFolder: string
    toFolderId: number | null
  }>
}

// ---------------------------------------------------------------------------
// Filters & Search
// ---------------------------------------------------------------------------

export interface MediaFilters {
  search: string
  mimeType: string | null
  folderId: number | null | 'unfiled'
  sortBy: 'createdAt' | 'updatedAt' | 'filename' | 'filesize'
  sortOrder: 'asc' | 'desc'
}

export const DEFAULT_MEDIA_FILTERS: MediaFilters = {
  search: '',
  mimeType: null,
  folderId: null,
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

export interface SelectionState {
  /** Set of selected media IDs */
  selectedIds: Set<number>
  /** Whether "select all" is active */
  selectAll: boolean
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationState {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  limit: 24,
  totalDocs: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
}

// ---------------------------------------------------------------------------
// API Response Types (subset of Payload REST API shapes)
// ---------------------------------------------------------------------------

export interface PaginatedMediaResponse {
  docs: Media[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

export interface PaginatedFolderResponse {
  docs: MediaFolder[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  hasPrevPage: boolean
  hasNextPage: boolean
}
