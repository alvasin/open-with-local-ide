export enum NativeHostErrorCode {
  InvalidMessage = 'INVALID_MESSAGE',
  MessageTooLarge = 'MESSAGE_TOO_LARGE',
  UnsupportedAction = 'UNSUPPORTED_ACTION',
  InvalidRootPath = 'INVALID_ROOT_PATH',
  RootPathNotAbsolute = 'ROOT_PATH_NOT_ABSOLUTE',
  RootPathNotDirectory = 'ROOT_PATH_NOT_DIRECTORY',
  RootPathNotAllowed = 'ROOT_PATH_NOT_ALLOWED',
  ScanFailed = 'SCAN_FAILED',
  RepoPathMustBeAbsolute = 'REPO_PATH_MUST_BE_ABSOLUTE',
  RepoPathNotFound = 'REPO_PATH_NOT_FOUND',
  RepoPathNotDirectory = 'REPO_PATH_NOT_DIRECTORY',
  FilePathMustBeRelative = 'FILE_PATH_MUST_BE_RELATIVE',
  PathTraversalDetected = 'PATH_TRAVERSAL_DETECTED',
  FileNotFound = 'FILE_NOT_FOUND',
  IdeNotSupported = 'IDE_NOT_SUPPORTED',
  IdeNotFound = 'IDE_NOT_FOUND',
  IdeLaunchFailed = 'IDE_LAUNCH_FAILED',
  NativeHostFailed = 'NATIVE_HOST_FAILED',
}

export type NativeHostErrorDetailsByCode = {
  [NativeHostErrorCode.InvalidMessage]: undefined
  [NativeHostErrorCode.MessageTooLarge]: undefined
  [NativeHostErrorCode.UnsupportedAction]: { action?: string } | undefined
  [NativeHostErrorCode.InvalidRootPath]: { rootPath?: string } | undefined
  [NativeHostErrorCode.RootPathNotAbsolute]: { rootPath: string }
  [NativeHostErrorCode.RootPathNotDirectory]: { rootPath: string }
  [NativeHostErrorCode.RootPathNotAllowed]: { rootPath: string }
  [NativeHostErrorCode.ScanFailed]: undefined
  [NativeHostErrorCode.RepoPathMustBeAbsolute]: { repoPath: string }
  [NativeHostErrorCode.RepoPathNotFound]: { repoPath: string }
  [NativeHostErrorCode.RepoPathNotDirectory]: { repoPath: string }
  [NativeHostErrorCode.FilePathMustBeRelative]: { filePath: string }
  [NativeHostErrorCode.PathTraversalDetected]: { filePath: string }
  [NativeHostErrorCode.FileNotFound]: { filePath: string }
  [NativeHostErrorCode.IdeNotSupported]: { ide: string }
  [NativeHostErrorCode.IdeNotFound]: { ide: string }
  [NativeHostErrorCode.IdeLaunchFailed]: { ide: string; message?: string }
  [NativeHostErrorCode.NativeHostFailed]: undefined
}

export type NativeHostErrorDetails = NonNullable<NativeHostErrorDetailsByCode[NativeHostErrorCode]>

export type NativeHostErrorData = {
  [Code in NativeHostErrorCode]: NativeHostErrorDetailsByCode[Code] extends undefined
    ? { code: Code }
    : undefined extends NativeHostErrorDetailsByCode[Code]
      ? { code: Code; details?: NativeHostErrorDetailsByCode[Code] }
      : { code: Code; details: NativeHostErrorDetailsByCode[Code] }
}[NativeHostErrorCode]
