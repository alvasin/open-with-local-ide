import {
  type NativeHostErrorData,
  NativeHostErrorCode,
  type NativeHostErrorDetails,
  type ScanRepositoriesSuccessResponse,
} from '#native-protocol'
import { NativeHostError } from '../shared/errors/native-host.error.js'

export type NativeHostResponse =
  | { ok: true }
  | ScanRepositoriesSuccessResponse
  | {
      ok: false
      errorCode: NativeHostErrorCode
      error: string
      details?: NativeHostErrorDetails
    }

export const createNativeHostErrorResponse = (
  payload: NativeHostErrorData & { message?: string },
): NativeHostResponse => {
  const error = new NativeHostError(payload)

  return {
    ok: false,
    errorCode: error.code,
    error: error.safeMessage,
    ...(error.details ? { details: error.details } : {}),
  }
}
