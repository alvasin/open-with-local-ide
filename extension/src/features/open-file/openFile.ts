import { NativeHostErrorCode } from '@native-protocol'
import type { CreateNativeOpenFileRequestResult, NativeOpenFileResponse, OpenMode } from './types'
import { ExtensionNativeErrorCode } from './types'
import type { ParsedRemoteFile } from '@/providers/types'
import type { ExtensionSettings } from '@/settings/settings.types'
import type { IdeId } from '@/shared/ide/ide.types'

const IDE_LABELS: Record<IdeId, string> = {
  vscode: 'VS Code',
}

export const getIdeLabel = (ide: IdeId): string => IDE_LABELS[ide] ?? ide

export const getMissingRepoMappingMessage = (repoKey: string): string =>
  `Local path for ${repoKey} is not configured. Open Options.`

export const getNativeHostUiMessage = (response: NativeOpenFileResponse): string => {
  if (response.ok) return ''

  switch (response.errorCode) {
    case NativeHostErrorCode.RepoPathMustBeAbsolute:
    case NativeHostErrorCode.RepoPathNotFound:
    case NativeHostErrorCode.RepoPathNotDirectory:
      return 'Local repository path is not available. Check Options.'
    case NativeHostErrorCode.FilePathMustBeRelative:
    case NativeHostErrorCode.PathTraversalDetected:
      return 'Remote file path is invalid.'
    case NativeHostErrorCode.FileNotFound:
      return 'File was not found in the local repository.'
    case NativeHostErrorCode.IdeNotSupported:
      return 'Selected IDE is not supported.'
    case NativeHostErrorCode.IdeNotFound:
      return 'IDE executable was not found.'
    case NativeHostErrorCode.IdeLaunchFailed:
      return 'Failed to launch IDE.'
    case NativeHostErrorCode.InvalidMessage:
    case NativeHostErrorCode.MessageTooLarge:
    case NativeHostErrorCode.UnsupportedAction:
    case NativeHostErrorCode.NativeHostFailed:
    case ExtensionNativeErrorCode.InvalidNativeHostResponse:
    case ExtensionNativeErrorCode.NativeHostConnectionFailed:
      return response.error
  }
}

export const createNativeOpenFileRequest = (
  remoteFile: ParsedRemoteFile,
  settings: ExtensionSettings,
  openMode: OpenMode = 'workspace',
): CreateNativeOpenFileRequestResult => {
  const repoPath = settings.mappings[remoteFile.repoKey]

  if (!repoPath) {
    return {
      ok: false,
      reason: 'missingRepoMapping',
      repoKey: remoteFile.repoKey,
    }
  }

  return {
    ok: true,
    request: {
      action: 'openFile',
      provider: remoteFile.provider,
      ide: settings.ide.selectedIde,
      repoKey: remoteFile.repoKey,
      repoPath,
      filePath: remoteFile.filePath ?? '.',
      line: remoteFile.line,
      openMode,
    },
  }
}
