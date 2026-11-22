export enum ExtensionNativeErrorCode {
  InvalidNativeHostResponse = 'INVALID_NATIVE_HOST_RESPONSE',
  NativeHostConnectionFailed = 'NATIVE_HOST_CONNECTION_FAILED',
}

export type ExtensionNativeErrorResponse = {
  ok: false
  errorCode: ExtensionNativeErrorCode
  error: string
}
