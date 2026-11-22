import type {
  NativeHostErrorData,
  NativeHostErrorResponse,
  OpenInIdeSuccessResponse,
  ScanRepositoriesSuccessResponse,
} from '@open-with-local-ide/protocol'
import { NativeHostError } from '../shared/errors/native-host.error.js'

export type NativeHostResponse =
  OpenInIdeSuccessResponse | ScanRepositoriesSuccessResponse | NativeHostErrorResponse

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
