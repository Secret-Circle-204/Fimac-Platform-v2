/**
 * Client-Side Media Validation
 *
 * Pure, isomorphic validation utilities that run in the browser BEFORE upload.
 * These provide instant feedback to the user — invalid files never reach the server.
 *
 * IMPORTANT: Client validation is for UX only. The server (`beforeValidate` hook)
 * is the final authority and enforces the same rules independently.
 */

import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_DIMENSION_PX,
  MAX_IMAGE_FILE_SIZE_BYTES,
  MIN_IMAGE_DIMENSION_PX,
  formatFileSize,
} from './config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ValidationErrorCode =
  | 'FILE_TOO_LARGE'
  | 'FILE_TOO_SMALL'
  | 'INVALID_MIME_TYPE'
  | 'DIMENSIONS_TOO_LARGE'
  | 'DIMENSIONS_TOO_SMALL'
  | 'UNREADABLE_IMAGE'

export interface MediaValidationError {
  code: ValidationErrorCode
  message: string
  /** The field/attribute that failed (e.g., 'fileSize', 'mimeType', 'width') */
  field: string
}

export interface FileValidationResult {
  file: File
  valid: boolean
  errors: MediaValidationError[]
}

// ---------------------------------------------------------------------------
// Synchronous Validators (no image decode needed)
// ---------------------------------------------------------------------------

/**
 * Validates file size against the configured maximum.
 */
export function validateFileSize(file: File): MediaValidationError | null {
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return {
      code: 'FILE_TOO_LARGE',
      field: 'fileSize',
      message: `File size (${formatFileSize(file.size)}) exceeds the maximum of ${formatFileSize(MAX_IMAGE_FILE_SIZE_BYTES)}.`,
    }
  }
  if (file.size === 0) {
    return {
      code: 'FILE_TOO_SMALL',
      field: 'fileSize',
      message: 'File is empty (0 bytes).',
    }
  }
  return null
}

/**
 * Validates file MIME type against the allowed list.
 */
export function validateMimeType(file: File): MediaValidationError | null {
  const allowed: readonly string[] = ALLOWED_IMAGE_MIME_TYPES
  if (!allowed.includes(file.type)) {
    return {
      code: 'INVALID_MIME_TYPE',
      field: 'mimeType',
      message: `File type "${file.type || 'unknown'}" is not allowed. Accepted types: ${allowed.join(', ')}.`,
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Asynchronous Validators (require image decode)
// ---------------------------------------------------------------------------

/**
 * Reads image dimensions by loading it into a browser Image element.
 * Returns `null` if the file cannot be decoded as an image.
 */
function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    // Only attempt for image MIME types
    if (!file.type.startsWith('image/')) {
      resolve(null)
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }

    img.src = url
  })
}

/**
 * Validates image dimensions against configured min/max limits.
 * Must be called in a browser context (uses Image element).
 */
export async function validateDimensions(
  file: File,
): Promise<MediaValidationError[]> {
  const dimensions = await readImageDimensions(file)
  const errors: MediaValidationError[] = []

  // SVGs don't have meaningful raster dimensions
  if (file.type === 'image/svg+xml') {
    return errors
  }

  if (dimensions === null) {
    errors.push({
      code: 'UNREADABLE_IMAGE',
      field: 'dimensions',
      message: 'Could not read image dimensions. The file may be corrupted.',
    })
    return errors
  }

  if (
    dimensions.width > MAX_IMAGE_DIMENSION_PX ||
    dimensions.height > MAX_IMAGE_DIMENSION_PX
  ) {
    errors.push({
      code: 'DIMENSIONS_TOO_LARGE',
      field: 'dimensions',
      message: `Image dimensions (${dimensions.width}×${dimensions.height}) exceed the maximum of ${MAX_IMAGE_DIMENSION_PX}×${MAX_IMAGE_DIMENSION_PX} pixels.`,
    })
  }

  if (
    dimensions.width < MIN_IMAGE_DIMENSION_PX ||
    dimensions.height < MIN_IMAGE_DIMENSION_PX
  ) {
    errors.push({
      code: 'DIMENSIONS_TOO_SMALL',
      field: 'dimensions',
      message: `Image dimensions (${dimensions.width}×${dimensions.height}) are below the minimum of ${MIN_IMAGE_DIMENSION_PX}×${MIN_IMAGE_DIMENSION_PX} pixels.`,
    })
  }

  return errors
}

// ---------------------------------------------------------------------------
// Composite Validator
// ---------------------------------------------------------------------------

/**
 * Runs all validations on a single file:
 * 1. File size (sync)
 * 2. MIME type (sync)
 * 3. Image dimensions (async — browser only)
 *
 * Returns a result object indicating whether the file is valid and
 * listing all validation errors found.
 */
export async function validateMediaFile(
  file: File,
): Promise<FileValidationResult> {
  const errors: MediaValidationError[] = []

  // Synchronous checks first (fast bail-out)
  const sizeError = validateFileSize(file)
  if (sizeError) errors.push(sizeError)

  const mimeError = validateMimeType(file)
  if (mimeError) errors.push(mimeError)

  // If MIME type is invalid, skip dimension check (can't decode non-images)
  if (!mimeError) {
    const dimensionErrors = await validateDimensions(file)
    errors.push(...dimensionErrors)
  }

  return {
    file,
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validates multiple files in parallel.
 * Returns results in the same order as the input array.
 */
export async function validateMediaFiles(
  files: File[],
): Promise<FileValidationResult[]> {
  return Promise.all(files.map(validateMediaFile))
}
