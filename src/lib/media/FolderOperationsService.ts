/**
 * FolderOperationsService — Core folder business logic
 *
 * Static methods for all folder operations that require complex logic:
 * - Moving folders (with cycle detection)
 * - Reordering siblings (drag-and-drop persistence)
 * - Safe deletion (media is NEVER deleted, only reassigned)
 * - Batch media counts
 * - Folder search
 * - Ancestor chain resolution
 * - Move validation (cycle detection)
 *
 * ABSOLUTE RULE: Folder deletion NEVER deletes media files.
 * Media is always preserved by reassigning to the parent folder
 * (or unfiled if the folder is root-level).
 */

import type { Payload } from 'payload'
import { sql } from 'drizzle-orm'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result of a safe folder deletion */
export interface FolderDeletionReport {
  /** ID of the root folder that was deleted */
  deletedFolderId: number
  /** Name of the root folder that was deleted */
  deletedFolderName: string
  /** Total number of folders deleted (including subfolders) */
  foldersDeleted: number
  /** Total number of media items reassigned to parent/unfiled */
  mediaReassigned: number
  /** Details of each reassignment */
  reassignments: Array<{
    /** Number of media items moved */
    count: number
    /** Source folder name */
    fromFolder: string
    /** Destination folder name (or "Unfiled") */
    toFolder: string
    /** Destination folder ID (null = unfiled) */
    toFolderId: number | null
  }>
}

/** Result of a folder move operation */
export interface FolderMoveResult {
  success: boolean
  folderId: number
  newParentId: number | null
  newPath: string
  descendantsUpdated: number
}

/** Minimal folder shape for pure functions (no Payload dependency) */
export interface MinimalFolder {
  id: number
  name: string
  parent?: number | null | { id: number }
  path: string
  depth: number
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class FolderOperationsService {
  /**
   * Moves a folder to a new parent.
   * Validates for cycles before performing the move.
   * Path/depth cascade is handled by the collection's afterChange hook.
   */
  static async moveFolder(
    folderId: number,
    newParentId: number | null,
    payload: Payload,
  ): Promise<FolderMoveResult> {
    // 1. Fetch all folders for cycle validation
    const allFolders = await payload.find({
      collection: 'media-folders',
      limit: 0,
      depth: 0,
    })

    // 2. Validate the move won't create a cycle
    if (newParentId !== null) {
      const isValid = FolderOperationsService.validateFolderMove(
        folderId,
        newParentId,
        allFolders.docs,
      )
      if (!isValid) {
        throw new Error(
          'Cannot move a folder into its own subfolder. This would create a circular reference.',
        )
      }
    }

    // 3. Prevent moving to self
    if (folderId === newParentId) {
      throw new Error('Cannot move a folder into itself.')
    }

    // 4. Perform the move — the collection hooks handle path/depth cascade
    const updatedDoc = await payload.update({
      collection: 'media-folders',
      id: folderId,
      data: {
        parent: newParentId,
      },
      depth: 0,
    })

    // 5. Count descendants that were updated (path starts with old path)
    const descendants = await payload.find({
      collection: 'media-folders',
      where: {
        path: { like: `${updatedDoc.path}/%` },
      },
      limit: 0,
      depth: 0,
    })

    return {
      success: true,
      folderId,
      newParentId,
      newPath: updatedDoc.path,
      descendantsUpdated: descendants.totalDocs,
    }
  }

  /**
   * Reorders folders under a given parent by updating their `sortOrder`.
   * Accepts an array of folder IDs in the desired order.
   */
  static async reorderFolders(
    parentId: number | null,
    orderedIds: number[],
    payload: Payload,
  ): Promise<void> {
    // Update each folder's sortOrder based on its position in the array
    const updates = orderedIds.map((id, index) =>
      payload.update({
        collection: 'media-folders',
        id,
        data: { sortOrder: index },
        depth: 0,
        context: { skipPathCascade: true }, // No path changes needed
      }),
    )

    await Promise.all(updates)
  }

  /**
   * Safely deletes a folder and all its subfolders.
   *
   * ABSOLUTE RULE: Media is NEVER deleted. All media items are
   * reassigned to the parent folder of the deleted folder.
   * If the folder is root-level, media becomes unfiled (folder = null).
   *
   * Process:
   * 1. Collect the entire subtree (this folder + all descendants)
   * 2. Sort bottom-up (deepest first) to ensure child folders are processed first
   * 3. For each folder: reassign its media to the target parent
   * 4. Delete all folders bottom-up
   * 5. Return a detailed report
   */
  static async safeDeleteFolder(
    folderId: number,
    payload: Payload,
  ): Promise<FolderDeletionReport> {
    // 1. Fetch the folder being deleted
    const folder = await payload.findByID({
      collection: 'media-folders',
      id: folderId,
      depth: 0,
    })

    if (!folder) {
      throw new Error(`Folder with ID ${folderId} not found.`)
    }

    // Determine the reassignment target: parent folder or null (unfiled)
    const reassignTargetId = typeof folder.parent === 'number'
      ? folder.parent
      : folder.parent != null && typeof folder.parent === 'object'
        ? folder.parent.id
        : null

    // Get the target folder name for the report
    let reassignTargetName = 'Unfiled'
    if (reassignTargetId !== null) {
      const parentFolder = await payload.findByID({
        collection: 'media-folders',
        id: reassignTargetId,
        depth: 0,
      })
      if (parentFolder) {
        reassignTargetName = parentFolder.name
      }
    }

    // 2. Find all descendant folders (using materialized path)
    const descendants = await payload.find({
      collection: 'media-folders',
      where: {
        path: { like: `${folder.path}/%` },
      },
      limit: 0,
      depth: 0,
    })

    // 3. Build the complete list: this folder + all descendants
    const allFoldersToDelete = [folder, ...descendants.docs]

    // Sort by depth descending (deepest first) for bottom-up processing
    allFoldersToDelete.sort((a, b) => (b.depth as number) - (a.depth as number))

    // 4. Reassign media from each folder and collect report data
    const reassignments: FolderDeletionReport['reassignments'] = []
    let totalMediaReassigned = 0

    for (const folderToProcess of allFoldersToDelete) {
      // Count media in this folder
      const mediaInFolder = await payload.find({
        collection: 'media',
        where: { folder: { equals: folderToProcess.id } },
        limit: 0,
        depth: 0,
      })

      if (mediaInFolder.totalDocs > 0) {
        // Reassign all media to the target parent folder efficiently using Drizzle bulk update
        const db = payload.db.drizzle
        await db.execute(
          sql`UPDATE media SET folder_id = ${reassignTargetId} WHERE folder_id = ${folderToProcess.id}`
        )

        reassignments.push({
          count: mediaInFolder.totalDocs,
          fromFolder: folderToProcess.name,
          toFolder: reassignTargetName,
          toFolderId: reassignTargetId,
        })

        totalMediaReassigned += mediaInFolder.totalDocs
      }
    }

    // 5. Delete all folders bottom-up (deepest first)
    for (const folderToDelete of allFoldersToDelete) {
      await payload.delete({
        collection: 'media-folders',
        id: folderToDelete.id,
        depth: 0,
      })
    }

    return {
      deletedFolderId: folderId,
      deletedFolderName: folder.name,
      foldersDeleted: allFoldersToDelete.length,
      mediaReassigned: totalMediaReassigned,
      reassignments,
    }
  }

  /**
   * Returns a map of folder ID → media count for all folders.
   * Uses a single query to count media items grouped by folder.
   */
  static async getFolderMediaCounts(
    payload: Payload,
  ): Promise<Record<string, number>> {
    // Run global counts concurrently with folder fetch
    const [allFolders, totalCount, unfiledCount] = await Promise.all([
      payload.find({
        collection: 'media-folders',
        limit: 0,
        depth: 0,
      }),
      payload.count({ collection: 'media' }),
      payload.count({
        collection: 'media',
        where: { folder: { exists: false } },
      }),
    ])

    const counts: Record<string, number> = {
      all: totalCount.totalDocs,
      unfiled: unfiledCount.totalDocs,
    }

    // Initialize all folders with 0
    for (const folder of allFolders.docs) {
      counts[String(folder.id)] = 0
    }

    // Use a single group by query via Drizzle
    const db = payload.db.drizzle
    const result = await db.execute(
      sql`SELECT folder_id, COUNT(*) as count FROM media WHERE folder_id IS NOT NULL GROUP BY folder_id`
    )

    for (const row of result.rows) {
      if (row.folder_id) {
        counts[String(row.folder_id)] = Number(row.count)
      }
    }

    return counts
  }

  /**
   * Searches folders by name using case-insensitive partial match.
   */
  static async searchFolders(
    query: string,
    payload: Payload,
  ): Promise<MinimalFolder[]> {
    const result = await payload.find({
      collection: 'media-folders',
      where: {
        name: { like: query },
      },
      limit: 50,
      depth: 0,
      sort: 'name',
    })

    return result.docs.map((doc) => ({
      id: doc.id,
      name: doc.name,
      parent: typeof doc.parent === 'number' ? doc.parent : null,
      path: doc.path,
      depth: doc.depth,
    }))
  }

  /**
   * Pure function: Validates that moving `folderId` to `targetParentId`
   * does not create a circular reference.
   *
   * Returns `true` if the move is valid (no cycle), `false` if it would create a cycle.
   */
  static validateFolderMove(
    folderId: number,
    targetParentId: number,
    allFolders: MinimalFolder[],
  ): boolean {
    // Can't move to self
    if (folderId === targetParentId) return false

    // Walk up from the target parent. If we encounter `folderId`, it's circular.
    const folderMap = new Map(allFolders.map((f) => [f.id, f]))
    let currentId: number | null = targetParentId

    while (currentId !== null) {
      if (currentId === folderId) return false // Cycle detected!

      const current = folderMap.get(currentId)
      if (!current) break // Orphan node, safe to proceed

      currentId = typeof current.parent === 'number'
        ? current.parent
        : current.parent != null && typeof current.parent === 'object'
          ? current.parent.id
          : null
    }

    return true // No cycle found
  }

  /**
   * Pure function: Returns the ancestor chain for a folder (for breadcrumbs).
   * The chain is ordered from root to the specified folder.
   */
  static getFolderAncestors(
    folderId: number,
    allFolders: MinimalFolder[],
  ): MinimalFolder[] {
    const folderMap = new Map(allFolders.map((f) => [f.id, f]))
    const ancestors: MinimalFolder[] = []

    let currentId: number | null = folderId

    while (currentId !== null) {
      const current = folderMap.get(currentId)
      if (!current) break

      ancestors.unshift(current) // Prepend to keep root-first order

      currentId = typeof current.parent === 'number'
        ? current.parent
        : current.parent != null && typeof current.parent === 'object'
          ? current.parent.id
          : null
    }

    return ancestors
  }
}
