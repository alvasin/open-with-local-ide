import {
  openInIdeSuccessResponseSchema,
  type OpenInIdeRequest,
  type OpenInIdeSuccessResponse,
} from '@open-with-local-ide/protocol'
import { requestNativeHost, type NativeHostResult } from '@/native-messaging'

export type OpenInIdeResponse = NativeHostResult<OpenInIdeSuccessResponse>

/** Background side: sends the request to the native host. */
export const openInIde = async (request: OpenInIdeRequest): Promise<OpenInIdeResponse> =>
  requestNativeHost(request, openInIdeSuccessResponseSchema)
