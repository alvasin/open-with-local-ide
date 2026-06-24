import { NativeHostErrorCode } from '#native-protocol'
import {
  createNativeHostErrorResponse,
  type NativeHostResponse,
} from './native-message.response.js'
import { handleOpenFileMessage } from '../features/open-file/open-file.handler.js'
import { scanRepositories } from '../features/repository-scanning/scan-repositories.handler.js'

const readAction = (message: unknown): string | undefined => {
  if (!message || typeof message !== 'object' || !('action' in message)) return undefined
  return typeof message.action === 'string' ? message.action : undefined
}

export const handleNativeMessage = async (message: unknown): Promise<NativeHostResponse> => {
  const action = readAction(message)
  if (!action) {
    return createNativeHostErrorResponse({ code: NativeHostErrorCode.InvalidMessage })
  }

  if (action === 'openFile') return handleOpenFileMessage(message)
  if (action === 'scanRepositories') return scanRepositories(message)

  return createNativeHostErrorResponse({
    code: NativeHostErrorCode.UnsupportedAction,
    details: { action },
  })
}
