/**
 * Media Collection — Enhanced Upload Collection
 *
 * Extends Payload's built-in upload system with:
 * - Virtual folder assignment (DB-only, no FS coupling)
 * - Tags for filtering and search
 * - Caption field for descriptions
 * - Original filename preservation
 * - Server-side validation hooks (file size, MIME type, dimensions)
 * - Optimized image processing (WebP @ quality 83)
 *
 * Storage is abstracted — this collection works identically on
 * local disk, S3, R2, GCS, or any other Payload storage adapter.
 */

import type { CollectionConfig } from 'payload'

import {
  IMAGE_FORMAT_OPTIONS,
  IMAGE_RESIZE_OPTIONS,
  IMAGE_SIZES,
  PAYLOAD_MIME_TYPES_GLOB,
} from '@/lib/media/config'
import { mediaBeforeChange, mediaBeforeValidate, mediaBeforeOperation } from './hooks'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['filename', 'displayName', 'folder', 'mimeType', 'filesize', 'updatedAt'],
    group: 'Media',
    components: {
      views: {
        list: {
          Component: '@/components/admin/media-library/MediaLibraryView',
        },
      },
    },
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeOperation: [mediaBeforeOperation],
    beforeValidate: [mediaBeforeValidate],
    beforeChange: [mediaBeforeChange],
  },
  fields: [
    // --- Core fields ---
    {
      name: 'displayName',
      type: 'text',
      label: 'Display Name / Title',
      admin: {
        description: 'The visual name of the file shown in the Media Library UI.',
      },
    },
    {
      name: 'storageKey',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description:
          'The physical storage identifier for this media file (immutable after creation).',
        readOnly: true,
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text',
      admin: {
        description:
          'Descriptive alternative text for accessibility and SEO. Describe what the image shows.',
      },
    },

    // --- Organization fields ---
    {
      name: 'folder',
      type: 'relationship',
      relationTo: 'media-folders',
      label: 'Folder',
      admin: {
        description: 'Assign this media item to a virtual folder for organization.',
        position: 'sidebar',
      },
      index: true,
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: {
        description: 'Add tags for easier filtering and search.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          label: 'Tag',
        },
      ],
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Caption',
      admin: {
        description: 'Optional descriptive caption for this media item.',
      },
    },

    // --- System fields (auto-populated, hidden from admin) ---
    {
      name: 'originalFilename',
      type: 'text',
      label: 'Original Filename',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'The original filename before Payload processing.',
      },
    },
  ],
  upload: {
    /**
     * Static directory for local file storage.
     * Uses a relative path so Payload resolves it from the project root.
     * When a storage adapter plugin is active (S3, R2, etc.),
     * this directory is used as a fallback/staging area only.
     */
    staticDir: 'public/media',

    imageSizes: [...IMAGE_SIZES],
    adminThumbnail: 'thumbnail',
    mimeTypes: [...PAYLOAD_MIME_TYPES_GLOB],
    focalPoint: true,
    formatOptions: IMAGE_FORMAT_OPTIONS,
    resizeOptions: IMAGE_RESIZE_OPTIONS,
  },
}
