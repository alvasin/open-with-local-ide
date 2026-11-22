import {
  NativeHostErrorCode,
  nativeHostRequestEnvelopeSchema,
  PROTOCOL_VERSION,
} from '@open-with-local-ide/protocol'
import {
  createNativeHostErrorResponse,
  type NativeHostResponse,
} from './native-message.response.js'
import { handleOpenInIdeMessage } from '../features/open-in-ide/index.js'
import { scanRepositories } from '../features/repository-scanning/index.js'

export const handleNativeMessage = async (message: unknown): Promise<NativeHostResponse> => {
  const envelope = nativeHostRequestEnvelopeSchema.safeParse(message)
  if (!envelope.success) {
    return createNativeHostErrorResponse({ code: NativeHostErrorCode.InvalidMessage })
  }

  const { action, protocolVersion } = envelope.data
  if (protocolVersion !== PROTOCOL_VERSION) {
    return createNativeHostErrorResponse({
      code: NativeHostErrorCode.ProtocolVersionMismatch,
      details: {
        action,
        expectedProtocolVersion: PROTOCOL_VERSION,
        receivedProtocolVersion: protocolVersion,
      },
    })
  }

  // `protocolVersion` is transport metadata; action schemas validate only the payload.
  const payload = { ...(message as Record<string, unknown>) }
  delete payload.protocolVersion

  if (action === 'openInIde') return handleOpenInIdeMessage(payload)
  if (action === 'scanRepositories') return scanRepositories(payload)

  return createNativeHostErrorResponse({
    code: NativeHostErrorCode.UnsupportedAction,
    details: { action },
  })
}
