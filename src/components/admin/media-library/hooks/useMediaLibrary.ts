'use client'

/**
 * useMediaLibrary — Core state management hook for the Media Library
 *
 * Encapsulates:
 * - Folder tree fetching & navigation with controlled expansion
 * - Media list fetching with pagination, search, and filtering
 * - Folder operations: move, reorder, safe delete, rename, create
 * - Folder media count tracking
 * - Folder search within sidebar
 * - View mode state (grid/list)
 * - Selection state
 * - Upload queue management
 *
 * All data flows through Payload REST API — no filesystem assumptions.
 */

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { Media, MediaFolder } from '@/payload-types'
import type {
  FolderDeletionReport,
  FolderTreeNode,
  MediaFilters,
  PaginatedFolderResponse,
  PaginatedMediaResponse,
  PaginationState,
  SelectionState,
  ViewMode,
} from '../types'
import { DEFAULT_MEDIA_FILTERS, DEFAULT_PAGINATION } from '../types'
import type { FolderColor } from '../types'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface MediaLibraryState {
  // Folders
  folders: MediaFolder[]
  folderTree: FolderTreeNode[]
  currentFolderId: number | null | 'unfiled'
  foldersLoading: boolean
  folderMediaCounts: Record<string, number>
  folderSearchQuery: string
  expandedFolderIds: Set<number>

  // Media items
  media: Media[]
  mediaLoading: boolean
  pagination: PaginationState

  // UI
  viewMode: ViewMode
  filters: MediaFilters
  selection: SelectionState
  isSelectionMode: boolean

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
  folderMediaCounts: {},
  folderSearchQuery: '',
  expandedFolderIds: new Set(),

  media: [],
  mediaLoading: false,
  pagination: DEFAULT_PAGINATION,

  viewMode: 'grid',
  filters: DEFAULT_MEDIA_FILTERS,
  selection: { selectedIds: new Set(), selectAll: false },
  isSelectionMode: false,

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
  | { type: 'SET_SELECTION_MODE'; isMode: boolean }
  | { type: 'SET_FOLDER_MEDIA_COUNTS'; counts: Record<string, number> }
  | { type: 'SET_FOLDER_SEARCH_QUERY'; query: string }
  | { type: 'TOGGLE_FOLDER_EXPANDED'; folderId: number }
  | { type: 'SET_EXPANDED_FOLDER_IDS'; ids: Set<number> }
  | { type: 'ADD_EXPANDED_FOLDER_IDS'; ids: number[] }
  | { type: 'EXPAND_ALL_FOLDERS' }
  | { type: 'COLLAPSE_ALL_FOLDERS' }

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
        isSelectionMode: newSelected.size > 0,
      }
    }
    case 'SELECT_ALL':
      return {
        ...state,
        selection: {
          selectedIds: new Set(state.media.map((m) => m.id)),
          selectAll: true,
        },
        isSelectionMode: true,
      }
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selection: { selectedIds: new Set(), selectAll: false },
        isSelectionMode: false,
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
    case 'SET_SELECTION_MODE':
      return { ...state, isSelectionMode: action.isMode }
    case 'SET_FOLDER_MEDIA_COUNTS':
      return { ...state, folderMediaCounts: action.counts }
    case 'SET_FOLDER_SEARCH_QUERY':
      return { ...state, folderSearchQuery: action.query }
    case 'TOGGLE_FOLDER_EXPANDED': {
      const newExpanded = new Set(state.expandedFolderIds)
      if (newExpanded.has(action.folderId)) {
        newExpanded.delete(action.folderId)
      } else {
        newExpanded.add(action.folderId)
      }
      return { ...state, expandedFolderIds: newExpanded }
    }
    case 'SET_EXPANDED_FOLDER_IDS':
      return { ...state, expandedFolderIds: action.ids }
    case 'ADD_EXPANDED_FOLDER_IDS': {
      const newExpanded = new Set(state.expandedFolderIds)
      let changed = false
      for (const id of action.ids) {
        if (!newExpanded.has(id)) {
          newExpanded.add(id)
          changed = true
        }
      }
      if (!changed) return state
      return { ...state, expandedFolderIds: newExpanded }
    }
    case 'EXPAND_ALL_FOLDERS': {
      const allIds = new Set(state.folders.map((f) => f.id))
      return { ...state, expandedFolderIds: allIds }
    }
    case 'COLLAPSE_ALL_FOLDERS':
      return { ...state, expandedFolderIds: new Set() }
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Folder Tree Builder
// ---------------------------------------------------------------------------

/**
 * Builds a tree structure from a flat list of folders.
 * Sorts by sortOrder first, then by name as a tiebreaker.
 */
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
      sortOrder: (folder as MediaFolder & { sortOrder?: number }).sortOrder ?? 0,
      color: ((folder as MediaFolder & { color?: FolderColor }).color ?? 'default') as FolderColor,
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

  // Sort children by sortOrder, then name as tiebreaker
  const sortChildren = (nodes: FolderTreeNode[]) => {
    nodes.sort((a, b) => {
      const orderDiff = a.sortOrder - b.sortOrder
      if (orderDiff !== 0) return orderDiff
      return a.name.localeCompare(b.name)
    })
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

  // ── Health Checking (Debounced) ────────────────────────────────────────
  const brokenImageQueue = useRef<Set<number>>(new Set())
  const brokenImageTimeout = useRef<NodeJS.Timeout | null>(null)

  const reportBrokenImage = useCallback((id: number) => {
    brokenImageQueue.current.add(id)

    if (brokenImageTimeout.current) {
      clearTimeout(brokenImageTimeout.current)
    }

    brokenImageTimeout.current = setTimeout(async () => {
      const ids = Array.from(brokenImageQueue.current)
      if (ids.length === 0) return

      try {
        await fetch('/api/media/verify-health-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        })
        // Clear queue after successful report
        brokenImageQueue.current.clear()

        // Refresh media to update healthStatus
        await fetchMedia()
      } catch (err) {
        console.error('[MediaLibrary] Failed to report broken images', err)
      }
    }, 1500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch Folders ──────────────────────────────────────────────────────
  const fetchFolders = useCallback(async () => {
    dispatch({ type: 'SET_FOLDERS_LOADING', loading: true })
    try {
      const res = await fetch('/api/media-folders?limit=0&depth=0&sort=sortOrder,name')
      if (!res.ok) throw new Error(`Failed to fetch folders: ${res.status}`)
      const data: PaginatedFolderResponse = await res.json()
      dispatch({ type: 'SET_FOLDERS', folders: data.docs })
    } catch (error) {
      console.error('[MediaLibrary] Failed to fetch folders:', error)
    } finally {
      dispatch({ type: 'SET_FOLDERS_LOADING', loading: false })
    }
  }, [])

  // ── Fetch Folder Media Counts ──────────────────────────────────────────
  const fetchFolderMediaCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/media-folders/counts')
      if (!res.ok) throw new Error(`Failed to fetch folder counts: ${res.status}`)
      const counts: Record<number, number> = await res.json()
      dispatch({ type: 'SET_FOLDER_MEDIA_COUNTS', counts })
    } catch (error) {
      console.error('[MediaLibrary] Failed to fetch folder media counts:', error)
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
    void fetchFolderMediaCounts()
  }, [fetchFolders, fetchFolderMediaCounts])

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

  // ── Folder Search (client-side filtered tree) ──────────────────────────
  const filteredFolderTree = useMemo((): FolderTreeNode[] => {
    if (!state.folderSearchQuery.trim()) return state.folderTree

    const query = state.folderSearchQuery.toLowerCase()

    /**
     * Recursively filter tree, keeping a node if:
     * - Its name matches the search query, OR
     * - Any of its descendants match
     */
    const filterTree = (nodes: FolderTreeNode[]): FolderTreeNode[] => {
      const result: FolderTreeNode[] = []

      for (const node of nodes) {
        const nameMatches = node.name.toLowerCase().includes(query)
        const filteredChildren = filterTree(node.children)

        if (nameMatches || filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren,
          })
        }
      }

      return result
    }

    return filterTree(state.folderTree)
  }, [state.folderTree, state.folderSearchQuery])

  // ── Auto-expand ancestors when navigating to a folder ──────────────────
  useEffect(() => {
    if (typeof state.currentFolderId !== 'number') return

    // Expand all ancestors of the current folder
    const folderMap = new Map(state.folders.map((f) => [f.id, f]))
    const toExpand: number[] = []
    let currentId: number | null = state.currentFolderId

    while (currentId !== null) {
      toExpand.push(currentId)
      const folder = folderMap.get(currentId)
      if (!folder) break
      const parentId =
        typeof folder.parent === 'number'
          ? folder.parent
          : folder.parent != null
            ? folder.parent.id
            : null
      currentId = parentId
    }

    if (toExpand.length > 0) {
      dispatch({ type: 'ADD_EXPANDED_FOLDER_IDS', ids: toExpand })
    }
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
          // slug, path, depth, sortOrder are auto-computed by hooks
          slug: '',
          path: '',
          depth: 0,
          sortOrder: 0,
        }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.errors?.[0]?.message || 'Failed to create folder')
      }
      await fetchFolders()
      await fetchFolderMediaCounts()
      return res.json()
    },
    [state.currentFolderId, fetchFolders, fetchFolderMediaCounts],
  )

  /**
   * Safely deletes a folder. Media is NEVER deleted — it is reassigned
   * to the parent folder (or unfiled if root-level).
   */
  const safeDeleteFolder = useCallback(
    async (folderId: number): Promise<FolderDeletionReport> => {
      const res = await fetch('/api/media-folders/safe-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete folder')
      }
      const report: FolderDeletionReport = await res.json()

      // If the deleted folder was the current one, navigate to root
      if (state.currentFolderId === folderId) {
        dispatch({ type: 'SET_CURRENT_FOLDER', folderId: null })
      }

      await fetchFolders()
      await fetchFolderMediaCounts()
      await fetchMedia()

      return report
    },
    [state.currentFolderId, fetchFolders, fetchFolderMediaCounts, fetchMedia],
  )

  const renameFolder = useCallback(
    async (folderId: number, newName: string) => {
      const res = await fetch(`/api/media-folders/${folderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.errors?.[0]?.message || 'Failed to rename folder')
      }
      await fetchFolders()
    },
    [fetchFolders],
  )

  /**
   * Moves a folder to a new parent via the /move endpoint.
   * Validates for cycles server-side.
   */
  const moveFolder = useCallback(
    async (folderId: number, newParentId: number | null) => {
      const res = await fetch('/api/media-folders/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId, newParentId }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to move folder')
      }
      await fetchFolders()
    },
    [fetchFolders],
  )

  /**
   * Persists the drag-and-drop order of folders under a parent.
   */
  const reorderFolders = useCallback(
    async (parentId: number | null, orderedIds: number[]) => {
      const res = await fetch('/api/media-folders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId, orderedIds }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to reorder folders')
      }
      await fetchFolders()
    },
    [fetchFolders],
  )

  /**
   * Updates a folder's color.
   */
  const changeFolderColor = useCallback(
    async (folderId: number, color: FolderColor) => {
      const res = await fetch(`/api/media-folders/${folderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color }),
      })
      if (!res.ok) throw new Error('Failed to change folder color')
      await fetchFolders()
    },
    [fetchFolders],
  )

  const deleteMedia = useCallback(
    async (mediaId: number) => {
      const res = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete media')
      await fetchMedia()
      await fetchFolderMediaCounts()
    },
    [fetchMedia, fetchFolderMediaCounts],
  )

  const deleteMediaBulk = useCallback(
    async (mediaIds: number[]) => {
      const res = await fetch('/api/media/bulk-delete-safe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: mediaIds })
      })
      if (!res.ok) throw new Error('Failed to safe delete media')
      const report = await res.json()
      
      dispatch({ type: 'CLEAR_SELECTION' })
      await fetchMedia()
      await fetchFolderMediaCounts()
      
      return report
    },
    [fetchMedia, fetchFolderMediaCounts],
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
      await fetchFolderMediaCounts()
    },
    [fetchMedia, fetchFolderMediaCounts],
  )

  // ── Return ─────────────────────────────────────────────────────────────
  return {
    // State
    ...state,
    breadcrumbs,
    filteredFolderTree,

    // Actions
    navigateToFolder,
    fetchMedia,
    fetchFolders,
    fetchFolderMediaCounts,
    createFolder,
    safeDeleteFolder,
    renameFolder,
    moveFolder,
    reorderFolders,
    changeFolderColor,
    deleteMedia,
    deleteMediaBulk,
    moveMedia,
    reportBrokenImage,

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
    setIsSelectionMode: useCallback((isMode: boolean) => dispatch({ type: 'SET_SELECTION_MODE', isMode }), []),
    setFolderSearchQuery: useCallback((query: string) => dispatch({ type: 'SET_FOLDER_SEARCH_QUERY', query }), []),
    toggleFolderExpanded: useCallback((folderId: number) => dispatch({ type: 'TOGGLE_FOLDER_EXPANDED', folderId }), []),
    expandAllFolders: useCallback(() => dispatch({ type: 'EXPAND_ALL_FOLDERS' }), []),
    collapseAllFolders: useCallback(() => dispatch({ type: 'COLLAPSE_ALL_FOLDERS' }), []),

    isSidebarOpen: state.isSidebarOpen,
    setIsSidebarOpen: (open: boolean) => dispatch({ type: 'SET_SIDEBAR_OPEN', open }),
  }
}

export type MediaLibraryHook = ReturnType<typeof useMediaLibrary>
