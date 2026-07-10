'use client'

/**
 * FolderDeleteDialog — Confirmation dialog for safe folder deletion
 *
 * Shows the impact of deletion (subfolders removed, media reassigned)
 * and makes it crystal clear that media is NEVER deleted.
 *
 * Uses @radix-ui/react-alert-dialog for accessible confirmation.
 */

import React, { useState, useEffect, useCallback } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Trash2, AlertTriangle, Folder, Image as ImageIcon, ArrowRight, Loader2 } from 'lucide-react'
import type { FolderTreeNode, FolderDeletionReport } from './types'
import type { MediaLibraryHook } from './hooks/useMediaLibrary'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FolderDeleteDialogProps {
  /** The folder to delete (null = dialog closed) */
  folder: FolderTreeNode | null
  /** Library hook for performing the deletion */
  library: MediaLibraryHook
  /** Called when dialog closes (success or cancel) */
  onClose: () => void
}

/** Preview data shown before confirming deletion */
interface DeletionPreview {
  subfolderCount: number
  mediaCount: number
  reassignTarget: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FolderDeleteDialog({
  folder,
  library,
  onClose,
}: FolderDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [report, setReport] = useState<FolderDeletionReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<DeletionPreview | null>(null)

  // Compute preview data when the folder changes
  useEffect(() => {
    if (!folder) {
      setPreview(null)
      setReport(null)
      setError(null)
      return
    }

    // Count subfolders recursively
    const countDescendants = (node: FolderTreeNode): number => {
      let count = 0
      for (const child of node.children) {
        count += 1 + countDescendants(child)
      }
      return count
    }

    const subfolderCount = countDescendants(folder)

    // Count media: this folder + all descendants
    const collectIds = (node: FolderTreeNode): number[] => {
      const ids = [node.id]
      for (const child of node.children) {
        ids.push(...collectIds(child))
      }
      return ids
    }

    const allFolderIds = collectIds(folder)
    let totalMedia = 0
    for (const fid of allFolderIds) {
      totalMedia += library.folderMediaCounts[fid] ?? 0
    }

    // Determine reassignment target
    let reassignTarget = 'Unfiled'
    if (folder.parentId !== null) {
      const parentFolder = library.folders.find((f) => f.id === folder.parentId)
      if (parentFolder) {
        reassignTarget = parentFolder.name
      }
    }

    setPreview({
      subfolderCount,
      mediaCount: totalMedia,
      reassignTarget,
    })
  }, [folder, library.folderMediaCounts, library.folders])

  const handleDelete = useCallback(async () => {
    if (!folder) return

    setIsDeleting(true)
    setError(null)

    try {
      const deletionReport = await library.safeDeleteFolder(folder.id)
      setReport(deletionReport)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }, [folder, library])

  const handleClose = useCallback(() => {
    setReport(null)
    setError(null)
    setPreview(null)
    onClose()
  }, [onClose])

  if (!folder) return null

  return (
    <AlertDialog.Root open={folder !== null} onOpenChange={(open) => { if (!open) handleClose() }}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[101] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200 focus:outline-none">
          {report ? (
            /* ── Post-Deletion Report ───────────────────────────────────── */
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <AlertDialog.Title className="text-xl font-bold text-zinc-900 dark:text-white">
                    Folder Deleted
                  </AlertDialog.Title>
                  <AlertDialog.Description className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    &quot;{report.deletedFolderName}&quot; has been removed.
                  </AlertDialog.Description>
                </div>
              </div>

              <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Folders removed</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{report.foldersDeleted}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Media reassigned</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{report.mediaReassigned}</span>
                </div>

                {report.reassignments.length > 0 && (
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                    {report.reassignments.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <Folder className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium">{r.fromFolder}</span>
                        <ArrowRight className="w-3 h-3 shrink-0 text-zinc-400" />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{r.toFolder}</span>
                        <span className="ml-auto font-bold text-zinc-600 dark:text-zinc-300">
                          {r.count} {r.count === 1 ? 'file' : 'files'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <AlertDialog.Action
                  className="px-6 py-2.5 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 rounded-xl transition-all shadow-md active:scale-95"
                  onClick={handleClose}
                >
                  Done
                </AlertDialog.Action>
              </div>
            </>
          ) : (
            /* ── Pre-Deletion Confirmation ──────────────────────────────── */
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <AlertDialog.Title className="text-xl font-bold text-zinc-900 dark:text-white">
                    Delete &quot;{folder.name}&quot;?
                  </AlertDialog.Title>
                  <AlertDialog.Description className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    This action cannot be undone.
                  </AlertDialog.Description>
                </div>
              </div>

              {/* Impact Preview */}
              {preview && (
                <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mb-4">
                  {preview.subfolderCount > 0 && (
                    <div className="flex items-center gap-3 text-sm">
                      <Folder className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                      <span className="text-zinc-600 dark:text-zinc-400">
                        <strong className="text-zinc-900 dark:text-zinc-100">{preview.subfolderCount}</strong>
                        {' '}{preview.subfolderCount === 1 ? 'subfolder' : 'subfolders'} will also be removed
                      </span>
                    </div>
                  )}
                  {preview.mediaCount > 0 && (
                    <div className="flex items-center gap-3 text-sm">
                      <ImageIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                      <span className="text-zinc-600 dark:text-zinc-400">
                        <strong className="text-zinc-900 dark:text-zinc-100">{preview.mediaCount}</strong>
                        {' '}{preview.mediaCount === 1 ? 'file' : 'files'} will be moved to
                        {' '}<strong className="text-green-600 dark:text-green-400">&quot;{preview.reassignTarget}&quot;</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Safety Message */}
              <div className="flex items-start gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-xl p-4 mb-6">
                <ImageIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Your media files will <strong>NOT</strong> be deleted — they will be safely moved to
                  {preview?.reassignTarget === 'Unfiled'
                    ? ' the Unfiled section.'
                    : ` the "${preview?.reassignTarget}" folder.`}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <AlertDialog.Cancel
                  className="px-6 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                  disabled={isDeleting}
                >
                  Cancel
                </AlertDialog.Cancel>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Folder
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
