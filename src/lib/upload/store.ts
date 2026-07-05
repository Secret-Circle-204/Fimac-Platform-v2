import { create } from 'zustand'

export type SessionState = 
  | 'Idle' 
  | 'SelectingFiles' 
  | 'Ready' 
  | 'Uploading' 
  | 'Success' 
  | 'PartialSuccess' 
  | 'Failed' 
  | 'Cancelling' 
  | 'Cancelled' 
  | 'Destroyed'

export interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'validating' | 'pending' | 'uploading' | 'success' | 'error' | 'cancelled'
  error?: string
  uploadedDocId?: string | number
}

export interface UploadOptions {
  collection: string
  destination?: number | string | null // e.g., folderId
  metadata?: Record<string, unknown>
}

export interface UploadStoreState {
  state: SessionState
  files: UploadFile[]
  options: UploadOptions | null
  
  // Internal actions (used ONLY by the Manager, NOT the UI)
  _setState: (state: SessionState) => void
  _setFiles: (files: UploadFile[] | ((prev: UploadFile[]) => UploadFile[])) => void
  _setOptions: (options: UploadOptions | null) => void
  _reset: () => void
}

const initialState = {
  state: 'Idle' as SessionState,
  files: [],
  options: null,
}

export const useUploadStore = create<UploadStoreState>((set) => ({
  ...initialState,
  
  _setState: (state) => set({ state }),
  _setFiles: (files) => set((prev) => ({ 
    files: typeof files === 'function' ? files(prev.files) : files 
  })),
  _setOptions: (options) => set({ options }),
  _reset: () => set(initialState),
}))
