import type { OpenInIdeRequest } from './actions/open-in-ide.js'
import type { ScanRepositoriesRequest } from './actions/scan-repositories.js'

export { NativeHostErrorCode } from './errors.js'
export {
  nativeHostErrorResponseSchema,
  type NativeHostErrorData,
  type NativeHostErrorDetails,
  type NativeHostErrorResponse,
} from './schemas.js'
export {
  openInIdeRequestSchema,
  openInIdeSuccessResponseSchema,
  type OpenInIdeRequest,
  type OpenInIdeSuccessResponse,
  type OpenInIdeTarget,
  type ParsedOpenInIdeRequest,
} from './actions/open-in-ide.js'
export {
  MAX_SCAN_DEPTH,
  scanRepositoriesRequestSchema,
  scanRepositoriesSuccessResponseSchema,
  type DiscoveredRepository,
  type ScanRepositoriesRequest,
  type ScanRepositoriesSuccessResponse,
  type ScanSkippedEntry,
  type ScanSkippedReason,
} from './actions/scan-repositories.js'

export type NativeHostRequest = OpenInIdeRequest | ScanRepositoriesRequest
