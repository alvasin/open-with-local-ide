import { z } from 'zod'
import { NativeHostErrorCode } from './errors.js'

/**
 * Transport envelope shared by every request.
 *
 * `protocolVersion` is transport metadata, not part of an action payload: the extension's
 * Native Messaging client adds it to every request, and the native host checks and strips it
 * before validating the action payload.
 */
export const nativeHostRequestEnvelopeSchema = z.object({
  action: z.string(),
  protocolVersion: z.unknown().optional(),
})

export const nativeHostErrorDetailsSchema = z.object({
  action: z.string().optional(),
  rootPath: z.string().optional(),
  repoPath: z.string().optional(),
  directoryPath: z.string().optional(),
  filePath: z.string().optional(),
  ide: z.string().optional(),
  message: z.string().optional(),
  expectedProtocolVersion: z.number().optional(),
  receivedProtocolVersion: z.unknown().optional(),
})

export const nativeHostErrorResponseSchema = z.object({
  ok: z.literal(false),
  errorCode: z.enum(NativeHostErrorCode),
  details: nativeHostErrorDetailsSchema.optional(),
})

export type NativeHostErrorDetails = z.infer<typeof nativeHostErrorDetailsSchema>
export type NativeHostErrorResponse = z.infer<typeof nativeHostErrorResponseSchema>

export type NativeHostErrorData = {
  code: NativeHostErrorCode
  details?: NativeHostErrorDetails
}
