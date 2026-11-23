import type { OpenInIdeRequest } from '@open-with-local-ide/protocol'
import { isRecord } from '@/shared/record/record.guard'

/** Messages between the popup, the content script, and the background. */
export type ExtensionMessage =
  /** popup → content script: which GitHub location is open in this tab. */
  | { type: 'getCurrentLocation' }
  /** popup, content script → background: relay the request to the native host. */
  | { type: 'openInIde'; request: OpenInIdeRequest }
  /** content script → background: content scripts cannot open extension pages themselves. */
  | { type: 'openOptions'; repoKey?: string }

/** Returns the message when it is a well-formed extension message, otherwise `null`. */
export const readExtensionMessage = (message: unknown): ExtensionMessage | null => {
  if (!isRecord(message)) return null

  switch (message.type) {
    case 'getCurrentLocation':
      return { type: message.type }
    case 'openInIde':
      // The native host validates the request strictly; only its presence is checked here.
      return isRecord(message.request) ? { type: message.type, request: message.request as OpenInIdeRequest } : null
    case 'openOptions':
      return message.repoKey === undefined || typeof message.repoKey === 'string'
        ? { type: message.type, repoKey: message.repoKey }
        : null
    default:
      return null
  }
}
