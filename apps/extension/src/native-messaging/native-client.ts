import { PROTOCOL_VERSION, type NativeHostRequest } from '@open-with-local-ide/protocol'
import type { ZodType } from 'zod'
import { ExtensionNativeErrorCode } from './native-error.types'
import { parseNativeHostResponse, type NativeHostResult } from './native-response'
import { promisify } from '@/utils/promisify'

const NATIVE_HOST_NAME = 'com.local.repo_ide_opener'

const sendNativeMessage = async (message: object): Promise<unknown> =>
  promisify((callback) => {
    chrome.runtime.sendNativeMessage(NATIVE_HOST_NAME, message, callback)
  })

/**
 * Sends a request to the native host and validates the response against the protocol schemas.
 * Every request is stamped with the protocol version this extension build was compiled with.
 */
export const requestNativeHost = async <TSuccess>(
  request: NativeHostRequest,
  successSchema: ZodType<TSuccess>,
): Promise<NativeHostResult<TSuccess>> => {
  let response: unknown

  try {
    response = await sendNativeMessage({ ...request, protocolVersion: PROTOCOL_VERSION })
  } catch (error) {
    return {
      ok: false,
      errorCode: ExtensionNativeErrorCode.NativeHostConnectionFailed,
      ...(error instanceof Error ? { details: { message: error.message } } : {}),
    }
  }

  return parseNativeHostResponse(response, successSchema)
}
