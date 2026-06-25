import type { OpenInIdeRequest } from '@native-protocol'
import type { OpenInIdeResponse } from './open-in-ide.types'
import { sendNativeMessage } from '@/native-messaging/native-client'
import { ExtensionNativeErrorCode } from '@/native-messaging/native-error.types'
import {
  isNativeHostErrorResponseLike,
  readNativeHostDetails,
} from '@/native-messaging/native-response'
import { isRecord } from '@/shared/record/record.guard'

export const openInIde = async (request: OpenInIdeRequest): Promise<OpenInIdeResponse> => {
  try {
    const response = await sendNativeMessage(request)

    if (isRecord(response) && response.ok === true) return { ok: true }

    if (isNativeHostErrorResponseLike(response)) {
      return {
        ok: false,
        errorCode: response.errorCode,
        error: response.error,
        details: readNativeHostDetails(response.details),
      }
    }

    return {
      ok: false,
      errorCode: ExtensionNativeErrorCode.InvalidNativeHostResponse,
      error: 'Native host returned an invalid response',
    }
  } catch (error) {
    return {
      ok: false,
      errorCode: ExtensionNativeErrorCode.NativeHostConnectionFailed,
      error: error instanceof Error ? error.message : 'Failed to send native message',
    }
  }
}
