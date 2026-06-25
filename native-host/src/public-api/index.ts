export {
  NativeHostErrorCode,
  type NativeHostErrorData,
  type NativeHostErrorDetails,
  type NativeHostErrorDetailsByCode,
} from './native-protocol/errors.js'
export type { OpenInIdeRequest, OpenInIdeTarget } from './native-protocol/open-in-ide.js'
export type {
  DiscoveredRepository,
  ScanRepositoriesRequest,
  ScanRepositoriesSuccessResponse,
  ScanSkippedEntry,
  ScanSkippedReason,
} from './native-protocol/repository-scanning.js'
