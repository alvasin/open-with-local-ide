import type {
  NativeHostErrorData,
  NativeHostErrorResponse,
  OpenInIdeSuccessResponse,
  ScanRepositoriesSuccessResponse,
} from '@open-with-local-ide/protocol'

export type NativeHostResponse = OpenInIdeSuccessResponse | ScanRepositoriesSuccessResponse | NativeHostErrorResponse

export const createNativeHostErrorResponse = ({ code, details }: NativeHostErrorData): NativeHostErrorResponse => ({
  ok: false,
  errorCode: code,
  ...(details ? { details } : {}),
})
