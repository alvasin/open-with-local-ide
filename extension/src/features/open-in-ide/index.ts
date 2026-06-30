import { NativeHostErrorCode, type OpenInIdeRequest } from '@native-protocol'
import type { CreateOpenInIdeRequestResult, OpenInIdeResponse } from './open-in-ide.types'
import { ExtensionNativeErrorCode } from '@/native-messaging'
import type { ParsedRemoteLocation } from '@/providers/types'
import { isSameRepository } from '@/settings/mappings/mappings'
import type { ExtensionSettings } from '@/settings/settings.types'
import type { IdeId } from '@/shared/ide/ide.types'
export { openInIde } from './open-in-ide.native'

const IDE_LABELS: Record<IdeId, string> = {
  vscode: 'VS Code',
}

export const getIdeLabel = (ide: IdeId): string => IDE_LABELS[ide] ?? ide

export const getMissingRepoMappingMessage = (repoKey: string): string =>
  `Local path for ${repoKey} is not configured. Open Options.`

export const getNativeHostUiMessage = (response: OpenInIdeResponse): string => {
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
    case NativeHostErrorCode.InvalidRootPath:
    case NativeHostErrorCode.RootPathNotAbsolute:
    case NativeHostErrorCode.RootPathNotDirectory:
    case NativeHostErrorCode.RootPathNotAllowed:
    case NativeHostErrorCode.ScanFailed:
    case NativeHostErrorCode.InvalidMessage:
    case NativeHostErrorCode.MessageTooLarge:
    case NativeHostErrorCode.UnsupportedAction:
    case NativeHostErrorCode.NativeHostFailed:
    case ExtensionNativeErrorCode.InvalidNativeHostResponse:
    case ExtensionNativeErrorCode.NativeHostConnectionFailed:
      return response.error
  }
}

const createRequest = (
  remoteLocation: ParsedRemoteLocation,
  settings: ExtensionSettings,
  target: OpenInIdeRequest['target'],
): CreateOpenInIdeRequestResult => {
  const mapping = settings.mappings.find((candidate) =>
    isSameRepository(candidate, {
      provider: remoteLocation.provider,
      owner: remoteLocation.owner,
      repo: remoteLocation.repo,
    }),
  )

  if (!mapping) {
    return {
      ok: false,
      reason: 'missingRepoMapping',
      repoKey: remoteLocation.repoKey,
    }
  }

  return {
    ok: true,
    request: {
      action: 'openInIde',
      provider: remoteLocation.provider,
      ide: settings.ide.selectedIde,
      repoKey: remoteLocation.repoKey,
      repoPath: mapping.repoPath,
      target,
    },
  }
}

export const createOpenFileRequest = (
  remoteFile: ParsedRemoteLocation & { filePath: string },
  settings: ExtensionSettings,
): CreateOpenInIdeRequestResult =>
  createRequest(remoteFile, settings, {
    kind: 'file',
    filePath: remoteFile.filePath,
    line: remoteFile.line,
  })

export const createOpenRepositoryRequest = (
  remoteRepository: ParsedRemoteLocation,
  settings: ExtensionSettings,
): CreateOpenInIdeRequestResult =>
  createRequest(remoteRepository, settings, {
    kind: 'repository',
  })

export type {
  CreateOpenInIdeRequestResult,
  OpenInIdeErrorCode,
  OpenInIdeResponse,
} from './open-in-ide.types'
