import {
  type NativeHostErrorData,
  type NativeHostErrorDetails,
  NativeHostErrorCode,
} from '@open-with-local-ide/protocol'

export class NativeHostError extends Error {
  public readonly code: NativeHostErrorCode
  public readonly details?: NativeHostErrorDetails

  constructor(payload: NativeHostErrorData) {
    super(payload.code)
    this.name = 'NativeHostError'
    this.code = payload.code

    if ('details' in payload) {
      this.details = payload.details
    }
  }
}
