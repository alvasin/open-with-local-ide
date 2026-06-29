import {
  type NativeHostErrorData,
  type NativeHostErrorDetails,
  NativeHostErrorCode,
} from '#native-protocol'

export type NativeHostErrorPayload = NativeHostErrorData

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
