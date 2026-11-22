import type { NativeHostRequest } from '@open-with-local-ide/protocol'
import type { ZodType } from 'zod'
import { ExtensionNativeErrorCode } from './native-error.types'
import { parseNativeHostResponse, type NativeHostResult } from './native-response'
import { promisify } from '@/utils/promisify'

const NATIVE_HOST_NAME = 'com.local.repo_ide_opener'

const sendNativeMessage = async (message: object): Promise<unknown> =>
  promisify((callback) => {
    chrome.runtime.sendNativeMessage(NATIVE_HOST_NAME, message, callback)
  })

/** Sends a request to the native host and validates the response against the protocol schemas. */
export const requestNativeHost = async <TSuccess>(
  request: NativeHostRequest,
  successSchema: ZodType<TSuccess>,
): Promise<NativeHostResult<TSuccess>> => {
  let response: unknown

  try {
    response = await sendNativeMessage(request)
  } catch (error) {
    return {
      ok: false,
      errorCode: ExtensionNativeErrorCode.NativeHostConnectionFailed,
      error: error instanceof Error ? error.message : 'Failed to send native message',
    }
  }

  return parseNativeHostResponse(response, successSchema)
}
