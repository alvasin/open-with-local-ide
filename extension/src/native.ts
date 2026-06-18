import { NativeHostErrorCode, type NativeHostErrorDetails } from '@native-protocol'
import type { NativeOpenFileRequest, NativeOpenFileResponse } from '@/features/open-file/types'
import { ExtensionNativeErrorCode as ExtensionNativeErrorCodeValue } from '@/features/open-file/types'
import { isRecord } from '@/shared/record/record.guard'
import { promisify } from '@/utils/promisify'

const NATIVE_HOST_NAME = 'com.local.repo_ide_opener'

const sendNativeOpenFileMessage = async (request: NativeOpenFileRequest): Promise<unknown> =>
  promisify((callback) => {
    chrome.runtime.sendNativeMessage(NATIVE_HOST_NAME, request, callback)
  })

const isNativeHostErrorCode = (value: unknown): value is NativeHostErrorCode =>
  typeof value === 'string' &&
  Object.values(NativeHostErrorCode).includes(value as NativeHostErrorCode)

const readNativeHostDetails = (value: unknown): NativeHostErrorDetails | undefined =>
  isRecord(value) ? value : undefined

type NativeHostErrorResponseLike = {
  ok: false
  errorCode: NativeHostErrorCode
  error: string
  details?: unknown
}

const isNativeHostErrorResponseLike = (value: unknown): value is NativeHostErrorResponseLike =>
  isRecord(value) &&
  value.ok === false &&
  isNativeHostErrorCode(value.errorCode) &&
  typeof value.error === 'string'

export const openFileInIde = async (
  request: NativeOpenFileRequest,
): Promise<NativeOpenFileResponse> => {
  try {
    const response = await sendNativeOpenFileMessage(request)

    if (isRecord(response) && response.ok === true) return { ok: true }

    const isValidNativeHostErrorResponse = isNativeHostErrorResponseLike(response)

    if (isValidNativeHostErrorResponse) {
      return {
        ok: false,
        errorCode: response.errorCode,
        error: response.error,
        details: readNativeHostDetails(response.details),
      }
    }

    return {
      ok: false,
      errorCode: ExtensionNativeErrorCodeValue.InvalidNativeHostResponse,
      error: 'Native host returned an invalid response',
    }
  } catch (error) {
    return {
      ok: false,
      errorCode: ExtensionNativeErrorCodeValue.NativeHostConnectionFailed,
      error: error instanceof Error ? error.message : 'Failed to send native message',
    }
  }
}
