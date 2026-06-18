import { openFileInIde } from '../ide/ide-runner.js'
import { NativeHostErrorCode } from '#native-protocol'
import {
  createNativeHostErrorResponse,
  type NativeHostResponse,
} from '../native-messaging/native-message.types.js'
import type { NativeOpenFileRequest } from './open-file.types.js'
import { validateOpenFileRequest } from './open-file.validation.js'

const isOpenFileRequest = (message: unknown): message is NativeOpenFileRequest =>
  message !== null &&
  typeof message === 'object' &&
  'action' in message &&
  message.action === 'openFile'

export const handleNativeMessage = async (message: unknown): Promise<NativeHostResponse> => {
  if (!message || typeof message !== 'object') {
    return createNativeHostErrorResponse({ code: NativeHostErrorCode.InvalidMessage })
  }

  if (!isOpenFileRequest(message)) {
    return createNativeHostErrorResponse({ code: NativeHostErrorCode.UnsupportedAction })
  }

  const request = validateOpenFileRequest(message)
  await openFileInIde(request)

  return { ok: true }
}
