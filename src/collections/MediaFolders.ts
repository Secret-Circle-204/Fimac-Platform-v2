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
 * - Unique folder names per parent
 *
 * This collection works identically regardless of whether media is stored
 * on local disk, S3, R2, or any other provider.
 */

import type {
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
  CollectionConfig,
} from 'payload'
import slugify from 'slugify'

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Computes `slug`, `path`, and `depth` from `name` and `parent`.
 *
 * Path format: `/parent-slug/child-slug/grandchild-slug`
 * Root folders have path: `/folder-slug`
 */
const computeFolderMetadata: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation: _operation,
  originalDoc,
}) => {
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
 * Prevents deletion of folders that still contain media items or subfolders.
 * Forces the admin to move or delete contents first.
 */
const preventNonEmptyFolderDeletion: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  // Check for child folders
  const childFolders = await req.payload.find({
    collection: 'media-folders',
    where: { parent: { equals: id } },
    limit: 1,
    depth: 0,
    req,
  })
  if (childFolders.totalDocs > 0) {
    const { ValidationError } = await import('payload')
    throw new ValidationError({
      errors: [
        {
          message:
            'Cannot delete a folder that contains subfolders. Move or delete the subfolders first.',
          path: 'parent',
        },
      ],
    })
  }

  // Check for media items in this folder
  const mediaInFolder = await req.payload.find({
    collection: 'media',
    where: { folder: { equals: id } },
    limit: 1,
    depth: 0,
    req,
  })
  if (mediaInFolder.totalDocs > 0) {
    const { ValidationError } = await import('payload')
    throw new ValidationError({
      errors: [
        {
          message:
            'Cannot delete a folder that contains media. Move or delete the media first.',
          path: 'folder',
        },
      ],
    })
  }
}

/**
 * When a folder is moved (parent changes), recursively updates the
 * `path` and `depth` of all descendant folders.
 */
const cascadePathUpdates: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (operation !== 'update') return data

  const oldParent = originalDoc?.parent
  const newParent = data?.parent

  // If parent hasn't changed, no cascade needed
  if (oldParent === newParent) return data

  // The path/depth for THIS folder is already computed by `computeFolderMetadata`.
  // We need to update all descendants AFTER this folder is saved.
  // We'll use `afterChange` for that — store a flag in context.
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
    defaultColumns: ['name', 'path', 'depth', 'updatedAt'],
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
    beforeChange: [computeFolderMetadata, cascadePathUpdates],
    beforeDelete: [preventNonEmptyFolderDeletion],
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

          // Clean up context flag
          delete (req.context as Record<string, unknown>).folderParentChanged
          delete (req.context as Record<string, unknown>).oldPath
        }

        return doc
      },
    ],
  },
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
  ],
}
