import { launchTargetInIde } from '../../infrastructure/ide/ide-runner.js'
import type { NativeHostResponse } from '../../native-messaging/native-message.response.js'
import { validateOpenInIdeRequest } from './open-in-ide.validation.js'

export const handleOpenInIdeMessage = async (message: unknown): Promise<NativeHostResponse> => {
  await launchTargetInIde(validateOpenInIdeRequest(message))

  return { ok: true }
}
