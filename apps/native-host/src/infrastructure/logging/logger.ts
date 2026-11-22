import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CURRENT_FILE = fileURLToPath(import.meta.url)
const NATIVE_HOST_ROOT = path.resolve(path.dirname(CURRENT_FILE), '..', '..')
const LOG_DIR = path.join(NATIVE_HOST_ROOT, '.logs')
const LOG_FILE = path.join(LOG_DIR, 'native-host.log')

const normalizeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    message: String(error),
  }
}

export const log = (message: unknown) => {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true })

    const line = `[${new Date().toISOString()}] ${JSON.stringify(message)}\n`
    fs.appendFileSync(LOG_FILE, line)
  } catch {
    // Native Messaging uses stdout for protocol responses, so logger failures stay silent.
  }
}

export const logError = (error: unknown, context: Record<string, unknown> = {}) => {
  log({
    ...context,
    error: normalizeError(error),
  })
}
