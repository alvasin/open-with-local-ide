import type { z } from 'zod'
import type { nativeOpenFileRequestSchema } from './open-file.validation.js'

export type OpenMode = 'file' | 'workspace'

export type NativeOpenFileRequest = z.infer<typeof nativeOpenFileRequestSchema>

export type ValidOpenFileRequest = NativeOpenFileRequest & {
  resolvedPath: string
}
