import { z } from 'zod'
import { NativeHostErrorCode } from './errors.js'

export const nativeHostErrorDetailsSchema = z.object({
  action: z.string().optional(),
  rootPath: z.string().optional(),
  repoPath: z.string().optional(),
  directoryPath: z.string().optional(),
  filePath: z.string().optional(),
  ide: z.string().optional(),
  message: z.string().optional(),
})

export const nativeHostErrorResponseSchema = z.object({
  ok: z.literal(false),
  errorCode: z.enum(NativeHostErrorCode),
  error: z.string(),
  details: nativeHostErrorDetailsSchema.optional(),
})

export type NativeHostErrorDetails = z.infer<typeof nativeHostErrorDetailsSchema>
export type NativeHostErrorResponse = z.infer<typeof nativeHostErrorResponseSchema>

export type NativeHostErrorData = {
  code: NativeHostErrorCode
  details?: NativeHostErrorDetails
}
