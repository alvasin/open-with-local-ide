import type {
  NativeHostErrorCode,
  NativeHostErrorDetails,
  OpenInIdeRequest,
} from '@native-protocol'
import type { ExtensionNativeErrorCode } from '@/native-messaging/native-error.types'

export type OpenInIdeErrorCode = NativeHostErrorCode | ExtensionNativeErrorCode

export type OpenInIdeResponse =
  | { ok: true }
  | {
      ok: false
      errorCode: OpenInIdeErrorCode
      error: string
      details?: NativeHostErrorDetails
    }

export type CreateOpenInIdeRequestResult =
  | { ok: true; request: OpenInIdeRequest }
  | { ok: false; reason: 'missingRepoMapping'; repoKey: string }
