import type {
  ScanRepositoriesRequest,
  ScanRepositoriesSuccessResponse,
  ScanSkippedReason,
} from '@native-protocol'
import { sendNativeMessage } from '@/native-messaging/native-client'
import { ExtensionNativeErrorCode } from '@/native-messaging/native-error.types'
import {
  isNativeHostErrorResponseLike,
  readNativeHostDetails,
  type NativeHostErrorResponseLike,
} from '@/native-messaging/native-response'
import { isRecord } from '@/shared/record/record.guard'

const SCAN_SKIPPED_REASONS = new Set<ScanSkippedReason>([
  'permission_denied',
  'missing_git_config',
  'invalid_git_config',
  'missing_remote',
  'unsupported_remote',
  'scan_depth_exceeded',
  'unknown_error',
])

const isScanRepositoriesSuccessResponse = (
  value: unknown,
): value is ScanRepositoriesSuccessResponse =>
  isRecord(value) &&
  value.ok === true &&
  Array.isArray(value.repositories) &&
  value.repositories.every(
    (repository) =>
      isRecord(repository) &&
      repository.provider === 'github' &&
      typeof repository.owner === 'string' &&
      typeof repository.repo === 'string' &&
      typeof repository.repoPath === 'string' &&
      typeof repository.remoteName === 'string',
  ) &&
  Array.isArray(value.skipped) &&
  value.skipped.every(
    (entry) =>
      isRecord(entry) &&
      typeof entry.path === 'string' &&
      typeof entry.reason === 'string' &&
      SCAN_SKIPPED_REASONS.has(entry.reason as ScanSkippedReason),
  )

export type ScanRepositoriesNativeResponse =
  | ScanRepositoriesSuccessResponse
  | NativeHostErrorResponseLike
  | {
      ok: false
      errorCode: ExtensionNativeErrorCode
      error: string
    }

export const scanRepositoriesInHost = async (
  request: ScanRepositoriesRequest,
): Promise<ScanRepositoriesNativeResponse> => {
  try {
    const response = await sendNativeMessage(request)
    if (isScanRepositoriesSuccessResponse(response)) return response

    if (isNativeHostErrorResponseLike(response)) {
      return {
        ok: false,
        errorCode: response.errorCode,
        error: response.error,
        details: readNativeHostDetails(response.details),
      }
    }

    return {
      ok: false,
      errorCode: ExtensionNativeErrorCode.InvalidNativeHostResponse,
      error: 'Native host returned an invalid response',
    }
  } catch (error) {
    return {
      ok: false,
      errorCode: ExtensionNativeErrorCode.NativeHostConnectionFailed,
      error: error instanceof Error ? error.message : 'Failed to send native message',
    }
  }
}
