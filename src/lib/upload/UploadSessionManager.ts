import { useUploadStore, UploadOptions, UploadFile } from './store'
import { v4 as uuidv4 } from 'uuid'
import { validateMediaFile } from '@/lib/media/validation'

export class UploadSessionManager {
  /**
   * Starts a new upload session, setting the initial options.
   * Fails if a session is already active (unless forced).
   */
  static start(options: UploadOptions) {
    const { state, _setState, _setOptions, _reset } = useUploadStore.getState()
    
    if (state !== 'Idle' && state !== 'Destroyed') {
      console.warn('An upload session is already active. Destroying old session.')
      this.destroy()
    }
    
    _reset() // Ensure clean slate
    _setOptions(options)
    _setState('SelectingFiles')
  }

  /**
   * Adds files to the current session.
   * Transitions state to 'Ready' once files are added.
   */
  static addFiles(rawFiles: File[]) {
    const { state, _setState, _setFiles } = useUploadStore.getState()
    
    if (state !== 'SelectingFiles' && state !== 'Ready') {
      throw new Error(`Cannot add files in state: ${state}`)
    }

    const newFiles: UploadFile[] = rawFiles.map(file => ({
      id: uuidv4(),
      file,
      progress: 0,
      status: 'validating',
    }))

    _setFiles(prev => [...prev, ...newFiles])
    _setState('Ready')

    // Run client-side validation asynchronously
    Promise.all(newFiles.map(async (item) => {
      const result = await validateMediaFile(item.file)
      useUploadStore.getState()._setFiles(prev => prev.map(f => {
        if (f.id === item.id) {
          if (!result.valid) {
            return { ...f, status: 'error', error: result.errors.map(e => e.message).join('; ') }
          }
          return { ...f, status: 'pending' }
        }
        return f
      }))
    }))
  }

  /**
   * Removes a file from the queue before uploading begins.
   */
  static removeFile(fileId: string) {
    const { state, files, _setFiles, _setState } = useUploadStore.getState()
    
    if (state !== 'Ready' && state !== 'SelectingFiles') {
      console.warn(`Cannot remove file in state: ${state}`)
      return
    }

    const updatedFiles = files.filter(f => f.id !== fileId)
    _setFiles(updatedFiles)

    if (updatedFiles.length === 0) {
      _setState('SelectingFiles')
    }
  }

  /**
   * Starts the upload process for all pending files.
   */
  static async upload() {
    const { state, files, options, _setState, _setFiles } = useUploadStore.getState()

    if (state !== 'Ready' && state !== 'Failed' && state !== 'PartialSuccess') {
      console.warn(`Cannot start upload in state: ${state}`)
      return
    }

    if (!options) {
      throw new Error('Upload options are missing. Call start() first.')
    }

    _setState('Uploading')

    // Prepare pending files for upload (ignore files that failed validation or previous uploads)
    const filesToUpload = files.filter(f => f.status === 'pending')
    
    // Set them to uploading status
    _setFiles(prev => prev.map(f => 
      filesToUpload.some(tu => tu.id === f.id) 
        ? { ...f, status: 'uploading', progress: 0, error: undefined } 
        : f
    ))

    // Upload in small batches (e.g. 2 at a time) to balance speed and server stability
    const CONCURRENCY = 2
    for (let i = 0; i < filesToUpload.length; i += CONCURRENCY) {
      // Re-check state in case user cancelled during the queue
      if (useUploadStore.getState().state === 'Cancelling') break;

      const batch = filesToUpload.slice(i, i + CONCURRENCY)

      await Promise.all(batch.map(async (fileObj) => {
        try {
          const formData = new FormData()
          
          // Payload v3 expects metadata fields in a JSON string under '_payload'
          // IMPORTANT: Text fields (_payload) should be appended BEFORE file fields
          // for stream-based multipart parsers to process metadata before the file stream.
          const payloadData: Record<string, unknown> = {
            alt: fileObj.file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          }

          if (options.destination !== undefined && options.destination !== null) {
            payloadData.folder = options.destination
          }

          if (options.metadata) {
            Object.assign(payloadData, options.metadata)
          }

          formData.append('_payload', JSON.stringify(payloadData))
          
          // Append the file AFTER the payload
          formData.append('file', fileObj.file, fileObj.file.name)

          // Simulating upload progress using XMLHttpRequest for real progress events
          const result = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100)
                // Update progress in store
                useUploadStore.getState()._setFiles(prev => prev.map(f => 
                  f.id === fileObj.id ? { ...f, progress: percentComplete } : f
                ))
              }
            }

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const response = JSON.parse(xhr.responseText)
                  resolve(response)
                } catch (_e) {
                  resolve(xhr.responseText)
                }
              } else {
                let errorMessage = 'Upload failed'
                try {
                  const errorResponse = JSON.parse(xhr.responseText)
                  if (errorResponse.errors && errorResponse.errors.length > 0) {
                    errorMessage = errorResponse.errors[0].message
                  } else {
                    errorMessage = errorResponse.message || errorMessage
                  }
                } catch (_e) {
                  // Ignore parse error
                }
                reject(new Error(errorMessage))
              }
            }

            xhr.onerror = () => reject(new Error('Network error occurred'))
            
            xhr.open('POST', `/api/${options.collection}`)
            // We are using credentials to pass Payload cookies
            xhr.withCredentials = true 
            xhr.send(formData)
          })

          // Update successful file
          useUploadStore.getState()._setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { 
              ...f, 
              status: 'success', 
              progress: 100,
              uploadedDocId: (result as Record<string, unknown>).doc ? ((result as Record<string, { id?: string | number }>).doc.id) : undefined 
            } : f
          ))
        } catch (err: unknown) {
          // Update failed file
          useUploadStore.getState()._setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, status: 'error', error: err instanceof Error ? err.message : String(err) } : f
          ))
        }
      }))
    }

    // Evaluate final state
    const currentFiles = useUploadStore.getState().files
    const hasSuccess = currentFiles.some(f => f.status === 'success')
    const hasError = currentFiles.some(f => f.status === 'error')

    const currentState = useUploadStore.getState().state
    if (currentState === 'Cancelling' || currentState === 'Cancelled') {
      return // State already handled by cancel()
    }

    if (hasSuccess && !hasError) {
      _setState('Success')
    } else if (hasSuccess && hasError) {
      _setState('PartialSuccess')
    } else {
      _setState('Failed')
    }
  }

  /**
   * Retries uploading failed files.
   * If a fileId is provided, retries only that file. Otherwise, retries all failed files.
   */
  static retry(fileId?: string) {
    const { _setFiles } = useUploadStore.getState()
    
    _setFiles(prev => prev.map(f => {
      if (f.status === 'error' && (!fileId || f.id === fileId)) {
        return { ...f, status: 'pending', error: undefined, progress: 0 }
      }
      return f
    }))

    this.upload()
  }

  /**
   * Cancels ongoing uploads.
   */
  static cancel() {
    const { state, _setState, _setFiles } = useUploadStore.getState()
    
    if (state !== 'Uploading') {
      return
    }

    _setState('Cancelling')
    // Note: To truly abort XHR requests, we'd need to store the AbortController or XHR instance.
    // For now, we update the state and UI reacts. In a real heavy implementation, we'd abort the XHR.
    
    _setFiles(prev => prev.map(f => 
      f.status === 'uploading' ? { ...f, status: 'cancelled' } : f
    ))

    _setState('Cancelled')
  }

  /**
   * Destroys the session entirely. The UI should listen for this and close itself.
   */
  static destroy() {
    const { _setState, _reset } = useUploadStore.getState()
    _reset()
    _setState('Destroyed')
  }
}
