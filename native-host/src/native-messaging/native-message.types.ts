import {
  NativeHostErrorCode,
  type NativeHostErrorData,
  type NativeHostErrorDetails,
} from '#native-protocol'

export type NativeHostErrorPayload = NativeHostErrorData

export type NativeHostResponse =
  | { ok: true }
  | {
      ok: false
      errorCode: NativeHostErrorCode
      error: string
      details?: NativeHostErrorDetails
    }

export class NativeHostError extends Error {
  public readonly code: NativeHostErrorCode
  public readonly safeMessage: string
  public readonly details?: NativeHostErrorDetails

  constructor(payload: NativeHostErrorPayload & { message?: string }) {
    const safeMessage = payload.message ?? payload.code

    super(safeMessage)
    this.name = 'NativeHostError'
    this.code = payload.code
    this.safeMessage = safeMessage

    if ('details' in payload) {
      this.details = payload.details
    }
  }
}

export const createNativeHostErrorResponse = (
  payload: NativeHostErrorPayload & { message?: string },
): NativeHostResponse => {
  const error = new NativeHostError(payload)

  return {
    ok: false,
    errorCode: error.code,
    error: error.safeMessage,
    ...(error.details ? { details: error.details } : {}),
  }
}
