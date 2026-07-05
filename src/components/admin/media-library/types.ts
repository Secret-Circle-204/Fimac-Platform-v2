/**
 * Media Library — Shared TypeScript Types
 *
 * Types used across all media library admin components.
 * Derived from Payload-generated types but structured for UI consumption.
 */

import type { Media, MediaFolder } from '@/payload-types'

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
  /** Number of direct media items in this folder (loaded on demand) */
  mediaCount?: number
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
