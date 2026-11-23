import {
  scanRepositoriesSuccessResponseSchema,
  type ScanRepositoriesRequest,
  type ScanRepositoriesSuccessResponse,
} from '@open-with-local-ide/protocol'
import { requestNativeHost, type NativeHostResult } from '@/native-messaging'

export type ScanRepositoriesNativeResponse = NativeHostResult<ScanRepositoriesSuccessResponse>

export const scanRepositoriesInHost = async (
  request: ScanRepositoriesRequest,
): Promise<ScanRepositoriesNativeResponse> => requestNativeHost(request, scanRepositoriesSuccessResponseSchema)
