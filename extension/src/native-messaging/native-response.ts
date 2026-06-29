import { NativeHostErrorCode, type NativeHostErrorDetails } from '@native-protocol'
import { isRecord } from '@/shared/record/record.guard'

const isNativeHostErrorCode = (value: unknown): value is NativeHostErrorCode =>
  typeof value === 'string' &&
  Object.values(NativeHostErrorCode).includes(value as NativeHostErrorCode)

export const readNativeHostDetails = (value: unknown): NativeHostErrorDetails | undefined =>
  isRecord(value) ? value : undefined

export type NativeHostErrorResponseLike = {
  ok: false
  errorCode: NativeHostErrorCode
  error: string
  details?: unknown
}

export const isNativeHostErrorResponseLike = (
  value: unknown,
): value is NativeHostErrorResponseLike =>
  isRecord(value) &&
  value.ok === false &&
  isNativeHostErrorCode(value.errorCode) &&
  typeof value.error === 'string'
