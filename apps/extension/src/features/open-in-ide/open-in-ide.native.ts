import { openInIdeSuccessResponseSchema, type OpenInIdeRequest } from '@open-with-local-ide/protocol'
import type { OpenInIdeResponse } from './open-in-ide.types'
import { requestNativeHost } from '@/native-messaging'

export const openInIde = async (request: OpenInIdeRequest): Promise<OpenInIdeResponse> =>
  requestNativeHost(request, openInIdeSuccessResponseSchema)
