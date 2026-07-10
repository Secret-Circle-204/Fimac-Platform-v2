'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useField, useConfig, useListDrawer } from '@payloadcms/ui'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import { X, GripVertical, Image as ImageIcon, Plus } from 'lucide-react'
import type { UploadFieldClientProps } from 'payload'

// Individual Sortable Item Component
function SortableMediaItem({ 
  id, 
  mediaDoc, 
  onRemove,
  reportBrokenImage
}: { 
  id: string | number, 
  mediaDoc: Record<string, unknown> | undefined, 
  onRemove: (id: string | number) => void,
  reportBrokenImage: (id: string | number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  const sizes = mediaDoc?.sizes as Record<string, { url?: string }> | undefined
  const displayName = (mediaDoc?.displayName as string) || (mediaDoc?.filename as string)
  const url = sizes?.thumbnail?.url || (mediaDoc?.url as string)

  if (!mediaDoc) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative group bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden flex flex-col h-40 items-center justify-center animate-pulse"
      >
        <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
        <p className="mt-2 text-xs text-zinc-500">Loading...</p>
        
        {/* Allow removal even while loading */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove(id)
          }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 dark:bg-black/90 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 text-zinc-600 dark:text-zinc-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10 pointer-events-auto"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (mediaDoc._missing || mediaDoc.healthStatus === 'missing' || mediaDoc.healthStatus === 'broken') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative group bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 shadow-sm rounded-xl overflow-hidden flex flex-col h-40 items-center justify-center"
      >
        <div className="w-8 h-8 flex items-center justify-center bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full mb-2">
          <X className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-red-600 dark:text-red-400">Missing Asset</p>
        <p className="text-[10px] text-red-500 mt-1 mb-2 px-2 text-center">This media was deleted</p>
        
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove(id)
          }}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-[10px] font-bold rounded transition-colors pointer-events-auto shadow-sm"
        >
          Remove Reference
        </button>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-zinc-50 dark:bg-zinc-900 border ${isDragging ? 'border-blue-500 shadow-xl scale-105' : 'border-zinc-200 dark:border-zinc-800 shadow-sm'} rounded-xl overflow-hidden transition-all duration-200 flex flex-col h-40`}
    >
      <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 relative flex items-center justify-center">
        {url ? (
          <Image 
            src={url} 
            alt={(mediaDoc?.alt as string) || displayName || 'Media'} 
            fill 
            className="object-cover" 
            sizes="200px" 
            onError={() => reportBrokenImage(id)}
          />
        ) : (
          <ImageIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
        )}
        
        {/* Actions Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
        
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove(id)
          }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 dark:bg-black/90 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 text-zinc-600 dark:text-zinc-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10 pointer-events-auto"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 w-7 h-7 bg-white/90 dark:bg-black/90 text-zinc-600 dark:text-zinc-400 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-grab active:cursor-grabbing pointer-events-auto hover:text-blue-500"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </div>
      
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate" title={displayName}>
          {displayName}
        </p>
      </div>
    </div>
  )
}

export const CustomMediaFieldClient: React.FC<UploadFieldClientProps> = ({ path, field }) => {
  const { value, setValue } = useField<(string | number)[]>({ path })
  const [mediaDocs, setMediaDocs] = useState<Record<string, Record<string, unknown>>>({})
  const { config } = useConfig()
  const serverURL = config?.serverURL || ''
  const api = config?.routes?.api || '/api'

  // Debounced broken image reporter
  const brokenImageQueue = React.useRef<Set<string | number>>(new Set())
  const brokenImageTimeout = React.useRef<NodeJS.Timeout | null>(null)

  const reportBrokenImage = useCallback((id: string | number) => {
    brokenImageQueue.current.add(id)

    if (brokenImageTimeout.current) {
      clearTimeout(brokenImageTimeout.current)
    }

    brokenImageTimeout.current = setTimeout(async () => {
      const ids = Array.from(brokenImageQueue.current)
      if (ids.length === 0) return

      try {
        await fetch(`${serverURL}${api}/media/verify-health-batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids })
        })
        brokenImageQueue.current.clear()
        
        // Mark locally in state so they re-render as offline immediately
        setMediaDocs(prev => {
          const next = { ...prev }
          ids.forEach(brokenId => {
            if (next[String(brokenId)]) {
              next[String(brokenId)] = { ...next[String(brokenId)], healthStatus: 'missing' }
            }
          })
          return next
        })
      } catch (err) {
        console.error('Failed to report broken images', err)
      }
    }, 1500)
  }, [serverURL, api])

  // Ensure value is an array of IDs
  const items = React.useMemo(() => {
    return (Array.isArray(value) ? value : (value ? [value] : [])) as (string | number)[]
  }, [value])
  
  // Use a ref to keep track of items synchronously to avoid stale closures during rapid multiple calls
  const itemsRef = React.useRef<(string | number)[]>(items)
  useEffect(() => {
    itemsRef.current = items
  }, [items])

  // Hook into Payload's ListDrawer for selecting media
  const [ListDrawer, ListDrawerToggler, { closeDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
    selectedCollection: 'media',
  })

  // Handle selection from drawer
  const onSelect = useCallback(
    ({ docID }: { docID: string | number }) => {
      // Postgres IDs are often numbers. Parse it if it's a numeric string.
      const parsedId = typeof docID === 'string' && !isNaN(Number(docID)) ? Number(docID) : docID
      
      // Check using strict equality, converting both to strings to be safe against mixed types
      const isAlreadySelected = itemsRef.current.some(item => String(item) === String(parsedId))
      
      if (!isAlreadySelected) {
        const newItems = [...itemsRef.current, parsedId]
        itemsRef.current = newItems
        setValue(newItems)
      }
      closeDrawer()
    },
    [setValue, closeDrawer]
  )

  // Fetch media documents whenever items change (to get displayName and URL)
  useEffect(() => {
    const fetchDocs = async () => {
      const missingIds = items.filter(id => id && !mediaDocs[String(id)])
      if (missingIds.length === 0) return

      try {
        // N+1 Optimization: Batch fetch all missing media docs in ONE single request
        const query = missingIds.map((id, index) => `where[id][in][${index}]=${id}`).join('&')
        const limit = missingIds.length // Ensure we fetch all of them in one go
        
        const res = await fetch(`${serverURL}${api}/media?${query}&depth=0&limit=${limit}`)
        const data = await res.json()
        
        if (data && Array.isArray(data.docs)) {
          const newDocs = { ...mediaDocs }
          
          // Pre-mark all requested IDs as missing
          missingIds.forEach(id => {
            newDocs[String(id)] = { _missing: true }
          })

          // Overwrite with actual docs if found
          data.docs.forEach((doc: Record<string, unknown>) => {
            if (doc?.id) {
              newDocs[String(doc.id)] = doc
            }
          })
          setMediaDocs(newDocs)
        }
      } catch (err) {
        console.error('Failed to fetch media docs:', err)
      }
    }
    
    fetchDocs()
  }, [items, mediaDocs, serverURL, api])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: import('@dnd-kit/core').DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id && over) {
      const oldIndex = items.findIndex((id) => String(id) === String(active.id))
      const newIndex = items.findIndex((id) => String(id) === String(over.id))
      if (oldIndex !== -1 && newIndex !== -1) {
        setValue(arrayMove(items, oldIndex, newIndex))
      }
    }
  }

  const handleRemove = (idToRemove: string | number) => {
    // Both sides cast to String to handle number vs string mismatch
    setValue(items.filter((id) => String(id) !== String(idToRemove)))
  }

  return (
    <div className="space-y-4 my-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {field.label ? (typeof field.label === 'string' ? field.label : 'Photos') : 'Photos'}
        </label>
        
        <ListDrawerToggler className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Add Media
        </ListDrawerToggler>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <SortableContext 
            items={items}
            strategy={rectSortingStrategy}
          >
            {items.map(id => (
              <SortableMediaItem 
                key={String(id)} 
                id={id} 
                mediaDoc={mediaDocs[String(id)]} 
                onRemove={handleRemove}
                reportBrokenImage={reportBrokenImage}
              />
            ))}
          </SortableContext>
          
          {items.length === 0 && (
            <div className="col-span-full py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
              <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">No photos selected</p>
              <p className="text-xs mt-1 opacity-70">Click Add Media to select photos</p>
            </div>
          )}
        </div>
      </DndContext>
      
      {/* Payload's native Drawer for media selection */}
      <ListDrawer onSelect={onSelect} />
    </div>
  )
}
