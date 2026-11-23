import { nativeHostErrorResponseSchema, type NativeHostErrorDetails } from '@open-with-local-ide/protocol'
import type { ZodType } from 'zod'
import { ExtensionNativeErrorCode } from './native-error.types'

/** Any failed native host call: an error from the host itself or from talking to it. */
export type NativeHostFailure = { ok: false; errorCode: string; details?: NativeHostErrorDetails }
export type NativeHostResult<TSuccess> = TSuccess | NativeHostFailure

export const parseNativeHostResponse = <TSuccess>(
  response: unknown,
  successSchema: ZodType<TSuccess>,
): NativeHostResult<TSuccess> => {
  const success = successSchema.safeParse(response)
  if (success.success) return success.data

  const failure = nativeHostErrorResponseSchema.safeParse(response)
  if (failure.success) return failure.data

  return { ok: false, errorCode: ExtensionNativeErrorCode.InvalidNativeHostResponse }
}
