import type { NativeHostErrorCode, NativeHostErrorDetails } from '@native-protocol'
import type { GitProviderId } from '@/providers/types'
import type { IdeId } from '@/shared/ide/ide.types'

export type OpenMode = 'file' | 'workspace'

export interface NativeOpenFileRequest {
  action: 'openFile'
  provider: GitProviderId
  ide: IdeId
  repoKey: string
  repoPath: string
  filePath: string
  line?: number
  openMode: OpenMode
}

export enum ExtensionNativeErrorCode {
  InvalidNativeHostResponse = 'INVALID_NATIVE_HOST_RESPONSE',
  NativeHostConnectionFailed = 'NATIVE_HOST_CONNECTION_FAILED',
}

export type NativeOpenFileErrorCode = NativeHostErrorCode | ExtensionNativeErrorCode

export type NativeOpenFileResponse =
  | { ok: true }
  | {
      ok: false
      errorCode: NativeOpenFileErrorCode
      error: string
      details?: NativeHostErrorDetails
    }

export type CreateNativeOpenFileRequestResult =
  | { ok: true; request: NativeOpenFileRequest }
  | { ok: false; reason: 'missingRepoMapping'; repoKey: string }
