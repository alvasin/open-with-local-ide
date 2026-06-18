#!/usr/bin/env node

import { NativeHostErrorCode } from '#native-protocol'
import { registerProcessErrorHandlers } from './errors/process-error-handlers.js'
import { handleNativeMessage } from './open-file/open-file.handler.js'
import {
  readInput,
  readNativeMessage,
  writeNativeMessage,
} from './native-messaging/native-message.protocol.js'
import {
  createNativeHostErrorResponse,
  NativeHostError,
  type NativeHostResponse,
} from './native-messaging/native-message.types.js'
import { log, logError } from './utils/logger.js'

registerProcessErrorHandlers()

const createErrorResponse = (error: unknown): NativeHostResponse => {
  if (error instanceof NativeHostError) {
    return {
      ok: false,
      errorCode: error.code,
      error: error.safeMessage,
      ...(error.details ? { details: error.details } : {}),
    }
  }

  if (error instanceof SyntaxError) {
    return createNativeHostErrorResponse({ code: NativeHostErrorCode.InvalidMessage })
  }

  return createNativeHostErrorResponse({ code: NativeHostErrorCode.NativeHostFailed })
}

const getMessageLogContext = (message: unknown): Record<string, unknown> => {
  if (!message || typeof message !== 'object') return { action: 'unknown' }

  const record = message as Record<string, unknown>

  return {
    action: typeof record.action === 'string' ? record.action : 'unknown',
    ide: typeof record.ide === 'string' ? record.ide : undefined,
    provider: typeof record.provider === 'string' ? record.provider : undefined,
    repoKey: typeof record.repoKey === 'string' ? record.repoKey : undefined,
  }
}

const main = async () => {
  try {
    log({ event: 'host.started' })

    const input = await readInput()
    const message = readNativeMessage(input)

    log({ event: 'host.message.received', ...getMessageLogContext(message) })

    const response = await handleNativeMessage(message)

    log({
      event: 'host.response.created',
      ok: response.ok,
      errorCode: response.ok ? undefined : response.errorCode,
      ...getMessageLogContext(message),
    })
    await writeNativeMessage(response)
  } catch (error) {
    const response = createErrorResponse(error)

    logError(error, { event: 'host.error' })

    await writeNativeMessage(response)
  } finally {
    process.stdin.destroy()
  }
}

void main()
