import { openFileInIde } from '../../infrastructure/ide/ide-runner.js'
import type { NativeHostResponse } from '../../native-messaging/native-message.response.js'
import type { NativeOpenFileRequest } from './open-file.types.js'
import { validateOpenFileRequest } from './open-file.validation.js'

export const handleOpenFileMessage = async (message: unknown): Promise<NativeHostResponse> => {
  const request = validateOpenFileRequest(message as NativeOpenFileRequest)
  await openFileInIde(request)

  return { ok: true }
}
