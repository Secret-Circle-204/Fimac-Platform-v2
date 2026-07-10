/**
 * MediaFolders Collection — Virtual Folder System
 *
 * Implements a database-only folder hierarchy for organizing media.
 * No filesystem coupling — folders exist purely in PostgreSQL.
 *
 * Features:
 * - Nested folders with unlimited depth
 * - Materialized path for efficient breadcrumb/tree queries
 * - Self-referential parent relationship
 * - Auto-computed slug, path, and depth
 * - Custom sort order for drag-and-drop reordering
 * - Folder color for visual organization
 * - Unique folder names per parent
 * - Circular move protection
 * - Safe deletion: media is NEVER deleted, only reassigned
 *
 * This collection works identically regardless of whether media is stored
 * on local disk, S3, R2, or any other provider.
 */

import type {
  CollectionBeforeChangeHook,
  CollectionConfig,
  Where,
} from 'payload'
import slugify from 'slugify'
import { FolderOperationsService } from '@/lib/media/FolderOperationsService'
import { FOLDER_COLORS } from '@/components/admin/media-library/types'

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Computes `slug`, `path`, and `depth` from `name` and `parent`.
 *
 * Path format: `/parent-slug/child-slug/grandchild-slug`
 * Root folders have path: `/folder-slug`
 *
 * Skipped when `skipPathCascade` is set in context (used during
 * descendant cascade updates to prevent infinite recursion).
 */
const computeFolderMetadata: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation: _operation,
  originalDoc,
}) => {
  // Skip computation during descendant cascade updates
  if (req.context && (req.context as Record<string, unknown>).skipPathCascade) {
    return data
  }

  const name: string = data?.name ?? originalDoc?.name ?? ''
  const parentId: number | null | undefined = data?.parent ?? originalDoc?.parent

  // Compute slug from name
  const slug = slugify(name, { lower: true, strict: true, trim: true })

  // Resolve parent to compute path and depth
  let parentPath = ''
  let parentDepth = -1

  if (parentId) {
    const parentDoc = await req.payload.findByID({
      collection: 'media-folders',
      id: parentId,
      depth: 0,
      req,
    })
    if (parentDoc) {
      parentPath = (parentDoc.path as string) || ''
      parentDepth = (parentDoc.depth as number) ?? -1
    }
  }

  const path = parentPath ? `${parentPath}/${slug}` : `/${slug}`
  const depth = parentDepth + 1

  return {
    ...data,
    slug,
    path,
    depth,
  }
}

/**
 * Validates that the folder name is unique among siblings
 * (same parent). Prevents confusing duplicate names at the same level.
 */
const validateUniqueNamePerParent: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  const name: string | undefined = data?.name
  if (!name) return data

  const parentId: number | null | undefined = data?.parent ?? originalDoc?.parent ?? null
  const currentId: number | undefined = originalDoc?.id

  // Build query: same name, same parent, different ID (for updates)
  const whereClause: Where = {
    name: { equals: name },
  }

  // Handle null parent (root level) vs specific parent
  if (parentId) {
    whereClause['parent'] = { equals: parentId }
  } else {
    whereClause['parent'] = { exists: false }
  }

  const siblings = await req.payload.find({
    collection: 'media-folders',
    where: whereClause,
    limit: 1,
    depth: 0,
    req,
  })

  // If a sibling with the same name exists and it's not the current folder being updated
  const conflict = siblings.docs.find(
    (doc) => operation === 'create' || doc.id !== currentId,
  )

  if (conflict) {
    const { ValidationError } = await import('payload')
    throw new ValidationError({
      errors: [
        {
          message: `A folder named "${name}" already exists in this location. Please choose a different name.`,
          path: 'name',
        },
      ],
    })
  }

  return data
}

/**
 * Prevents moving a folder into its own descendant (would create a cycle).
 * Also flags parent changes for cascade processing in afterChange.
 */
const validateMoveAndCascade: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (operation !== 'update') return data

  // Skip during cascade updates
  if (req.context && (req.context as Record<string, unknown>).skipPathCascade) {
    return data
  }

  const oldParent = originalDoc?.parent
  const newParent = data?.parent

  // If parent hasn't changed, no cascade or validation needed
  if (oldParent === newParent) return data

  // Circular move protection: prevent moving a folder into its own descendant
  if (newParent != null && originalDoc?.id != null) {
    const allFolders = await req.payload.find({
      collection: 'media-folders',
      limit: 0,
      depth: 0,
      req,
    })

    const isCircular = FolderOperationsService.validateFolderMove(
      originalDoc.id,
      typeof newParent === 'number' ? newParent : Number(newParent),
      allFolders.docs,
    )

    if (!isCircular) {
      const { ValidationError } = await import('payload')
      throw new ValidationError({
        errors: [
          {
            message: 'Cannot move a folder into its own subfolder. This would create a circular reference.',
            path: 'parent',
          },
        ],
      })
    }
  }

  // Flag for cascade processing in afterChange
  if (req.context) {
    ;(req.context as Record<string, unknown>).folderParentChanged = true
    ;(req.context as Record<string, unknown>).oldPath = originalDoc?.path
  }

  return data
}

// ---------------------------------------------------------------------------
// Collection Config
// ---------------------------------------------------------------------------

export const MediaFolders: CollectionConfig = {
  slug: 'media-folders',
  labels: {
    singular: 'Media Folder',
    plural: 'Media Folders',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'path', 'depth', 'sortOrder', 'updatedAt'],
    group: 'Media',
    hidden: true,
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeChange: [
      computeFolderMetadata,
      validateUniqueNamePerParent,
      validateMoveAndCascade,
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        // Cascade path updates to descendants when a folder is moved
        if (
          operation === 'update' &&
          req.context &&
          (req.context as Record<string, unknown>).folderParentChanged
        ) {
          const oldPath = (req.context as Record<string, unknown>).oldPath as string | undefined
          if (oldPath && doc.path !== oldPath) {
            // Find all descendants by old path prefix
            const descendants = await req.payload.find({
              collection: 'media-folders',
              where: {
                path: { like: `${oldPath}/%` },
              },
              limit: 0, // all
              depth: 0,
              req,
            })

            // Update each descendant's path
            for (const descendant of descendants.docs) {
              const descendantPath = descendant.path as string
              const newDescendantPath = descendantPath.replace(oldPath, doc.path as string)
              const newDepth = newDescendantPath.split('/').filter(Boolean).length - 1

              await req.payload.update({
                collection: 'media-folders',
                id: descendant.id,
                data: {
                  path: newDescendantPath,
                  depth: newDepth,
                },
                depth: 0,
                req,
                context: { skipPathCascade: true }, // prevent infinite recursion
              })
            }
          }

          // Clean up context flags
          delete (req.context as Record<string, unknown>).folderParentChanged
          delete (req.context as Record<string, unknown>).oldPath
        }

        return doc
      },
    ],
  },
  endpoints: [
    // ── POST /api/media-folders/reorder ─────────────────────────────────
    {
      path: '/reorder',
      method: 'post',
      handler: async (req) => {
        const { payload, user } = req
        if (user?.collection !== 'users') {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let body: { parentId?: number | null; orderedIds?: number[] }
        try {
          body = (await req.json?.()) ?? req.data ?? req.body
        } catch {
          return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
        }

        const { parentId, orderedIds } = body
        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
          return Response.json(
            { error: 'Missing or invalid orderedIds array' },
            { status: 400 },
          )
        }

        try {
          await FolderOperationsService.reorderFolders(
            parentId ?? null,
            orderedIds,
            payload,
          )
          return Response.json({ success: true, reordered: orderedIds.length })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Reorder failed'
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
    // ── POST /api/media-folders/move ────────────────────────────────────
    {
      path: '/move',
      method: 'post',
      handler: async (req) => {
        const { payload, user } = req
        if (user?.collection !== 'users') {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let body: { folderId?: number; newParentId?: number | null }
        try {
          body = (await req.json?.()) ?? req.data ?? req.body
        } catch {
          return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
        }

        const { folderId, newParentId } = body
        if (typeof folderId !== 'number') {
          return Response.json(
            { error: 'Missing or invalid folderId' },
            { status: 400 },
          )
        }

        try {
          const result = await FolderOperationsService.moveFolder(
            folderId,
            newParentId ?? null,
            payload,
          )
          return Response.json(result)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Move failed'
          return Response.json({ error: message }, { status: 400 })
        }
      },
    },
    // ── POST /api/media-folders/safe-delete ─────────────────────────────
    {
      path: '/safe-delete',
      method: 'post',
      handler: async (req) => {
        const { payload, user } = req
        if (user?.collection !== 'users') {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let body: { folderId?: number }
        try {
          body = (await req.json?.()) ?? req.data ?? req.body
        } catch {
          return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
        }

        const { folderId } = body
        if (typeof folderId !== 'number') {
          return Response.json(
            { error: 'Missing or invalid folderId' },
            { status: 400 },
          )
        }

        try {
          const report = await FolderOperationsService.safeDeleteFolder(
            folderId,
            payload,
          )
          return Response.json(report)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Delete failed'
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
    // ── GET /api/media-folders/counts ───────────────────────────────────
    {
      path: '/counts',
      method: 'get',
      handler: async (req) => {
        const { payload, user } = req
        if (user?.collection !== 'users') {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const counts = await FolderOperationsService.getFolderMediaCounts(
            payload,
          )
          return Response.json(counts)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Count failed'
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  ],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Folder Name',
      admin: {
        description: 'Display name for this folder.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      label: 'Slug',
      admin: {
        readOnly: true,
        description: 'Auto-generated URL-safe identifier.',
      },
      index: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'media-folders',
      label: 'Parent Folder',
      admin: {
        description: 'Leave empty for a root-level folder.',
      },
      index: true,
    },
    {
      name: 'path',
      type: 'text',
      required: true,
      label: 'Full Path',
      admin: {
        readOnly: true,
        description:
          'Materialized path (e.g., /properties/luxury). Auto-computed from parent chain.',
      },
      index: true,
    },
    {
      name: 'depth',
      type: 'number',
      required: true,
      label: 'Depth',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Nesting level (0 = root folder).',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      label: 'Sort Order',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Custom sort order for manual drag-and-drop positioning within siblings.',
      },
      index: true,
    },
    {
      name: 'color',
      type: 'select',
      label: 'Color',
      defaultValue: 'default',
      options: [...FOLDER_COLORS],
      admin: {
        description: 'Optional color for visual organization.',
      },
    },
  ],
}
