'use client'

/**
 * useMediaLibrary — Core state management hook for the Media Library
 *
 * Encapsulates:
 * - Folder tree fetching & navigation
 * - Media list fetching with pagination, search, and filtering
 * - View mode state (grid/list)
 * - Selection state
 * - Upload queue management
 *
 * All data flows through Payload REST API — no filesystem assumptions.
 */

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { Media, MediaFolder } from '@/payload-types'
import type {
  FolderTreeNode,
  MediaFilters,
  PaginatedFolderResponse,
  PaginatedMediaResponse,
  PaginationState,
  SelectionState,
  ViewMode,
} from '../types'
import { DEFAULT_MEDIA_FILTERS, DEFAULT_PAGINATION } from '../types'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface MediaLibraryState {
  // Folders
  folders: MediaFolder[]
  folderTree: FolderTreeNode[]
  currentFolderId: number | null | 'unfiled'
  foldersLoading: boolean

  // Media items
  media: Media[]
  mediaLoading: boolean
  pagination: PaginationState

  // UI
  viewMode: ViewMode
  filters: MediaFilters
  selection: SelectionState

  // Upload UI State
  uploadDialogOpen: boolean

  // Preview
  previewMedia: Media | null

  // Sidebar Layout
  isSidebarOpen: boolean
}

const initialState: MediaLibraryState = {
  folders: [],
  folderTree: [],
  currentFolderId: null,
  foldersLoading: false,

  media: [],
  mediaLoading: false,
  pagination: DEFAULT_PAGINATION,

  viewMode: 'grid',
  filters: DEFAULT_MEDIA_FILTERS,
  selection: { selectedIds: new Set(), selectAll: false },

  uploadDialogOpen: false,

  previewMedia: null,
  
  isSidebarOpen: true,
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: 'SET_FOLDERS'; folders: MediaFolder[] }
  | { type: 'SET_FOLDERS_LOADING'; loading: boolean }
  | { type: 'SET_CURRENT_FOLDER'; folderId: number | null | 'unfiled' }
  | { type: 'SET_MEDIA'; media: Media[]; pagination: PaginationState }
  | { type: 'SET_MEDIA_LOADING'; loading: boolean }
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
  | { type: 'SET_FILTERS'; filters: Partial<MediaFilters> }
  | { type: 'TOGGLE_SELECT'; id: number }
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_LIMIT'; limit: number }
  | { type: 'SET_UPLOAD_DIALOG'; open: boolean }
  | { type: 'SET_PREVIEW'; media: Media | null }
  | { type: 'SET_SIDEBAR_OPEN'; open: boolean }

function reducer(state: MediaLibraryState, action: Action): MediaLibraryState {
  switch (action.type) {
    case 'SET_FOLDERS':
      return {
        ...state,
        folders: action.folders,
        folderTree: buildFolderTree(action.folders),
      }
    case 'SET_FOLDERS_LOADING':
      return { ...state, foldersLoading: action.loading }
    case 'SET_CURRENT_FOLDER':
      return {
        ...state,
        currentFolderId: action.folderId,
        selection: { selectedIds: new Set(), selectAll: false },
        filters: { ...state.filters, folderId: action.folderId },
      }
    case 'SET_MEDIA':
      return { ...state, media: action.media, pagination: action.pagination }
    case 'SET_MEDIA_LOADING':
      return { ...state, mediaLoading: action.loading }
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode }
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
        pagination: { ...state.pagination, page: 1 },
      }
    case 'TOGGLE_SELECT': {
      const newSelected = new Set(state.selection.selectedIds)
      if (newSelected.has(action.id)) {
        newSelected.delete(action.id)
      } else {
        newSelected.add(action.id)
      }
      return {
        ...state,
        selection: { selectedIds: newSelected, selectAll: false },
      }
    }
    case 'SELECT_ALL':
      return {
        ...state,
        selection: {
          selectedIds: new Set(state.media.map((m) => m.id)),
          selectAll: true,
        },
      }
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selection: { selectedIds: new Set(), selectAll: false },
      }
    case 'SET_PAGE':
      return {
        ...state,
        pagination: { ...state.pagination, page: action.page },
      }
    case 'SET_LIMIT':
      return {
        ...state,
        // Reset to page 1 when changing limit
        pagination: { ...state.pagination, limit: action.limit, page: 1 },
      }
    case 'SET_UPLOAD_DIALOG':
      return { ...state, uploadDialogOpen: action.open }
    case 'SET_PREVIEW':
      return { ...state, previewMedia: action.media }
    case 'SET_SIDEBAR_OPEN':
      return { ...state, isSidebarOpen: action.open }
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Folder Tree Builder
// ---------------------------------------------------------------------------

function buildFolderTree(folders: MediaFolder[]): FolderTreeNode[] {
  const nodeMap = new Map<number, FolderTreeNode>()

  // Create all nodes
  for (const folder of folders) {
    const parentId =
      typeof folder.parent === 'number'
        ? folder.parent
        : folder.parent != null
          ? folder.parent.id
          : null

    nodeMap.set(folder.id, {
      id: folder.id,
      name: folder.name,
      slug: folder.slug,
      path: folder.path,
      depth: folder.depth,
      parentId,
      children: [],
    })
  }

  // Build tree
  const roots: FolderTreeNode[] = []
  for (const node of nodeMap.values()) {
    if (node.parentId !== null) {
      const parent = nodeMap.get(node.parentId)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  // Sort children alphabetically
  const sortChildren = (nodes: FolderTreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    for (const node of nodes) {
      sortChildren(node.children)
    }
  }
  sortChildren(roots)

  return roots
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useMediaLibrary() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const abortControllerRef = useRef<AbortController | null>(null)

  // ── Fetch Folders ──────────────────────────────────────────────────────
  const fetchFolders = useCallback(async () => {
    dispatch({ type: 'SET_FOLDERS_LOADING', loading: true })
    try {
      const res = await fetch('/api/media-folders?limit=0&depth=0&sort=name')
      if (!res.ok) throw new Error(`Failed to fetch folders: ${res.status}`)
      const data: PaginatedFolderResponse = await res.json()
      dispatch({ type: 'SET_FOLDERS', folders: data.docs })
    } catch (error) {
      console.error('[MediaLibrary] Failed to fetch folders:', error)
    } finally {
      dispatch({ type: 'SET_FOLDERS_LOADING', loading: false })
    }
  }, [])

  // ── Fetch Media ────────────────────────────────────────────────────────
  const fetchMedia = useCallback(async () => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    dispatch({ type: 'SET_MEDIA_LOADING', loading: true })
    try {
      const params = new URLSearchParams()
      params.set('limit', String(state.pagination.limit))
      params.set('page', String(state.pagination.page))
      params.set('depth', '1')
      params.set('sort', `${state.filters.sortOrder === 'desc' ? '-' : ''}${state.filters.sortBy}`)

      // Build where clause
      const whereConditions: Record<string, unknown> = {}

      if (state.filters.folderId === 'unfiled') {
        whereConditions['folder'] = { exists: false }
      } else if (state.filters.folderId !== null) {
        whereConditions['folder'] = { equals: state.filters.folderId }
      }

      if (state.filters.search) {
        whereConditions['or'] = [
          { filename: { like: state.filters.search } },
          { alt: { like: state.filters.search } },
          { originalFilename: { like: state.filters.search } },
        ]
      }

      if (state.filters.mimeType) {
        whereConditions['mimeType'] = { like: state.filters.mimeType }
      }

      if (Object.keys(whereConditions).length > 0) {
        params.set('where', JSON.stringify(whereConditions))
      }

      const res = await fetch(`/api/media?${params.toString()}`, {
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`Failed to fetch media: ${res.status}`)
      const data: PaginatedMediaResponse = await res.json()

      dispatch({
        type: 'SET_MEDIA',
        media: data.docs,
        pagination: {
          page: data.page,
          limit: data.limit,
          totalDocs: data.totalDocs,
          totalPages: data.totalPages,
          hasNextPage: data.hasNextPage,
          hasPrevPage: data.hasPrevPage,
        },
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      console.error('[MediaLibrary] Failed to fetch media:', error)
    } finally {
      dispatch({ type: 'SET_MEDIA_LOADING', loading: false })
    }
  }, [
    state.pagination.limit,
    state.pagination.page,
    state.filters.search,
    state.filters.folderId,
    state.filters.mimeType,
    state.filters.sortBy,
    state.filters.sortOrder,
  ])

  // ── Auto-fetch on mount and when dependencies change ───────────────────
  useEffect(() => {
    void fetchFolders()
  }, [fetchFolders])

  useEffect(() => {
    void fetchMedia()
  }, [fetchMedia])

  // ── Navigation ─────────────────────────────────────────────────────────
  const navigateToFolder = useCallback((folderId: number | null | 'unfiled') => {
    dispatch({ type: 'SET_CURRENT_FOLDER', folderId })
  }, [])

  // ── Breadcrumb Path ────────────────────────────────────────────────────
  const breadcrumbs = useMemo((): Array<{ id: number | null | 'unfiled'; name: string }> => {
    if (state.currentFolderId === 'unfiled') {
      return [
        { id: null, name: 'All Media' },
        { id: 'unfiled', name: 'Unfiled' }
      ]
    }

    const crumbs: Array<{ id: number | null | 'unfiled'; name: string }> = [
      { id: null, name: 'All Media' },
    ]

    if (state.currentFolderId === null) return crumbs

    // Walk up the folder tree to build breadcrumbs
    const folderMap = new Map(state.folders.map((f) => [f.id, f]))
    let currentId: number | null = state.currentFolderId as number | null
    const path: Array<{ id: number; name: string }> = []

    while (currentId !== null) {
      const folder = folderMap.get(currentId)
      if (!folder) break
      path.unshift({ id: folder.id, name: folder.name })
      const parentId =
        typeof folder.parent === 'number'
          ? folder.parent
          : folder.parent != null
            ? folder.parent.id
            : null
      currentId = parentId
    }

    return [...crumbs, ...path]
  }, [state.currentFolderId, state.folders])

  // ── Folder CRUD ────────────────────────────────────────────────────────
  const createFolder = useCallback(
    async (name: string, parentId?: number | null) => {
      const res = await fetch('/api/media-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          parent: parentId ?? state.currentFolderId ?? null,
          // slug, path, depth are auto-computed by hooks
          slug: '',
          path: '',
          depth: 0,
        }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.errors?.[0]?.message || 'Failed to create folder')
      }
      await fetchFolders()
      return res.json()
    },
    [state.currentFolderId, fetchFolders],
  )

  const deleteFolder = useCallback(
    async (folderId: number) => {
      const res = await fetch(`/api/media-folders/${folderId}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.errors?.[0]?.message || 'Failed to delete folder')
      }
      if (state.currentFolderId === folderId) {
        dispatch({ type: 'SET_CURRENT_FOLDER', folderId: null })
      }
      await fetchFolders()
    },
    [state.currentFolderId, fetchFolders],
  )

  const renameFolder = useCallback(
    async (folderId: number, newName: string) => {
      const res = await fetch(`/api/media-folders/${folderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      if (!res.ok) throw new Error('Failed to rename folder')
      await fetchFolders()
    },
    [fetchFolders],
  )

  const deleteMedia = useCallback(
    async (mediaId: number) => {
      const res = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete media')
      await fetchMedia()
    },
    [fetchMedia],
  )

  const deleteMediaBulk = useCallback(
    async (mediaIds: number[]) => {
      await Promise.all(
        mediaIds.map(async (id) => {
          const res = await fetch(`/api/media/${id}`, { method: 'DELETE' })
          if (!res.ok) console.error(`Failed to delete media ${id}`)
        })
      )
      dispatch({ type: 'CLEAR_SELECTION' })
      await fetchMedia()
    },
    [fetchMedia],
  )

  const moveMedia = useCallback(
    async (mediaIds: number[], targetFolderId: number | null) => {
      await Promise.all(
        mediaIds.map((id) =>
          fetch(`/api/media/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folder: targetFolderId }),
          }),
        ),
      )
      dispatch({ type: 'CLEAR_SELECTION' })
      await fetchMedia()
    },
    [fetchMedia],
  )

  // ── Return ─────────────────────────────────────────────────────────────
  return {
    // State
    ...state,
    breadcrumbs,

    // Actions
    navigateToFolder,
    fetchMedia,
    fetchFolders,
    createFolder,
    deleteFolder,
    renameFolder,
    deleteMedia,
    deleteMediaBulk,
    moveMedia,

    // Dispatch helpers
    setViewMode: useCallback((mode: ViewMode) => dispatch({ type: 'SET_VIEW_MODE', mode }), []),
    setFilters: useCallback((filters: Partial<MediaFilters>) =>
      dispatch({ type: 'SET_FILTERS', filters }), []),
    setPage: useCallback((page: number) => dispatch({ type: 'SET_PAGE', page }), []),
    setLimit: useCallback((limit: number) => dispatch({ type: 'SET_LIMIT', limit }), []),
    toggleSelect: useCallback((id: number) => dispatch({ type: 'TOGGLE_SELECT', id }), []),
    selectAll: useCallback(() => dispatch({ type: 'SELECT_ALL' }), []),
    clearSelection: useCallback(() => dispatch({ type: 'CLEAR_SELECTION' }), []),
    setUploadDialogOpen: useCallback((open: boolean) => dispatch({ type: 'SET_UPLOAD_DIALOG', open }), []),
    setPreviewMedia: useCallback((media: Media | null) => dispatch({ type: 'SET_PREVIEW', media }), []),

    isSidebarOpen: state.isSidebarOpen,
    setIsSidebarOpen: (open: boolean) => dispatch({ type: 'SET_SIDEBAR_OPEN', open }),
  }
}

export type MediaLibraryHook = ReturnType<typeof useMediaLibrary>
