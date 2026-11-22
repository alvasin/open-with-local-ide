import {
  nativeHostErrorResponseSchema,
  type NativeHostErrorResponse,
} from '@open-with-local-ide/protocol'
import type { ZodType } from 'zod'
import { ExtensionNativeErrorCode, type ExtensionNativeErrorResponse } from './native-error.types'

export type NativeHostResult<TSuccess> =
  TSuccess | NativeHostErrorResponse | ExtensionNativeErrorResponse

export const parseNativeHostResponse = <TSuccess>(
  response: unknown,
  successSchema: ZodType<TSuccess>,
): NativeHostResult<TSuccess> => {
  const success = successSchema.safeParse(response)
  if (success.success) return success.data

  const failure = nativeHostErrorResponseSchema.safeParse(response)
  if (failure.success) return failure.data

  return {
    ok: false,
    errorCode: ExtensionNativeErrorCode.InvalidNativeHostResponse,
    error: 'Native host returned an invalid response',
  }
}
