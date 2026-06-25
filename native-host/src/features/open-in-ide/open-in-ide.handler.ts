import { launchTargetInIde } from '../../infrastructure/ide/ide-runner.js'
import type { NativeHostResponse } from '../../native-messaging/native-message.response.js'
import { validateOpenInIdeRequest } from './open-in-ide.validation.js'

export const handleOpenInIdeMessage = async (message: unknown): Promise<NativeHostResponse> => {
  const request = validateOpenInIdeRequest(message)
  await launchTargetInIde(request)

  return { ok: true }
}
