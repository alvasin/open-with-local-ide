import { NativeHostErrorCode } from '@open-with-local-ide/protocol'
import { ExtensionNativeErrorCode } from '@/native-messaging'

export type UiError = {
  message: string
  action?: 'openOptions'
}

const REPO_PATH_UNAVAILABLE: UiError = {
  message: 'Local repository path is not available. Check the repository mapping.',
  action: 'openOptions',
}

const DIRECTORY_NOT_FOUND: UiError = {
  message: 'Folder was not found in the local repository. Is the right branch checked out?',
}

/**
 * User-facing texts only for situations the user can act on. Every other code means a bug or an
 * unexpected state and falls back to a generic message that still shows the code for diagnostics.
 */
const UI_ERRORS: Partial<Record<string, UiError>> = {
  [ExtensionNativeErrorCode.NativeHostConnectionFailed]: {
    message: 'Native host is not installed or not responding.',
  },
  [NativeHostErrorCode.ProtocolVersionMismatch]: {
    message: 'Extension and native host versions do not match. Rebuild and reinstall the native host.',
  },
  [NativeHostErrorCode.RepoPathMustBeAbsolute]: REPO_PATH_UNAVAILABLE,
  [NativeHostErrorCode.RepoPathNotFound]: REPO_PATH_UNAVAILABLE,
  [NativeHostErrorCode.RepoPathNotDirectory]: REPO_PATH_UNAVAILABLE,
  [NativeHostErrorCode.FileNotFound]: {
    message: 'File was not found in the local repository. Is the right branch checked out?',
  },
  [NativeHostErrorCode.DirectoryNotFound]: DIRECTORY_NOT_FOUND,
  [NativeHostErrorCode.DirectoryPathNotDirectory]: DIRECTORY_NOT_FOUND,
  [NativeHostErrorCode.IdeNotFound]: { message: 'IDE was not found on this computer.' },
  [NativeHostErrorCode.IdeLaunchFailed]: { message: 'Failed to launch the IDE.' },
  [NativeHostErrorCode.InvalidRootPath]: {
    message: 'Folder does not exist or cannot be accessed.',
  },
  [NativeHostErrorCode.RootPathNotAbsolute]: { message: 'Folder path must be absolute.' },
  [NativeHostErrorCode.RootPathNotDirectory]: { message: 'The path is not a folder.' },
  [NativeHostErrorCode.RootPathNotAllowed]: {
    message: 'Scanning a whole drive or filesystem root is not allowed.',
  },
}

export const getUiError = (errorCode: string): UiError =>
  UI_ERRORS[errorCode] ?? {
    message: `Something went wrong (${errorCode}).`,
  }

export const getMissingRepoMappingError = (repoKey: string): UiError => ({
  message: `Local path for ${repoKey} is not configured.`,
  action: 'openOptions',
})
